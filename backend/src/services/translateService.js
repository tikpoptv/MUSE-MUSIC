const { config } = require('../config/env');
const { logger } = require('../middleware/logger');

class TranslateService {
    static async getTranslate(language1, language2, lyrics, moodEnabled = null, moodTopK = 4) {
        const translateWebHookURL = config.n8n.translateWebHook;
        
        if (!translateWebHookURL) {
            logger.error('Translate webhook URL is not configured. Please set TRANSLATE_WEBHOOK in environment variables.');
            return { 
                success: false, 
                message: 'Translate webhook URL is not configured',
                error: 'TRANSLATE_WEBHOOK environment variable is missing'
            };
        }
        
        if (!lyrics || lyrics.trim() === '') {
            logger.error('Lyrics text is empty');
            return { 
                success: false, 
                message: 'Lyrics text is required for translation',
                error: 'Lyrics cannot be empty'
            };
        }
        
        try {
            const data = {
                language1: language1,
                language2: language2,
                lyrics: lyrics
            };
            
            // Add mood parameters if moodEnabled is provided
            if (moodEnabled !== null && moodEnabled !== undefined) {
                data.moodEnabled = moodEnabled;
                if (moodTopK !== null && moodTopK !== undefined) {
                    data.moodTopK = moodTopK;
                }
            }
            
            logger.info('Calling translate webhook:', { 
                url: translateWebHookURL,
                language1, 
                language2, 
                lyricsLength: lyrics.length,
                moodEnabled: moodEnabled !== null && moodEnabled !== undefined ? moodEnabled : null,
                moodTopK: moodEnabled !== null && moodEnabled !== undefined ? moodTopK : null
            });
            
            const response = await fetch(translateWebHookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                logger.error('N8N webhook failed:', { 
                    status: response.status, 
                    statusText: response.statusText,
                    errorText 
                });
                throw new Error(`N8N webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            let result;
            const responseText = await response.text();
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                logger.info('N8N webhook returned non-JSON response:', { responseText });
                result = { message: responseText, status: response.status };
            }

            logger.info('Translate webhook successful');
            return { 
                success: true, 
                message: 'Translation completed successfully',
                data: result 
            };
        } catch (error) {
            logger.error('Error calling translate webhook:', { 
                error: error.message,
                url: translateWebHookURL,
                stack: error.stack 
            });
            return { 
                success: false, 
                message: 'Failed to call translate webhook',
                error: error.message 
            };
        }
    }
}

module.exports = TranslateService;