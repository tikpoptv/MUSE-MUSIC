/* eslint-disable no-console */

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
  },
  
  error: (message, ...args) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.error(`\x1b[36m[${timestamp}]\x1b[0m \x1b[31m[ERROR]\x1b[0m ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.warn(`\x1b[36m[${timestamp}]\x1b[0m \x1b[33m[WARN]\x1b[0m ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.log(`\x1b[36m[${timestamp}]\x1b[0m \x1b[90m[DEBUG]\x1b[0m ${message}`, ...args);
  }
};

// Express middleware function
const requestLogger = (req, res, next) => {
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
  
  next();
};

module.exports = requestLogger;
module.exports.logger = logger;
