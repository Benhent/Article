import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    unique: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    default: null
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Thêm index để tối ưu tìm kiếm
// FieldSchema.index({ name: 1 });
// FieldSchema.index({ code: 1 });
// FieldSchema.index({ parent: 1 });
// FieldSchema.index({ level: 1 });

// Tạo virtual cho danh sách field con
FieldSchema.virtual('children', {
  ref: 'Field',
  localField: '_id',
  foreignField: 'parent'
});

// Method lấy tất cả field con (đệ quy)
FieldSchema.methods.getAllChildren = async function(includeInactive = false) {
  const query = { parent: this._id };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  const children = await this.model('Field').find(query);
  let allChildren = [...children];
  
  for (const child of children) {
    const grandChildren = await child.getAllChildren(includeInactive);
    allChildren = [...allChildren, ...grandChildren];
  }
  
  return allChildren;
};

export const Field = mongoose.model('Field', FieldSchema);