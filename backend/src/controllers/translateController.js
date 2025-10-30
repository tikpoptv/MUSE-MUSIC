const TranslateService = require('../services/translateService');
const { successResponse, errorResponse } = require('../utils/response');

const getTranslate = async (req, res) => {
    try {
        const { language1, language2, lyrics } = req.body;
        const translation = await TranslateService.getTranslate(language1, language2, lyrics);
        res.json(successResponse('Translation successful', translation));
    } catch (err) {
        res.status(500).json(errorResponse('Internal Server Error', 500, err));
    }
}

module.exports = { getTranslate };