const N8NWorkflowService = require('../services/n8nWorkflowService');

const getWorkflowInfo = async (req, res) => {
  try {
    const result = await N8NWorkflowService.getWorkflowInfo();

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const executeWorkflow = async (req, res) => {
  try {
    const { language1, language2, lyrics, moodEnabled, moodTopK } = req.body;

    if (!lyrics) {
      return res.status(400).json({
        success: false,
        message: 'Lyrics is required',
        error: 'Missing required field: lyrics'
      });
    }

    const result = await N8NWorkflowService.executeWorkflow({
      language1,
      language2,
      lyrics,
      moodEnabled,
      moodTopK
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getWorkflowInfo,
  executeWorkflow
};

