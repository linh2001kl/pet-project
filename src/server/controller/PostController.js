require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Cấu hình AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Cấu hình DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "PostsTable";

// Cấu hình Multer để lưu file tạm thời
const upload = multer({ dest: "uploads/" });
// Upload file lên S3 và lưu vào DynamoDB
exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file để upload" });
    }
    const originalName = Buffer.from(req.file.originalname, "latin1").toString(
      "utf8"
    );

    const fileStream = fs.createReadStream(req.file.path);
    const fileKey = `uploads/${Date.now()}-${originalName}`;

    // Upload lên S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Xóa file tạm
    fs.unlinkSync(req.file.path);

    // URL của file trên S3
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

    // Lưu vào DynamoDB
    const dbParams = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        postId: uuidv4(),
        fileName: originalName,
        fileUrl: fileUrl,
        uploadedAt: new Date().toISOString(),
      },
    });

    await dynamoDB.send(dbParams);

    res.status(200).json({ message: "Upload thành công", fileUrl });
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xuất middleware Multer để dùng trong router
exports.uploadMiddleware = upload.single("file");

//Download file từ S3

//Hiển thị ra màn hình file
