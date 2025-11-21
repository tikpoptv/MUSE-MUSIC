const { logger } = require('../middleware/logger');
const { config } = require('../config/env');
const { DEFAULT_ORIGINAL_LANGUAGE, DEFAULT_TARGET_LANGUAGE } = require('../utils/languageUtils');

class N8NWorkflowService {
  static async getWorkflowInfo() {
    if (!config.n8n.apiKey || config.n8n.apiKey === 'your-n8n-api-key-here') {
      logger.error('N8N API key is not configured');
      return {
        success: false,
        message: 'N8N API key is not configured',
        error: 'N8N_API_KEY environment variable is missing'
      };
    }

    if (!config.n8n.workflowUrl || config.n8n.workflowUrl.includes('example.com') || config.n8n.workflowUrl.includes('your-workflow-id')) {
      logger.error('N8N workflow URL is not configured');
      return {
        success: false,
        message: 'N8N workflow URL is not configured',
        error: 'N8N_WORKFLOW_URL environment variable is missing'
      };
    }

    try {
      const workflowId = config.n8n.workflowUrl.split('/').pop();
      const baseUrl = config.n8n.workflowUrl.replace(`/workflows/${workflowId}`, '');
      const workflowInfoUrl = `${baseUrl}/workflows/${workflowId}`;

      logger.info('Fetching N8N workflow info:', { url: workflowInfoUrl });

      const response = await fetch(workflowInfoUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': config.n8n.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('N8N workflow info fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`N8N workflow info fetch failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const workflowData = await response.json();
      
      const aiAgentNode = workflowData.nodes?.find(node => node.name === 'AI Agent');
      const prompt = aiAgentNode?.parameters?.text || null;
      
      logger.info('N8N workflow info fetched successfully');
      return {
        success: true,
        message: 'Workflow info retrieved successfully',
        data: {
          workflow: {
            id: workflowData.id,
            name: workflowData.name,
            active: workflowData.active
          },
          prompt: prompt
        }
      };
    } catch (error) {
      logger.error('Error fetching N8N workflow info:', {
        error: error.message,
        url: config.n8n.workflowUrl,
        stack: error.stack
      });
      return {
        success: false,
        message: 'Failed to fetch N8N workflow info',
        error: error.message
      };
    }
  }

  static async executeWorkflow(body) {
    const { language1, language2, lyrics, moodEnabled, moodTopK } = body;
    
    if (!config.n8n.apiKey || config.n8n.apiKey === 'your-n8n-api-key-here') {
      logger.error('N8N API key is not configured');
      return {
        success: false,
        message: 'N8N API key is not configured',
        error: 'N8N_API_KEY environment variable is missing'
      };
    }

    if (!config.n8n.workflowUrl || config.n8n.workflowUrl.includes('example.com') || config.n8n.workflowUrl.includes('your-workflow-id')) {
      logger.error('N8N workflow URL is not configured');
      return {
        success: false,
        message: 'N8N workflow URL is not configured',
        error: 'N8N_WORKFLOW_URL environment variable is missing'
      };
    }

    if (!lyrics || lyrics.trim() === '') {
      logger.error('Lyrics text is empty');
      return {
        success: false,
        message: 'Lyrics text is required',
        error: 'Lyrics cannot be empty'
      };
    }

    try {
      const requestBody = {
        language1: language1 || DEFAULT_ORIGINAL_LANGUAGE,
        language2: language2 || DEFAULT_TARGET_LANGUAGE,
        lyrics: lyrics
      };

      if (moodEnabled !== null && moodEnabled !== undefined) {
        requestBody.moodEnabled = moodEnabled;
        if (moodTopK !== null && moodTopK !== undefined) {
          requestBody.moodTopK = moodTopK;
        }
      }

      logger.info('Calling N8N workflow:', {
        url: config.n8n.workflowUrl,
        language1: requestBody.language1,
        language2: requestBody.language2,
        lyricsLength: lyrics.length,
        moodEnabled: requestBody.moodEnabled !== undefined ? requestBody.moodEnabled : null,
        moodTopK: requestBody.moodTopK !== undefined ? requestBody.moodTopK : null
      });

      const response = await fetch(config.n8n.workflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': config.n8n.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('N8N workflow failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`N8N workflow failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      let result;
      const responseText = await response.text();

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        logger.info('N8N workflow returned non-JSON response:', { responseText });
        result = { message: responseText, status: response.status };
      }

      logger.info('N8N workflow executed successfully');
      return {
        success: true,
        message: 'Workflow executed successfully',
        data: result
      };
    } catch (error) {
      logger.error('Error calling N8N workflow:', {
        error: error.message,
        url: config.n8n.workflowUrl,
        stack: error.stack
      });
      return {
        success: false,
        message: 'Failed to execute N8N workflow',
        error: error.message
      };
    }
  }
}

module.exports = N8NWorkflowService;

