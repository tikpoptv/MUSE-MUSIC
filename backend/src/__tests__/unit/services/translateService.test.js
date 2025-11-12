/* eslint-env jest */
const TranslateService = require('../../../services/translateService');
const { config } = require('../../../config/env');

// Mock dependencies
jest.mock('../../../config/env', () => ({
  config: {
    n8n: {
      translateWebHook: 'https://n8n.test.com/webhook/translate'
    }
  }
}));

jest.mock('../../../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Mock global fetch
global.fetch = jest.fn();

describe('TranslateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTranslate', () => {
    it('should translate successfully with basic parameters', async () => {
      const mockResponse = {
        translatedText: 'Hello World',
        detectedLanguage: 'en'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await TranslateService.getTranslate(
        'th',
        'en',
        'สวัสดีโลก'
      );

      expect(result).toEqual({
        success: true,
        message: 'Translation completed successfully',
        data: mockResponse
      });
      expect(fetch).toHaveBeenCalledWith(
        'https://n8n.test.com/webhook/translate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should include mood parameters when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({})
      });

      await TranslateService.getTranslate(
        'th',
        'en',
        'test lyrics',
        true,
        5
      );

      const fetchCall = fetch.mock.calls[0];
      const bodyData = JSON.parse(fetchCall[1].body);
      expect(bodyData).toEqual({
        language1: 'th',
        language2: 'en',
        lyrics: 'test lyrics',
        moodEnabled: true,
        moodTopK: 5
      });
    });

    it('should use default moodTopK when not provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({})
      });

      await TranslateService.getTranslate(
        'th',
        'en',
        'test lyrics',
        true
      );

      const fetchCall = fetch.mock.calls[0];
      const bodyData = JSON.parse(fetchCall[1].body);
      expect(bodyData.moodEnabled).toBe(true);
      expect(bodyData.moodTopK).toBe(4); // default value
    });

    it('should not include mood parameters when moodEnabled is null', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({})
      });

      await TranslateService.getTranslate(
        'th',
        'en',
        'test lyrics',
        null
      );

      const fetchCall = fetch.mock.calls[0];
      const bodyData = JSON.parse(fetchCall[1].body);
      expect(bodyData).toEqual({
        language1: 'th',
        language2: 'en',
        lyrics: 'test lyrics'
      });
      expect(bodyData.moodEnabled).toBeUndefined();
    });

    it('should handle non-JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'Plain text response'
      });

      const result = await TranslateService.getTranslate('th', 'en', 'test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        message: 'Plain text response',
        status: 200
      });
    });

    it('should return error when webhook URL is not configured', async () => {
      const originalUrl = config.n8n.translateWebHook;
      config.n8n.translateWebHook = null;

      const result = await TranslateService.getTranslate('th', 'en', 'test');

      expect(result).toEqual({
        success: false,
        message: 'Translate webhook URL is not configured',
        error: 'TRANSLATE_WEBHOOK environment variable is missing'
      });
      expect(fetch).not.toHaveBeenCalled();

      config.n8n.translateWebHook = originalUrl;
    });

    it('should return error when lyrics is empty', async () => {
      const result = await TranslateService.getTranslate('th', 'en', '');

      expect(result).toEqual({
        success: false,
        message: 'Lyrics text is required for translation',
        error: 'Lyrics cannot be empty'
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return error when lyrics is only whitespace', async () => {
      const result = await TranslateService.getTranslate('th', 'en', '   ');

      expect(result).toEqual({
        success: false,
        message: 'Lyrics text is required for translation',
        error: 'Lyrics cannot be empty'
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle webhook HTTP error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error details'
      });

      const result = await TranslateService.getTranslate('th', 'en', 'test');

      expect(result).toEqual({
        success: false,
        message: 'Failed to call translate webhook',
        error: expect.stringContaining('500 Internal Server Error')
      });
    });

    it('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await TranslateService.getTranslate('th', 'en', 'test');

      expect(result).toEqual({
        success: false,
        message: 'Failed to call translate webhook',
        error: 'Network timeout'
      });
    });

    it('should send correct Content-Type header', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '{}'
      });

      await TranslateService.getTranslate('th', 'en', 'test');

      const fetchCall = fetch.mock.calls[0];
      expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('should handle moodEnabled = false explicitly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '{}'
      });

      await TranslateService.getTranslate('th', 'en', 'test', false, 3);

      const fetchCall = fetch.mock.calls[0];
      const bodyData = JSON.parse(fetchCall[1].body);
      expect(bodyData.moodEnabled).toBe(false);
      expect(bodyData.moodTopK).toBe(3);
    });
  });
});

