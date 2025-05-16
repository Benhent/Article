# 🧠Backend API Documentation

![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-Framework-blue?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-v4.4%2B-brightgreen?logo=mongodb)

## 🚀 Giới thiệu
>Backend API được xây dựng bằng Node.js và Express, sử dụng MongoDB làm cơ sở dữ liệu. API cung cấp các chức năng quản lý bài báo khoa học, tác giả, phản biện và quy trình xuất bản.

## 📦 Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB (v4.4 trở lên)
- npm hoặc yarn

## ⚙️ Cài đặt
1. Clone repository
```bash
git clone https://github.com/Benhent/backend.git
cd backend
```

2. Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

3. Tạo file .env từ .env.example và cấu hình các biến môi trường
```bash
cp .env.example .env
```

4. Chạy server
```bash
npm run dev
# hoặc
yarn dev
```

## 📁 Cấu trúc thư mục
```
backend/
├── controllers/      # Xử lý logic nghiệp vụ
├── db/               # kết nối mongodb
├── mail/            # cấu hình mail
├── middlewares/      # Middleware xác thực và phân quyền
├── models/          # Schema và model MongoDB
├── routes/          # Định nghĩa routes
├── utils/           # Tiện ích và helper functions
├── .env             # Biến môi trường
└── index.js        # Điểm khởi đầu ứng dụng
```

## �� API Endpoints

### 🔐 Xác thực
- `POST /api/auth/signup` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/verify-email` - Xác thực email
- `POST /api/auth/resend-verification` - Gửi lại email xác thực
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password/:token` - Đặt lại mật khẩu
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập
- `PUT /api/auth/change-password` - Thay đổi mật khẩu

### 👤 Hồ sơ người dùng
- `GET /api/profile` - Lấy thông tin hồ sơ
- `PUT /api/profile/update-profile` - Cập nhật hồ sơ

### 📄 Quản lý bài báo
- `GET /api/articles` - Lấy danh sách bài báo (phân trang)
- `GET /api/articles/stats` - Lấy thống kê bài báo
- `GET /api/articles/:id` - Lấy chi tiết bài báo
- `POST /api/articles` - Tạo bài báo mới (yêu cầu xác thực)
- `PUT /api/articles/:id/update` - Cập nhật bài báo (yêu cầu editor/admin)
- `PUT /api/articles/:id/assign-editor` - Chỉ định biên tập viên (yêu cầu editor/admin)
- `PUT /api/articles/:id/publish` - Xuất bản bài báo (yêu cầu editor/admin)
- `PATCH /api/articles/:id/status` - Thay đổi trạng thái bài báo (yêu cầu editor/admin)
- `DELETE /api/articles/:id` - Xóa bài báo (yêu cầu xác thực)

### 📎 Quản lý file bài báo
- `POST /api/article-files/:articleId` - Tải lên file bài báo (yêu cầu xác thực)
- `GET /api/article-files/:articleId` - Lấy danh sách file bài báo (yêu cầu xác thực)
- `GET /api/article-files/:fileId/content` - Lấy nội dung file (yêu cầu xác thực)
- `DELETE /api/article-files/:fileId` - Xóa file (yêu cầu admin/editor/author)
- `PATCH /api/article-files/:fileId/status` - Cập nhật trạng thái file (yêu cầu admin/editor/author)

### 🧑‍💼 Quản lý tác giả bài báo
- `GET /api/article-authors` - Lấy danh sách tác giả (yêu cầu xác thực)
- `GET /api/article-authors/:id` - Lấy chi tiết tác giả (yêu cầu xác thực)
- `POST /api/article-authors` - Tạo tác giả mới (yêu cầu admin/editor/author)
- `PUT /api/article-authors/:id` - Cập nhật tác giả (yêu cầu admin/editor/author)
- `DELETE /api/article-authors/:id` - Xóa tác giả (yêu cầu admin/editor)
- `GET /api/article-authors/articles/:articleId/authors` - Lấy danh sách tác giả của bài báo

### 🧾 Quản lý phản biện
- `GET /api/reviews` - Lấy danh sách phản biện (yêu cầu admin/editor)
- `POST /api/reviews` - Mời một phản biện (yêu cầu admin/editor)
- `POST /api/reviews/multiple` - Mời nhiều phản biện (yêu cầu admin/editor)
- `GET /api/reviews/:id` - Lấy chi tiết phản biện (yêu cầu admin/editor/reviewer)
- `PUT /api/reviews/:id` - Cập nhật phản biện (yêu cầu admin/editor)
- `DELETE /api/reviews/:id` - Xóa phản biện (yêu cầu admin/editor)

### Hành động phản biện
- `POST /api/reviews/:id/accept` - Chấp nhận lời mời phản biện (yêu cầu reviewer)
- `POST /api/reviews/:id/decline` - Từ chối lời mời phản biện (yêu cầu reviewer)
- `POST /api/reviews/:id/complete` - Hoàn thành phản biện (yêu cầu reviewer)
- `POST /api/reviews/:id/reminder` - Gửi nhắc nhở phản biện (yêu cầu admin/editor)

### 📊 Quản lý lịch sử trạng thái
- `GET /api/status-history` - Lấy danh sách lịch sử trạng thái (yêu cầu admin/editor)
- `POST /api/status-history` - Tạo lịch sử trạng thái mới (yêu cầu admin/editor)
- `GET /api/status-history/:id` - Lấy chi tiết lịch sử trạng thái (yêu cầu admin/editor)
- `PUT /api/status-history/:id` - Cập nhật lịch sử trạng thái (yêu cầu admin)
- `DELETE /api/status-history/:id` - Xóa lịch sử trạng thái (yêu cầu admin)
- `GET /api/status-history/articles/:articleId/status-history` - Lấy lịch sử trạng thái của bài báo (yêu cầu admin/editor)

## 🔐 Xác thực và Phân quyền
API sử dụng JWT (JSON Web Token) để xác thực. Các role được hỗ trợ:
- `admin`: Quản trị viên hệ thống
- `editor`: Biên tập viên
- `reviewer`: Phản biện
- `author`: Tác giả
- `user`: Người dùng thông thường

## 🌟Các tính năng chính
1. Quản lý bài báo khoa học
   - Tạo và quản lý bài báo
   - Theo dõi trạng thái bài báo
   - Quản lý phiên bản và file đính kèm

2. Quản lý tác giả
   - Thêm và quản lý tác giả
   - Liên kết tác giả với bài báo
   - Hỗ trợ tác giả có tài khoản và không có tài khoản

3. Quản lý phản biện
   - Mời phản biện (đơn lẻ hoặc hàng loạt)
   - Theo dõi tiến độ phản biện
   - Gửi nhắc nhở tự động

4. Quy trình xuất bản
   - Quản lý vòng phản biện
   - Xử lý yêu cầu sửa đổi
   - Xuất bản bài báo

## 🔒 Bảo mật
- Xác thực JWT
- Phân quyền chi tiết
- Bảo vệ API endpoints
- Mã hóa dữ liệu nhạy cảm

## 🧪Phát triển
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request