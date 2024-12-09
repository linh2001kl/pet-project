const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  userEmail: { type: String, required: true },
  compositeKey: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  status: { type: Boolean, default: true },
});

postsSchema.index({ compositeKey: 1 }, { unique: true }); // Composite key unique

// Tạo compositeKey trước khi lưu
postsSchema.pre("save", function (next) {
  this.compositeKey = `${this.userName}_${this.postId}`;
  next();
});

const PostsModel = mongoose.model("Posts", postsSchema);

module.exports = PostsModel;
