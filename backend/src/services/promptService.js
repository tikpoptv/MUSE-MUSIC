const DatabaseService = require('./databaseService');
const { config } = require('../config/env');
const { logger } = require('../middleware/logger');

class PromptService {
  /**
   * Save prompt to production workflow and database
   * @param {string} promptText - The new prompt text to save
   * @param {string} userId - User ID who is saving the prompt
   * @returns {Promise<object>} - Success status and saved prompt data
   */
  static async savePrompt(promptText, userId) {
    try {
      logger.info('Starting prompt save process', {
        promptLength: promptText.length,
        userId
      });

      // Step 1: Update production N8N workflow
      logger.info('Step 1: Updating production N8N workflow');
      await this.updateProductionWorkflow(promptText);

      // Step 2: Save to database
      logger.info('Step 2: Saving prompt to database');
      const savedPrompt = await this.saveToDatabase(promptText, userId);

      logger.info('Prompt saved successfully', {
        promptID: savedPrompt.promptid
      });

      return {
        success: true,
        message: 'Prompt saved successfully',
        data: {
          promptID: savedPrompt.promptid,
          promptText: savedPrompt.prompttext,
          isActive: savedPrompt.isactive,
          updatedAt: savedPrompt.updatedat
        }
      };
    } catch (error) {
      logger.error('Error saving prompt:', error);
      throw error;
    }
  }

  /**
   * Update production N8N workflow with new prompt
   * @param {string} promptText - The new prompt text
   */
  static async updateProductionWorkflow(promptText) {
    try {
      const workflowUrl = config.n8n.workflowUrl;
      const apiKey = config.n8n.apiKey;

      if (!workflowUrl) {
        throw new Error('N8N_WORKFLOW_URL not configured');
      }

      // Get current workflow
      const getResponse = await fetch(workflowUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!getResponse.ok) {
        throw new Error(`Failed to get workflow: ${getResponse.status}`);
      }

      const workflow = await getResponse.json();

      // Update AI Agent node prompt
      const aiAgentNode = workflow.nodes?.find(node => node.name === 'AI Agent');
      if (!aiAgentNode) {
        throw new Error('AI Agent node not found in workflow');
      }

      aiAgentNode.parameters.text = promptText;

      // Prepare workflow data
      const updateData = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings
      };

      // Update workflow
      const putResponse = await fetch(workflowUrl, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        throw new Error(`Failed to update workflow: ${putResponse.status} - ${errorText}`);
      }

      logger.info('Production workflow updated successfully');
      return await putResponse.json();
    } catch (error) {
      logger.error('Error updating production workflow:', error);
      throw error;
    }
  }

  /**
   * Save prompt to database
   * @param {string} promptText - The prompt text
   * @param {string} userId - User ID
   */
  static async saveToDatabase(promptText, userId) {
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
          SET 
            promptText = $1, 
            isActive = TRUE,
            updatedAt = CURRENT_TIMESTAMP
          WHERE promptID = $2
          RETURNING *
        `;
        const result = await DatabaseService.query(updateQuery, [promptText, promptID]);
        logger.info(`Updated prompt with promptID: ${promptID}`);
        return result.rows[0];
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO Prompts (promptType, promptText, isActive, createdAt, updatedAt)
          VALUES ('both', $1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `;
        const result = await DatabaseService.query(insertQuery, [promptText]);
        logger.info(`Created new prompt with promptID: ${result.rows[0].promptid}`);
        return result.rows[0];
      }
    } catch (error) {
      logger.error('Error saving prompt to database:', error);
      throw error;
    }
  }
}

module.exports = PromptService;

