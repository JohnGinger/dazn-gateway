const serverless = require("serverless-http");
const express = require("express");
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const jwt = require("jsonwebtoken");
const ms = require("ms");
const moment = require("moment");

const app = express();
const {
  USERS_TABLE,
  TOKEN_SECRET,
  TOKEN_EXPIRY,
  TOKEN_GRACE_PERIOD,
  MAX_TOKENS
} = process.env;
const TOKEN_EXPIRY_IN_SECONDS = ms(TOKEN_EXPIRY) / 1000;

app.get("/get-token/:userId", function(req, res) {
  const { userId } = req.params;

  getUser({ userId })
    .then(async result => {
      if (result.Item) {
        const { userId, tokenExpiryTimes } = result.Item;

        // Get tokens that have an expiry less than now
        const filteredTokenExpiryTimes = tokenExpiryTimes
          .split(",")
          .filter(x => x < moment().unix());

        if (filteredTokenExpiryTimes.length < MAX_TOKENS) {
          const { tokenExpiry, token } = createToken(userId);

          await updateUser({
            userId,
            tokenExpiryTimes: [tokenExpiry, ...filteredTokenExpiryTimes]
          });
          return res.json({ token });
        } else {
          // We could update the tokens in the db here as well, but we don't
          // need to as we will do that on the next valid request
          res.status(403).json({ error: "Too many active streams" });
        }
      } else {
        const { tokenExpiry, token } = createToken(userId);
        await updateUser({
          userId,
          tokenExpiryTimes: [tokenExpiry]
        });
        return res.json({ token });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(400).json({ error: "Could not get user" });
    });
});

module.exports.handler = serverless(app);

const createToken = userId => {
  var token = jwt.sign({ userId }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRY
  });
  // We add a grace period to allow refreshing the token before it
  // expires and not going over the token limit
  const tokenExpiry =
    moment().unix() + TOKEN_EXPIRY_IN_SECONDS - TOKEN_GRACE_PERIOD;
  return { tokenExpiry, token };
};

const getUser = ({ userId }) =>
  dynamoDb
    .get({
      TableName: USERS_TABLE,
      Key: {
        userId
      }
    })
    .promise();

const updateUser = ({ userId, tokenExpiryTimes }) =>
  dynamoDb
    .put({
      TableName: USERS_TABLE,
      Item: {
        userId,
        tokenExpiryTimes: tokenExpiryTimes.join(",")
      }
    })
    .promise();
