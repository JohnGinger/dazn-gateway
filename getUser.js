const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { USERS_TABLE } = process.env;

const getUser = ({ userId }) =>
  dynamoDb
    .get({
      TableName: USERS_TABLE,
      Key: {
        userId
      }
    })
    .promise();
module.exports = getUser;
