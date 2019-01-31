jest.mock("./createToken");
jest.mock("./getUser");
jest.mock("./updateUser");
jest.mock("moment");

process.env.TOKEN_SECRET = "hello";
process.env.TOKEN_EXPIRY = "30s";
process.env.TOKEN_GRACE_PERIOD = "1s";
process.env.MAX_TOKENS = "3";

const createToken = require("./createToken");
const getUser = require("./getUser");
const updateUser = require("./updateUser");
const moment = require("moment");

moment.mockReturnValue({ unix: () => 1000 });
createToken.mockReturnValue({ token: "my-test-token", tokenExpiry: 1003 });

const getTokenForUser = require("./getTokenForUser");

test("Creates a new user", async () => {
  getUser.mockReturnValueOnce(Promise.resolve({}));
  const updateUserMock = updateUser.mockReturnValue(Promise.resolve());

  const token = await getTokenForUser("userId1");
  expect(token).toEqual({
    token: "my-test-token"
  });
  expect(updateUserMock).toBeCalledWith({
    userId: "userId1",
    tokenExpiryTimes: [1003]
  });
});

test("Adds a new token to existing user", async () => {
  getUser.mockReturnValueOnce(
    Promise.resolve({ Item: { userId: "userId2", tokenExpiryTimes: [1001, 1002] } })
  );
  const updateUserMock = updateUser.mockReturnValue(Promise.resolve());

  const token = await getTokenForUser("userId2");
  expect(token).toEqual({
    token: "my-test-token"
  });
  expect(updateUserMock).toBeCalledWith({
    userId: "userId2",
    tokenExpiryTimes: [1003, 1001, 1002]
  });
});

test("removes expired tokens", async () => {
  getUser.mockReturnValueOnce(
    Promise.resolve({ Item: { userId: "userId4", tokenExpiryTimes: [1, 2, 3000] } })
  );
  const updateUserMock = updateUser.mockReturnValue(Promise.resolve());

  const token = await getTokenForUser("userId4");
  expect(token).toEqual({
    token: "my-test-token"
  });
  expect(updateUserMock).toBeCalledWith({
    userId: "userId4",
    tokenExpiryTimes: [1003, 3000]
  });
});

test("Does not resolve if there are too many tokens", () => {
  getUser.mockReturnValueOnce(
    Promise.resolve({
      Item: { userId: "userId3", tokenExpiryTimes: [1001, 1002, 1003] }
    })
  );
  return expect(getTokenForUser("userId3")).rejects.toEqual({
    status: 403,
    error: "Too many active streams"
  });
});

test("If can't connect to db, returns 500", () => {
  getUser.mockReturnValueOnce(Promise.reject());
  return expect(getTokenForUser("userId3")).rejects.toEqual({
    status: 500,
    error: "Could not access database or user id badly formatted"
  });
});
