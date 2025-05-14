const log = (message, data = '') => {
  console.log(`[INFO] ${message}`, data);
};

const warn = (message, data = '') => {
  console.warn(`[WARN] ${message}`, data);
};

const error = (message, data = '') => {
  console.error(`[ERROR] ${message}`, data);
};

module.exports = {
  log,
  warn,
  error
};
