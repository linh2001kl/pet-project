const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "PostTable";

//Uploadfile to S3 buckket
exports.upload = async (req, res) => {
  console.log("Upload req :", req);
  try {
    return res.status(200).json({ message: "Upload file success" });
  } catch (error) {
    console.error("Error Upload file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Download file từ S3

//Hiển thị ra màn hình file
