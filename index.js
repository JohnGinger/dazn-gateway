const serverless = require("serverless-http");
const express = require("express");
const getTokenForUser = require("./getTokenForUser");
const app = express();

app.get("/get-token/:userId", function(req, res) {
  const { userId } = req.params;
  return getTokenForUser(userId)
    .then(response => res.json(response))
    .catch(({ status, error }) => res.status(status).json({ error }));
});

module.exports.handler = serverless(app);