const { config } = require('../config/env');
const { logger } = require('../middleware/logger');

class TranslateService {
    static async getTranslate(language1, language2, lyrics) {
        const translateWebHookURL = config.n8n.translateWebHook
        try {
            const data = {
                language1: language1,
                language2: language2,
                lyrics:lyrics
            };
            const response = await fetch(translateWebHookURL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`N8N webhook failed: ${response.status} - ${errorText}`);
            }
            let result;
            const responseText = await response.text();
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                // If response is not JSON, treat as success with text response
                result = { message: responseText, status: response.status };
                logger.info('N8N webhook returned non-JSON response:', { responseText });
            }

            return { 
                success: true, 
                message: 'Email webhook sent successfully',
                data: result 
            };
        } catch (error) {
            console.error('Error sending data to n8n:', error);
            return { 
                success: false, 
                message: 'Failed to send email webhook',
                error: error.message 
            };
        }
        //return null;
    }
}

module.exports = TranslateService;