import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ và tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  subject: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung tin nhắn'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
