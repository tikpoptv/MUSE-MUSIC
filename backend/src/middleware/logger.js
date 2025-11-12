/* eslint-disable no-console */

let LogService = null;
const getLogService = () => {
  if (!LogService) {
    LogService = require('../services/logService');
  }
  return LogService;
};

const getRealIP = (req) => {
  let ip = req.ip || req.connection.remoteAddress;
  
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  return ip;
};

// Logger object with methods
const logger = {
  info: (message, ...args) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.log(`\x1b[36m[${timestamp}]\x1b[0m \x1b[32m[INFO]\x1b[0m ${message}`, ...args);
    
    try {
      getLogService().saveLog({
        level: 'info',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        details: args.length > 0 ? { args } : null
      }).catch(err => console.error('Failed to save log:', err));
    } catch (err) {
      // Ignore
    }
  },
  
  error: (message, ...args) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.error(`\x1b[36m[${timestamp}]\x1b[0m \x1b[31m[ERROR]\x1b[0m ${message}`, ...args);
    
    try {
      const error = args.find(arg => arg instanceof Error);
      getLogService().saveLog({
        level: 'error',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        details: args.length > 0 ? { args: args.filter(a => !(a instanceof Error)) } : null,
        errorStack: error?.stack,
        errorCode: error?.code
      }).catch(err => console.error('Failed to save log:', err));
    } catch (err) {
      // Ignore
    }
  },
  
  warn: (message, ...args) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.warn(`\x1b[36m[${timestamp}]\x1b[0m \x1b[33m[WARN]\x1b[0m ${message}`, ...args);
    
    try {
      getLogService().saveLog({
        level: 'warn',
        message: typeof message === 'string' ? message : JSON.stringify(message),
        details: args.length > 0 ? { args } : null
      }).catch(err => console.error('Failed to save log:', err));
    } catch (err) {
      // Ignore if LogService is not available yet
    }
  },
  
  debug: (message, ...args) => {
    // Only save debug in development
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toLocaleTimeString('th-TH');
      console.log(`\x1b[36m[${timestamp}]\x1b[0m \x1b[90m[DEBUG]\x1b[0m ${message}`, ...args);
      
      try {
        getLogService().saveLog({
          level: 'debug',
          message: typeof message === 'string' ? message : JSON.stringify(message),
          details: args.length > 0 ? { args } : null
        }).catch(err => console.error('Failed to save log:', err));
      } catch (err) {
        // Ignore if LogService is not available yet
      }
    }
  }
};

// Express middleware function
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString('th-TH');
  const method = req.method;
  const url = req.url;
  const ip = getRealIP(req);
  
  const methodColor = {
    'GET': '\x1b[32m',
    'POST': '\x1b[34m',
    'PUT': '\x1b[33m',
    'DELETE': '\x1b[31m',
    'PATCH': '\x1b[35m'
  };
  
  const resetColor = '\x1b[0m';
  const methodColored = `${methodColor[method] || '\x1b[37m'}${method}${resetColor}`;
  
  console.log(`\x1b[36m[${timestamp}]\x1b[0m ${methodColored} \x1b[90m${url}\x1b[0m \x1b[2mfrom\x1b[0m \x1b[93m${ip}\x1b[0m`);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userID = req.user?.userID || null;
    const userRole = req.user?.role || null;
    
    try {
      getLogService().saveLog({
        level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
        category: 'api',
        message: `${method} ${url}`,
        method: method,
        path: url,
        statusCode: res.statusCode,
        userID: userID,
        userRole: userRole,
        ipAddress: ip,
        userAgent: req.get('user-agent') || null,
        duration: duration
      }).catch(err => console.error('Failed to save request log:', err));
    } catch (err) {
      // Ignore
    }
  });
  
  next();
};

module.exports = requestLogger;
module.exports.logger = logger;
