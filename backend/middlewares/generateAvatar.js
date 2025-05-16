export const applyAvatar = (schema) => {
  schema.pre('save', function(next) {
    // Chỉ tạo avatar mặc định nếu đây là tài khoản mới được tạo 
    // và không có avatarUrl được cung cấp
    if (this.isNew && !this.avatarUrl) {
      this.avatarUrl = generateInitialAvatar(this.name);
    }
    next();
  });
};

export const generateInitialAvatar = (name) => {
  if (!name) return '';
  
  // Lấy chữ cái đầu tiên và chuyển thành chữ hoa
  const initial = name.trim().charAt(0).toUpperCase();
  
  // Tạo URL cho avatar dùng UI Avatars API
  return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;
};