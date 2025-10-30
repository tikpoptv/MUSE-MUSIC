const { config } = require('../config/env');
const { logger } = require('../middleware/logger');

const LRCLIB_BASE = `${config.lrclib.baseUrl}`.replace(/\/$/, '');
const USER_AGENT = config.lrclib.userAgent;

function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}` !== '') {
      usp.set(key, String(value));
    }
  });
  return usp.toString();
}

async function doGet(path, query) {
  const url = `${LRCLIB_BASE}${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT
    }
  });
  if (!res.ok) {
    const text = await res.text();
    logger.warn('LRCLIB request failed', { url, status: res.status, text });
    const error = new Error(`LRCLIB error ${res.status}`);
    error.status = res.status;
    error.details = text;
    throw error;
  }
  return res.json();
}

const lyricsService = {
  async search({ q, track_name, artist_name, album_name }) {
    const query = buildQuery({ q, track_name, artist_name, album_name });
    return doGet('/api/search', query);
  },

  async get({ track_name, artist_name, album_name, duration }) {
    const query = buildQuery({ track_name, artist_name, album_name, duration });
    return doGet('/api/get', query);
  },

  async getCached({ track_name, artist_name, album_name, duration }) {
    const query = buildQuery({ track_name, artist_name, album_name, duration });
    return doGet('/api/get-cached', query);
  },

  async getById(id) {
    return doGet(`/api/get/${id}`);
  }
};

module.exports = lyricsService;


