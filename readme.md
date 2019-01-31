This is loosely based on https://serverless.com/blog/serverless-express-rest-api/

# To deploy install serverless (npm install -g serverless) and run
sls deploy

# Assumptions
The user sends their user_id (in real life this would be authenticated in some way)
and the server responds with a token if the number of active tokens is less than 3

endpoints

GET /get-token/:user_id
returns either 200
{
    token: JWT_token
}

or 403 {
    error: "Max tokens exceeded"
}

The token can be stored in browser - so if you navigate away that token isn't lost. 

The length of a token is a performance tradeoff, long ages mean that you don't need to make so many requests, but a user might be 'stuck' on devices that they haven't watched for a while.

These tokens could be shared around out of band to enable watching on more devices, so the video server which is
checking for the token could check they are coming from the same IP.

Database design

users {
    user_id: string
    tokens_expiry: unix timestamp when token expires
}

Environment variables
USERS_TABLE: ${self:custom.tableName}
TOKEN_SECRET: "MY_SUPER_SECRET_TOKEN"
TOKEN_EXPIRY: "30s"
TOKEN_GRACE_PERIOD: "1s"
MAX_TOKENS: 3