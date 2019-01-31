const jwt = require("jsonwebtoken");
const ms = require("ms");
const moment = require("moment");

const { TOKEN_SECRET, TOKEN_EXPIRY, TOKEN_GRACE_PERIOD } = process.env;
const TOKEN_EXPIRY_IN_SECONDS = ms(TOKEN_EXPIRY) / 1000;
const TOKEN_GRACE_IN_SECONDS = ms(TOKEN_GRACE_PERIOD) / 1000;

const createToken = userId => {
  var token = jwt.sign({ userId }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRY
  });
  // We add a grace period to allow refreshing the token before it
  // expires and not going over the token limit
  const tokenExpiry =
    moment().unix() +
    Number(TOKEN_EXPIRY_IN_SECONDS) -
    Number(TOKEN_GRACE_IN_SECONDS);
  return { tokenExpiry: tokenExpiry, token };
};
module.exports = createToken;
