import AWS from "aws-sdk";
import express from "express";
import serverless from "serverless-http";

const app = express();
const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.get("/users/:userId", async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      const { userId, name, email } = Item;
      return res.json({ userId, name, email });
    } else {
      return res
        .status(404)
        .json({ error: "Could find user indentified by" + req.params.userId });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/users", async (req, res) => {
  const { userId, name, email } = req.body;

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      name,
      email,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    return res.json({ userId, name, email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "User could not be created" });
  }
});

app.use((req, res) => {
  return res.status(404).json({ error: "End point not found" });
});
