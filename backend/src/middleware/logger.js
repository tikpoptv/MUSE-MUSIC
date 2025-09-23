const logger = (req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('th-TH');
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  const methodColor = {
    'GET': '\x1b[32m',     // เขียว
    'POST': '\x1b[34m',    // น้ำเงิน
    'PUT': '\x1b[33m',     // เหลือง
    'DELETE': '\x1b[31m',  // แดง
    'PATCH': '\x1b[35m'    // ม่วง
  };
  
  const resetColor = '\x1b[0m';
  const methodColored = `${methodColor[method] || '\x1b[37m'}${method}${resetColor}`;
  
  console.log(`\x1b[36m[${timestamp}]\x1b[0m ${methodColored} \x1b[90m${url}\x1b[0m \x1b[2mfrom\x1b[0m \x1b[93m${ip}\x1b[0m`);
  
  next();
};

module.exports = logger;
