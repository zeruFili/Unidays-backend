const Chapa = require('chapa-nodejs').Chapa;

const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY, // Accessing environment variable
});

module.exports = chapa;