const serverless = require("serverless-http");
const express = require("express");
const app = express();
const AWS = require('aws-sdk');
const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.get("/", function(req, res) {
  res.send("Hello World!");
});

module.exports.handler = serverless(app);
