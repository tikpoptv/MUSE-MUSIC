// youtubeTranscriptThrottle.js
// Request throttling for YouTube transcript API endpoints
// จำกัดความถี่เพื่อเลี่ยงโดน YouTube แบน

let lastRequestStartTime = 0;
const requestQueue = [];
let isProcessing = false;

const MIN_DELAY_MS = 3000;        // ไม่ให้ยิงบ่อยกว่า 1 ครั้ง / 3 วินาที
const QUEUE_TIMEOUT_MS = 30000;   // ถ้ารอคิวนานเกิน 30 วิ ตอบ 503

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;

  isProcessing = true;
  try {
    while (requestQueue.length > 0) {
      const item = requestQueue.shift();
      if (!item || !item.resolve) continue;

      const now = Date.now();
      const timeSinceLast =
        lastRequestStartTime > 0 ? now - lastRequestStartTime : MIN_DELAY_MS;

      const delayNeeded = Math.max(0, MIN_DELAY_MS - timeSinceLast);

      if (delayNeeded > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayNeeded));
      }

      // Mark time *before letting next request run*
      lastRequestStartTime = Date.now();

      // Allow this request to continue
      item.resolve();
    }
  } finally {
    isProcessing = false;
  }
}

function enqueueRequest() {
  return new Promise((resolve, reject) => {
    let settled = false;

    // ประกาศ id ก่อนใช้ (ปรับตามคำวิจารณ์)
    const id = Symbol('queueItem');

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;

      // ถ้ายังอยู่ในคิว ให้ลบออกเพื่อไม่ให้คิวบวม
      const idx = requestQueue.findIndex((item) => item && item._id === id);
      if (idx !== -1) requestQueue.splice(idx, 1);

      reject(new Error('Request timeout in queue'));
    }, QUEUE_TIMEOUT_MS);

    const queueItem = {
      _id: id,
      resolve: () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve();
      },
      reject: (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err || new Error('Request rejected from queue'));
      },
    };

    requestQueue.push(queueItem);

    processQueue().catch((err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(err || new Error('Queue processing error'));
      }
    });
  });
}

module.exports = async function youtubeTranscriptThrottle(req, res, next) {
  if (req.aborted || res.headersSent) return next();

  try {
    await enqueueRequest();

    if (!req.aborted && !res.headersSent) {
      return next();
    }
  } catch (err) {
    if (!res.headersSent) {
      return res.status(503).json({
        success: false,
        message: 'Server is busy, please try again later.',
      });
    }
  }
};
