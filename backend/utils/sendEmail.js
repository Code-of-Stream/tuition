const Email = require('./email');

// Compatibility wrapper to match existing imports in controllers
// Usage: await sendEmail({ email, subject, message })
module.exports = async function sendEmail(options) {
  return Email.sendEmail(options);
};
