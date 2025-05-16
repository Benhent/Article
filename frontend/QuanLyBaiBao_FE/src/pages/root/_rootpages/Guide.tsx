import React from 'react';

const Guide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Hướng dẫn sử dụng</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
        <p className="text-gray-700">
          Chào mừng bạn đến với hệ thống quản lý bài báo. Trang hướng dẫn này sẽ giúp bạn làm quen với các tính năng cơ bản của hệ thống.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Các bước cơ bản</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">1. Đăng nhập hệ thống</h3>
            <p className="text-gray-600">Sử dụng tài khoản được cấp để đăng nhập vào hệ thống</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">2. Quản lý bài báo</h3>
            <p className="text-gray-600">Thêm, chỉnh sửa và xóa bài báo trong hệ thống</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium">3. Tìm kiếm và lọc</h3>
            <p className="text-gray-600">Sử dụng các công cụ tìm kiếm và bộ lọc để tìm bài báo</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">4. Xuất báo cáo</h3>
            <p className="text-gray-600">Tạo và xuất các báo cáo theo yêu cầu</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Hỗ trợ</h2>
        <p className="text-gray-700 mb-4">
          Nếu bạn cần thêm trợ giúp, vui lòng liên hệ:
        </p>
        <div className="pl-4 space-y-2">
          <p className="text-gray-600">Email: support@example.com</p>
          <p className="text-gray-600">Điện thoại: (123) 456-7890</p>
        </div>
      </div>
    </div>
  );
};

export default Guide;
