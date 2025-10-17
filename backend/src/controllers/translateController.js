const { pool } = require('../config/database');
const TranslateService = require('../services/translateService');

const getTranslate = async (req, res) => {
    try {
        const { language1, language2, lyrics } = req.body;
        const translation = await TranslateService.getTranslate(language1, language2, lyrics);
        res.json(translation);
        //res.json({message:"Success kubb"})
    } catch (err) {
        // logger.error('Error fetching user data:', err);
        res.status(500).json({message:"Internal Server Error!! fr???"});
    }
}

module.exports = { getTranslate };