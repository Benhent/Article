import { Shield, Copyright } from "lucide-react";

const Security = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Cam kết bảo mật */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-800">Cam kết bảo mật</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Tên và địa chỉ email được nhập trong trang tạp chí này sẽ được sử dụng riêng cho các mục đích đã nêu của tạp chí này và sẽ không được cung cấp cho bất kỳ mục đích nào khác hoặc cho bất kỳ bên nào khác.
          </p>
        </section>

        {/* Thông báo bản quyền */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Copyright className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-800">Thông báo bản quyền</h2>
          </div>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Khi một bản thảo bài báo được gửi đến Tạp chí Khoa học Lạc Hồng (JSLHU), (các) tác giả đồng ý rằng nội dung được mô tả trong bản thảo là bản gốc của (các) tác giả và không được xuất bản hoặc đang được các Tạp chí khác bình duyệt; và khi nộp bản thảo cho tạp chí, (các) tác giả đồng ý rằng tất cả các nội dung của bản thảo đã được chấp thuận bởi tất cả các tác giả có tên trên bản thảo; và nếu bản thảo được JSLHU chấp nhận, (các) tác giả đồng ý tự động chuyển tất cả bản quyền cho JSLHU.
            </p>
            <p>
              Toàn bộ thông tin, dữ liệu, ý kiến trong các bài báo đăng trên Tạp chí Khoa học Lạc Hồng (JSLHU) chỉ là tuyên bố cá nhân của các tác giả tương ứng. Tác giả chịu trách nhiệm về tất cả nội dung trong (các) bài viết của họ bao gồm tính chính xác của các thông tin, tuyên bố, nguồn trích dẫn, v.v. Tạp chí Khoa học Lạc Hồng và các biên tập viên từ chối bất kỳ trách nhiệm pháp lý nào về việc vi phạm quyền của các bên khác, hoặc bất kỳ thiệt hại nào phát sinh do việc sử dụng hoặc áp dụng bất kỳ nội dung nào của Tạp chí Khoa học Lạc Hồng.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Security;
