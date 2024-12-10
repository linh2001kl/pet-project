const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "UsersTable";
const SECRET = "secret_key_test";

// Signup
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  const checkParams = new GetCommand({
    TableName: TABLE_NAME,
    Key: { email },
  });

  try {
    // Check is existing User
    const existingUser = await dynamoDB.send(checkParams);
    if (existingUser.Item) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const putParams = new PutCommand({
      TableName: TABLE_NAME,
      Item: { email, password: hashedPassword },
    });

    await dynamoDB.send(putParams);

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const getParams = new GetCommand({
    TableName: TABLE_NAME,
    Key: { email },
  });

  try {
    const result = await dynamoDB.send(getParams);

    if (!result.Item) {
      return res.status(400).json({ message: "User not found!" });
    }

    const user = result.Item;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
