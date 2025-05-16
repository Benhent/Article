import type React from "react"
import { Mail, Phone, MapPin, Globe, Clock } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Thông tin tạp chí */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Tạp chí Khoa Học Lạc Hồng</h3>
            <p className="text-sm">
              <span className="font-medium">Cơ quan chủ quản:</span> Trường Đại học Lạc Hồng
            </p>
            <p className="text-sm">
              <span className="font-medium">Giấy phép Hoạt động Tạp chí in và Tạp chí điện tử số:</span> xxxx ngày xxxx
            </p>
            <p className="text-sm">
              <span className="font-medium">Cơ quan cấp phép:</span> Bộ Thông tin và Truyền thông
            </p>
            <div className="pt-2">
              <p className="text-sm">
                <span className="font-medium">Tổng biên tập:</span> xxxx
              </p>
              <p className="text-sm">
                <span className="font-medium">Thư ký tòa soạn:</span> TS. Lê Phương Long
              </p>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Số 10, Huỳnh Văn Nghệ, Bửu Long, Biên Hòa, Đồng Nai, Việt Nam.</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <p className="text-sm">(02513) 953.373</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <p className="text-sm">jslhu@lhu.edu.vn</p>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <p className="text-sm">
                  <a href="https://lhj.vn" className="hover:text-primary transition-colors">
                    lhj.vn
                  </a>
                </p>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <p className="text-sm">Thứ 2 - Thứ 6: 7:30 - 16:30</p>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Bản đồ</h3>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15668.8101820521!2d106.8031561039429!3d10.948067257502792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d95970202f3f%3A0x679e7fa6d33f74e5!2zVHLGsOG7nW5nIMSR4bqhaSBo4buNYyBM4bqhYyBI4buTbmc!5e0!3m2!1svi!2s!4v1746434617167!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Trường Đại học Lạc Hồng"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Tạp chí Khoa Học Lạc Hồng. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/security" className="text-gray-600 hover:text-primary transition-colors">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer