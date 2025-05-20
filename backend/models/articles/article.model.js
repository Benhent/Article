import mongoose, {Schema} from 'mongoose';
import { StatusHistory } from './statusHistory.model.js';
// import {ArticleAuthor} from './articleAuthor.model.js';
// import {StatusHistory} from './statusHistory.model.js';

// Schema chính cho bài báo
const ArticleSchema = new mongoose.Schema({
  // Thông tin cơ bản
  titlePrefix: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
  },
  articleFile: {
    type: Schema.Types.ObjectId,
    ref: 'ArticleFile',
    // required: true
  },
  abstract: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    required: true,
    validate: [
      arrayLimit, 'Cần có ít nhất 3 từ khóa và không quá 10 từ khóa'
    ]
  },
  // Phân loại và ngôn ngữ
  articleLanguage: {
    type: String,
    required: true,
  },
  field: {
    type: Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  secondaryFields: [{
    type: Schema.Types.ObjectId,
    ref: 'Field'
  }],
  // Người tham gia
  authors: [{
    type: Schema.Types.ObjectId,
    ref: 'ArticleAuthor'
  }],
  submitterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // Trạng thái và quy trình
  status: {
    type: String,
    enum: [
      'submitted',
      'underReview',
      'revisionRequired',
      'resubmitted',
      'accepted',
      'rejected',
      'published'
    ],
    default: 'submitted'
  },
  statusHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'StatusHistory'
  }],
  currentRound: {
    type: Number,
    default: 1,
    min: 1
  },
  submittedDate: {
    type: Date
  },
  acceptedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  publishedDate: {
    type: Date
  },
  // Xuất bản
  doi: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  },
  pageStart: {
    type: Number,
    min: 1
  },
  pageEnd: {
    type: Number,
    min: 1,
    validate: {
      validator: function(v) {
        return this.pageStart ? v >= this.pageStart : true;
      },
      message: 'Trang cuối phải lớn hơn hoặc bằng trang đầu'
    }
  },
  // Ghi chú
  submitterNote: {
    type: String
  },
  editorNote: {
    type: String
  },
  // Số liệu thống kê
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  citationCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hàm xác thực số lượng từ khóa
function arrayLimit(val) {
  return val.length >= 3 && val.length <= 10;
}

// Virtual references cho các bảng liên quan
ArticleSchema.virtual('files', {
  ref: 'ArticleFile',
  localField: '_id',
  foreignField: 'articleId'
});

ArticleSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'articleId'
});

ArticleSchema.virtual('discussions', {
  ref: 'Discussion',
  localField: '_id',
  foreignField: 'articleId'
});

// Index để tối ưu tìm kiếm
ArticleSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ submitterId: 1 });
ArticleSchema.index({ field: 1 });
ArticleSchema.index({ 'authors.email': 1 });
ArticleSchema.index({ issueId: 1 });

// Middleware pre-save để cập nhật lịch sử trạng thái
ArticleSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const currentStatus = this.status;
    
    if (currentStatus === 'submitted' && !this.submittedDate) {
      this.submittedDate = new Date();
    } else if (currentStatus === 'accepted' && !this.acceptedDate) {
      this.acceptedDate = new Date();
    } else if (currentStatus === 'rejected' && !this.rejectedDate) {
      this.rejectedDate = new Date();
    } else if (currentStatus === 'published' && !this.publishedDate) {
      this.publishedDate = new Date();
    }
  }
  if (this.isModified('title')) {
    // Tạo slug từ title
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Methods
ArticleSchema.methods.setEditor = function(userId) {
  this.editorId = userId;
  return this.save();
};

ArticleSchema.methods.changeStatus = async function(newStatus, userId, reason) {
  try {
    // Tạo một bản ghi mới cho statusHistory
    const statusHistory = new StatusHistory({
      status: newStatus,
      changedBy: userId,
      reason: reason,
      timestamp: new Date()
    });

    // Lưu statusHistory mới
    await statusHistory.save();

    // Cập nhật trạng thái và thêm statusHistory vào mảng
    this.status = newStatus;
    this.statusHistory.push(statusHistory._id);

    // Cập nhật các ngày tương ứng
    if (newStatus === 'submitted' && !this.submittedDate) {
      this.submittedDate = new Date();
    } else if (newStatus === 'accepted' && !this.acceptedDate) {
      this.acceptedDate = new Date();
    } else if (newStatus === 'rejected' && !this.rejectedDate) {
      this.rejectedDate = new Date();
    } else if (newStatus === 'published' && !this.publishedDate) {
      this.publishedDate = new Date();
    }

    return await this.save();
  } catch (error) {
    console.error('Error in changeStatus:', error);
    throw error;
  }
};

ArticleSchema.methods.nextReviewRound = function() {
  this.currentRound += 1;
  return this.save();
};

ArticleSchema.methods.isAuthor = function(userId) {
  if (this.submitterId.equals(userId)) {
    return true;
  }
  
  for (const author of this.authors) {
    if (author.userId && author.userId.equals(userId)) {
      return true;
    }
  }
  
  return false;
};

export const Article = mongoose.model('Article', ArticleSchema);