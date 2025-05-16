import mongoose, {Schema} from 'mongoose';

const ArticleFileSchema = new mongoose.Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  fileVersion: {
    type: Number,
    default: 1
  },
  round: {
    type: Number,
    default: 1
  },
  fileCategory: {
    type: String,
    enum: [
      'manuscript',      // Bản thảo chính
      'cover',           // Thư giới thiệu
      'figure',          // Hình ảnh
      'supplement',      // Tài liệu bổ sung
      'revision',        // Phiên bản chỉnh sửa
      'responseToReviewer' // Phản hồi nhận xét của người phản biện
    ],
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
ArticleFileSchema.index({ articleId: 1 });
ArticleFileSchema.index({ articleId: 1, fileCategory: 1 });
ArticleFileSchema.index({ articleId: 1, round: 1 });

export const ArticleFile = mongoose.model('ArticleFile', ArticleFileSchema);