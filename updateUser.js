const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { USERS_TABLE } = process.env;

const updateUser = ({ userId, tokenExpiryTimes }) =>
  dynamoDb
    .put({
      TableName: USERS_TABLE,
      Item: {
        userId,
        tokenExpiryTimes
      }
    })
    .promise();
module.exports = updateUser;
