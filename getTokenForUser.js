const createToken = require("./createToken");
const getUser = require("./getUser");
const updateUser = require("./updateUser");
const moment = require("moment");

const { MAX_TOKENS } = process.env;

const getTokenForUser = async function(userId) {
  console.info(
    `User ${userId} has requested a view token at ${moment().unix()}`
  );
  return getUser({ userId })
    .catch(error => {
      console.log(error);
      return Promise.reject({
        status: 500,
        error: "Could not access database or user id badly formatted"
      });
    })
    .then(async result => {
      if (result.Item) {
        const { userId, tokenExpiryTimes } = result.Item;
        console.info(`The tokens they currently have are ${tokenExpiryTimes}`);
        // Get tokens that haven't expired
        const filteredTokenExpiryTimes = tokenExpiryTimes.filter(
          x => x >= moment().unix()
        );
        console.info(
          `After removing expired tokens they have ${filteredTokenExpiryTimes}`
        );
        if (filteredTokenExpiryTimes.length < MAX_TOKENS) {
          console.info(`Creating a new token as under the limit`);
          const { tokenExpiry, token } = createToken(userId);
          await updateUser({
            userId,
            tokenExpiryTimes: [tokenExpiry, ...filteredTokenExpiryTimes]
          });
          console.info(`Tokens expire at ${tokenExpiryTimes}`);

          return Promise.resolve({ token });
        } else {
          // We could update the tokens in the db here as well, but we don't
          // need to as we will do that on the next valid request
          console.info(
            `They have too many active streams, not creating a new token`
          );
          return Promise.reject({
            status: 403,
            error: "Too many active streams"
          });
        }
      } else {
        const { tokenExpiry, token } = createToken(userId);
        console.info(`They don't exist, creating a new user`);
        await updateUser({
          userId,
          tokenExpiryTimes: [tokenExpiry]
        });
        return Promise.resolve({ token });
      }
    });
};
module.exports = getTokenForUser;
