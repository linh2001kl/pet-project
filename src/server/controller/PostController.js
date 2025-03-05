require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs");

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
        user_email: req.user.email,
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

// Download file from S3 with fileUrl
exports.download = async (req, res) => {
  try {
    const fileUrl = req.query.fileUrl;

    if (!fileUrl) {
      return res.status(400).json({ message: "fileUrl is required" });
    }

    const fileKey = fileUrl.split(".com/")[1];

    const downloadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    };

    const fileStream = await s3.send(new GetObjectCommand(downloadParams));
    const fileName = encodeURIComponent(fileKey.split("/").pop());

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${fileName}`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    fileStream.Body.pipe(res);
  } catch (error) {
    console.error("Lỗi khi download file:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Hiển thị ra màn hình file
exports.findbyPostID = async (req, res) => {
  try {
    const postId = req.query.postId;
    const dbParams = {
      TableName: TABLE_NAME,
      Key: {
        postId: postId,
      },
    };

    const result = await dynamoDB.send(new GetCommand(dbParams));
    res.status(200).json(result.Item);
  } catch (error) {
    console.error("Lỗi khi hiển thị file:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo pre-signed URL để tải file từ S3
exports.getFileUrl = async (req, res) => {
  try {
    const fileKey = req.query.fileUrl.split(".com/")[1];

    if (!fileKey) {
      return res.status(400).json({ message: "fileKey is required" });
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    };

    const url = await getSignedUrl(s3, new GetObjectCommand(params), {
      expiresIn: 60 * 5,
    }); // URL có hiệu lực 5 phút
    res.json({ fileUrl: url });
  } catch (error) {
    console.error("Lỗi khi tạo pre-signed URL:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách file theo email người dùng
exports.listByUserEmail = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const dbParams = {
      TableName: TABLE_NAME,
      FilterExpression: "user_email = :user_email",
      ExpressionAttributeValues: {
        ":user_email": userEmail,
      },
    };

    const command = new ScanCommand(dbParams);
    const result = await dynamoDB.send(command);
    res.status(200).json(result.Items);
  } catch (error) {
    console.error("Lỗi khi hiển thị danh sách file:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
