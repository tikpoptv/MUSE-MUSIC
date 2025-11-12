const DatabaseService = require('./databaseService');
const { config } = require('../config/env');
const { logger } = require('../middleware/logger');

class PromptTestService {
  /**
   * Test a new prompt by comparing results with original prompt
   * Steps:
   * 1. Get original prompt from production n8n workflow
   * 2. Save original prompt to Prompts.temp (backup)
   * 3. Setup test workflow with original prompt
   * 4. Run analysis with original prompt on test workflow
   * 5. Update test workflow with new prompt
   * 6. Run analysis with new prompt on test workflow
   * 7. Compare results (original vs new)
   * 8. Restore test workflow back to original prompt (cleanup)
   * 9. Return comparison results
   * 
   * Note: Production workflow is never modified, all testing uses separate test workflow
   */
  static async testPrompt(testData) {
    const { 
      newPromptText, 
      lyrics, 
      language1, 
      language2, 
      moodEnabled = true, 
      moodTopK = 4
    } = testData;

    let originalPromptText = null;
    let originalPromptRestored = false;

    try {
      // Step 1: Get original prompt from n8n workflow
      logger.info('Step 1: Getting original prompt from n8n');
      const workflowData = await this.getWorkflowPrompt();
      originalPromptText = workflowData.promptText;

      // Debug: Compare original vs new prompt
      logger.info('Prompt comparison:', {
        originalLength: originalPromptText?.length || 0,
        newLength: newPromptText.length,
        areSame: originalPromptText === newPromptText,
        originalFirst100: (originalPromptText || '').substring(0, 100),
        newFirst100: newPromptText.substring(0, 100)
      });

      if (!originalPromptText) {
        throw new Error('Failed to retrieve original prompt from n8n workflow');
      }

      // Step 2: Save original prompt to database (temp field)
      logger.info('Step 2: Saving original prompt to database');
      await this.savePromptToTemp(originalPromptText);

      // Step 3: Setup test workflow with original prompt
      logger.info('Step 3: Setting up test workflow with original prompt');
      await this.updateWorkflowPrompt(originalPromptText, true);
      
      // Wait for N8N to apply changes (prevent race condition)
      logger.info('Waiting for N8N to apply changes...');
      await this.delay(2000); // 2 second delay

      // Step 4: Prepare test input
      const testInput = {
        lyrics,
        language1,
        language2,
        moodEnabled,
        moodTopK
      };

      // Step 5: Run analysis with original prompt
      logger.info('Step 5: Running analysis with original prompt on test workflow');
      logger.info('Test input for original:', {
        lyricsLength: testInput.lyrics.length,
        language1: testInput.language1,
        language2: testInput.language2,
        moodEnabled: testInput.moodEnabled
      });
      const originalResult = await this.runAnalysis(testInput);
      logger.info('Original result received:', {
        hasTranslation: !!originalResult.translation,
        hasInterpretation: !!originalResult.interpretation,
        hasMood: !!originalResult.moodAnalyze
      });

      // Step 6: Update test workflow with new prompt
      logger.info('Step 6: Updating test workflow with new prompt');
      await this.updateWorkflowPrompt(newPromptText, true);
      
      // Wait for N8N to apply changes (prevent race condition)
      logger.info('Waiting for N8N to apply changes...');
      await this.delay(2000); // 2 second delay
      
      // Step 7: Run analysis with new prompt
      logger.info('Step 7: Running analysis with new prompt on test workflow');
      logger.info('Test input for new prompt:', {
        lyricsLength: testInput.lyrics.length,
        language1: testInput.language1,
        language2: testInput.language2,
        moodEnabled: testInput.moodEnabled
      });
      const newResult = await this.runAnalysis(testInput);
      logger.info('New result received:', {
        hasTranslation: !!newResult.translation,
        hasInterpretation: !!newResult.interpretation,
        hasMood: !!newResult.moodAnalyze
      });

      // Step 8: Restore test workflow to original prompt (cleanup)
      logger.info('Step 8: Restoring test workflow to original prompt (cleanup)');
      await this.updateWorkflowPrompt(originalPromptText, true);
      originalPromptRestored = true;

      // Step 9: Compare and return results
      logger.info('Step 9: Comparing results and returning data');
      return {
        original: {
          prompt: originalPromptText,
          result: originalResult
        },
        new: {
          prompt: newPromptText,
          result: newResult
        },
        comparison: this.compareResults(originalResult, newResult)
      };

    } catch (error) {
      logger.error('Error in testPrompt:', error);

      // Attempt to restore original prompt to test workflow if it hasn't been restored
      if (originalPromptText && !originalPromptRestored) {
        try {
          logger.info('Attempting to restore original prompt to test workflow after error');
          await this.updateWorkflowPrompt(originalPromptText, true);
        } catch (restoreError) {
          logger.error('Failed to restore original prompt to test workflow:', restoreError);
        }
      }

      throw error;
    }
  }

  /**
   * Helper function to create fetch with timeout
   */
  static async fetchWithTimeout(url, options, timeoutMs = 300000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * Get prompt from n8n workflow
   */
  static async getWorkflowPrompt() {
    try {
      const workflowUrl = config.n8n.workflowUrl;
      const apiKey = config.n8n.apiKey;

      const response = await this.fetchWithTimeout(workflowUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      }, 300000); // 5 minutes timeout

      if (!response.ok) {
        throw new Error(`Failed to get workflow: ${response.status} ${response.statusText}`);
      }

      const workflow = await response.json();
      
      // Find AI Agent node and extract prompt
      const aiAgentNode = workflow.nodes?.find(node => node.name === 'AI Agent');
      if (!aiAgentNode) {
        throw new Error('AI Agent node not found in workflow');
      }

      const promptText = aiAgentNode.parameters?.text;
      if (!promptText) {
        throw new Error('Prompt text not found in AI Agent node');
      }

      return {
        promptText,
        workflow
      };
    } catch (error) {
      logger.error('Error getting workflow prompt:', error);
      throw error;
    }
  }

  /**
   * Update prompt in n8n workflow (using test workflow for testing)
   */
  static async updateWorkflowPrompt(newPromptText, useTestWorkflow = true) {
    try {
      // Use test workflow URL for testing, production for original restoration
      const workflowUrl = useTestWorkflow ? config.n8n.workflowTestUrl : config.n8n.workflowUrl;
      const apiKey = config.n8n.apiKey;

      if (!workflowUrl) {
        throw new Error(`Workflow URL not configured (test: ${useTestWorkflow})`);
      }

      // Get current workflow
      const getResponse = await this.fetchWithTimeout(workflowUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      }, 300000); // 5 minutes timeout

      if (!getResponse.ok) {
        throw new Error(`Failed to get workflow: ${getResponse.status}`);
      }

      const workflow = await getResponse.json();

      // Update AI Agent node prompt
      const aiAgentNode = workflow.nodes?.find(node => node.name === 'AI Agent');
      if (!aiAgentNode) {
        throw new Error('AI Agent node not found');
      }

      // Debug: Log prompt update details
      logger.info('Updating AI Agent prompt:', {
        workflowName: workflow.name,
        useTestWorkflow,
        oldPromptLength: aiAgentNode.parameters.text?.length || 0,
        newPromptLength: newPromptText.length,
        oldPromptPreview: (aiAgentNode.parameters.text || '').substring(0, 100),
        newPromptPreview: newPromptText.substring(0, 100)
      });

      aiAgentNode.parameters.text = newPromptText;

      // Prepare workflow data (only include necessary fields)
      const updateData = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings
      };

      // Update workflow
      const putResponse = await this.fetchWithTimeout(workflowUrl, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }, 300000); // 5 minutes timeout

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        throw new Error(`Failed to update workflow: ${putResponse.status} - ${errorText}`);
      }

      logger.info(`Updated workflow prompt (test: ${useTestWorkflow})`);
      return await putResponse.json();
    } catch (error) {
      logger.error('Error updating workflow prompt:', error);
      throw error;
    }
  }

  /**
   * Save original prompt to Prompts.temp field
   */
  static async savePromptToTemp(promptText) {
    try {
      // Find existing prompt record with promptType = 'both'
      const findQuery = `
        SELECT promptID FROM Prompts 
        WHERE promptType = 'both' AND isActive = TRUE
        LIMIT 1
      `;
      const findResult = await DatabaseService.query(findQuery);

      if (findResult.rows.length > 0) {
        // Update existing record
        const promptID = findResult.rows[0].promptid;
        const updateQuery = `
          UPDATE Prompts 
          SET temp = $1, updatedAt = CURRENT_TIMESTAMP
          WHERE promptID = $2
          RETURNING promptID
        `;
        await DatabaseService.query(updateQuery, [promptText, promptID]);
        logger.info(`Updated temp prompt for promptID: ${promptID}`);
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO Prompts (promptType, promptText, temp, isActive, createdAt, updatedAt)
          VALUES ('both', $1, $1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING promptID
        `;
        const insertResult = await DatabaseService.query(insertQuery, [promptText]);
        logger.info(`Created new prompt with promptID: ${insertResult.rows[0].promptid}`);
      }

      return true;
    } catch (error) {
      logger.error('Error saving prompt to temp:', error);
      throw error;
    }
  }

  /**
   * Run analysis using test webhook (without saving to database)
   */
  static async runAnalysis(testInput) {
    try {
      const testWebhook = config.n8n.translateTestWebHook;
      
      if (!testWebhook) {
        throw new Error('TRANSLATE_TEST_WEBHOOK not configured');
      }

      const response = await this.fetchWithTimeout(testWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testInput)
      }, 300000); // 5 minutes timeout

      if (!response.ok) {
        throw new Error(`Test analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('Error running test analysis:', error);
      throw error;
    }
  }

  /**
   * Compare results from original and new prompts
   */
  static compareResults(originalResult, newResult) {
    return {
      translationChanged: originalResult.translation !== newResult.translation,
      interpretationChanged: originalResult.interpretation !== newResult.interpretation,
      moodChanged: JSON.stringify(originalResult.moodAnalyze) !== JSON.stringify(newResult.moodAnalyze),
      summary: {
        hasChanges: (
          originalResult.translation !== newResult.translation ||
          originalResult.interpretation !== newResult.interpretation ||
          JSON.stringify(originalResult.moodAnalyze) !== JSON.stringify(newResult.moodAnalyze)
        )
      }
    };
  }

  /**
   * Helper function to add delay (prevent race conditions with N8N)
   */
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = PromptTestService;

