const { logger } = require('../middleware/logger');
const { config } = require('../config/env');

class N8NService {
  static async sendEmailWebhook(emailData) {
    try {
      const webhookUrl = config.EMAIL.webhookUrl;
      
      if (!webhookUrl) {
        throw new Error('Email webhook URL not configured');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${config.EMAIL.username}:${config.EMAIL.password}`).toString('base64')}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`N8N webhook failed: ${response.status} - ${errorText}`);
      }

      // Try to parse JSON, but handle non-JSON responses
      let result;
      const responseText = await response.text();
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If response is not JSON, treat as success with text response
        result = { message: responseText, status: response.status };
        logger.info('N8N webhook returned non-JSON response:', { responseText });
      }

      logger.info('N8N email webhook sent successfully:', { result });
      
      return { 
        success: true, 
        message: 'Email webhook sent successfully',
        data: result 
      };

    } catch (error) {
      logger.error('Failed to send N8N email webhook:', error);
      return { 
        success: false, 
        message: 'Failed to send email webhook',
        error: error.message 
      };
    }
  }
}

module.exports = N8NService;
