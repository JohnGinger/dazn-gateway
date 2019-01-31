This is loosely based on https://serverless.com/blog/serverless-express-rest-api/

# To deploy install serverless (npm install -g serverless) and run
yarn deploy
This will also run tests, to just run tests run
yarn test

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
    tokens_expiry: list of unix timestamp when token expires
}

Environment Variables:
USERS_TABLE: ${self:custom.tableName}
TOKEN_SECRET: e.g. "MY_SUPER_SECRET_TOKEN"
TOKEN_EXPIRY: e.g. "30s"
TOKEN_GRACE_PERIOD: "1s"  // We add a grace period to allow refreshing the token before it expires and not going over the token limit (e.g. the difference between when the token expires, and when a new token is granted. This could also be done in the video layer)
MAX_TOKENS: 3 

Scaling:
This is based on AWS Lambda and dynamo so scaling should be simple. You would just need to scale the ReadCapacityUnits and WriteCapacityUnits of the dynamodb table based on your usage requirements

Logging & Monitoring:
The logs are stored to cloudwatch, this, in combination with the lamda logs, can be used for filtering to get detailed insight into what is going on in the api.

Deployment:
This is currently using serverless for deployment, but could manually create the resources using cloudformation if needed