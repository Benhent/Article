import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tên số báo là bắt buộc'],
    trim: true
  },
  volumeNumber: {
    type: Number,
    required: [true, 'Số tập là bắt buộc'],
    min: [1, 'Số tập phải lớn hơn 0']
  },
  issueNumber: {
    type: Number,
    required: [true, 'Số kỳ là bắt buộc'],
    min: [1, 'Số kỳ phải lớn hơn 0']
  },
  publicationDate: {
    type: Date,
    required: [true, 'Ngày xuất bản là bắt buộc']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để lấy thông tin chi tiết của các bài báo
issueSchema.virtual('articleDetails', {
  ref: 'Article',
  localField: 'articles',
  foreignField: '_id'
});

// Index cho tìm kiếm nhanh
issueSchema.index({ title: 'text' });
issueSchema.index({ volumeNumber: 1, issueNumber: 1 }, { unique: true });

// Middleware để xóa các bài báo liên quan khi xóa số báo
issueSchema.pre('remove', async function(next) {
  try {
    await mongoose.model('Article').updateMany(
      { _id: { $in: this.articles } },
      { $unset: { issueId: 1 } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức tạo title tự động
issueSchema.methods.generateTitle = function() {
  const journalName = "Journal of AI Research";
  const volumeText = `Vol.${this.volumeNumber}`;
  const issueText = `No.${this.issueNumber}`;
  return `${journalName} – ${volumeText} ${issueText}`;
};

// Middleware tự động tạo title nếu chưa có
issueSchema.pre('save', function(next) {
  if (!this.title) {
    this.title = this.generateTitle();
  }
  next();
});

export const Issue = mongoose.model('Issue', issueSchema);