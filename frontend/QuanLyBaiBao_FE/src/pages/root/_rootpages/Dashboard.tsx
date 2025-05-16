import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Users,
  Briefcase,
  Cpu,
  FlaskRoundIcon as Flask,
  Globe,
  ExternalLink,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"

gsap.registerPlugin(ScrollTrigger)

const Dashboard = () => {
  // Refs for each section
  const heroRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const researchRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = [heroRef, introRef, researchRef, boardRef, ctaRef]
    sections.forEach((ref, idx) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            delay: idx * 0.1,
          }
        )
      }
    })
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e8f0ea] p-0">
      {/* Hero Section */}
      <section ref={heroRef} className="mb-12 w-full">
        <div className="relative rounded-none overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
          <div className="relative z-10 p-8 md:p-12 text-white">
            <div className="flex items-center mb-6">
              <BookOpen className="h-10 w-10 mr-4" />
              <h1 className="text-3xl md:text-4xl font-bold">Tạp chí Khoa học Lạc Hồng</h1>
            </div>
            <p className="text-lg md:text-xl max-w-3xl mb-6">
              Tạp chí đa ngành với sứ mệnh công bố các kết quả nghiên cứu khoa học thuộc lĩnh vực đào tạo, giảng dạy của
              Trường Đại học Lạc Hồng và cộng đồng khoa học.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="h-5 w-5 mr-2" />
                <span>ISSN: 2525-2186</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="h-5 w-5 mr-2" />
                <span>Xuất bản từ 2016</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section ref={introRef} className="mb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Giới thiệu về Tạp chí</h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Mục đích, tôn chỉ và phạm vi của tạp chí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary">•</span>
                </div>
                <p>Thông tin về các hoạt động khoa học của Trường Đại học Lạc Hồng;</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-primary">•</span>
                </div>
                <p>
                  Giới thiệu công bố kết quả nghiên cứu khoa học thuộc lĩnh vực đào tạo, giảng dạy của Trường Đại học
                  Lạc Hồng.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Chu kỳ phát hành</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Tạp chí Khoa học Lạc Hồng (ISSN: 2525-2186) là một tạp chí đa ngành đã ra số đầu tiên tháng 3 năm 2016
                (Theo giấy phép xuất bản số 348/GP-BTTTT ngày 03/12/2014) kỳ hạn 03 tháng 1 kỳ, xuất bản Tiếng Việt và
                Tiếng Anh.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Research Areas Section */}
      <section ref={researchRef} className="mb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Các Lĩnh vực chính</h2>

          <Tabs defaultValue="kinh-te" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="kinh-te" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Kinh tế</span>
              </TabsTrigger>
              <TabsTrigger value="cong-nghe" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>Khoa học Công nghệ</span>
              </TabsTrigger>
              <TabsTrigger value="hoa-duoc" className="flex items-center gap-2">
                <Flask className="h-4 w-4" />
                <span>Hóa - Dược</span>
              </TabsTrigger>
              <TabsTrigger value="xa-hoi" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Xã hội</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kinh-te">
              <Card>
                <CardHeader>
                  <CardTitle>3.1. Lĩnh vực kinh tế</CardTitle>
                  <CardDescription>Các chuyên ngành nghiên cứu thuộc lĩnh vực kinh tế</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Quản trị kinh doanh
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Quản trị dịch vụ du lịch và lữ hành
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Tài chính Ngân hàng
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Kế toán
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Ngoại thương
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Luật Kinh tế
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Marketing
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Kinh doanh Quốc tế
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Chuỗi cung ứng
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cong-nghe">
              <Card>
                <CardHeader>
                  <CardTitle>3.2. Lĩnh vực Khoa học Công nghệ</CardTitle>
                  <CardDescription>Các chuyên ngành nghiên cứu thuộc lĩnh vực khoa học công nghệ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ kỹ thuật ô tô
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ tự động hóa
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ kỹ thuật Điện - Điện tử
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ kỹ thuật Cơ khí
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Linh kiện điện tử, công suất và ứng dụng
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Hệ thống lưu trữ năng lượng, truyền tải điện không dây
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Lưới điện thông minh và các vấn đề liên quan
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Hệ thống truyền động điện và phương pháp điều khiển
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Năng lượng tái tạo, năng lượng mới và hệ thống năng lượng lai
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Hệ thống điều khiển thông minh
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Truyền thông (IoT)
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Robot và hệ thống tự động trong công nghiệp
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Mạng máy tính và truyền thông
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      An toàn thông tin
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ phần mềm
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Khai thác dữ liệu
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Hệ thống quản lý thông tin
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Trí tuệ nhân tạo và Robotics
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Xử lý ảnh
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Học máy và ứng dụng
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Truyền thông đa phương tiện
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ Blockchain
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hoa-duoc">
              <Card>
                <CardHeader>
                  <CardTitle>3.3. Lĩnh vực Hóa - Dược</CardTitle>
                  <CardDescription>Các chuyên ngành nghiên cứu thuộc lĩnh vực hóa học và dược phẩm</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ dược phẩm và bào chế thuốc
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Dược liệu và Dược học cổ truyền
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Dược lý và Dược lâm sàng
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Kiểm nghiệm Dược phẩm
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Kinh tế Dược
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ thực phẩm
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Đảm bảo chất lượng và an toàn thực phẩm
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Quản lý môi trường
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ môi trường
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ sinh học
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Công nghệ kỹ thuật hóa học
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xa-hoi">
              <Card>
                <CardHeader>
                  <CardTitle>3.4. Lĩnh vực Xã hội</CardTitle>
                  <CardDescription>Các chuyên ngành nghiên cứu thuộc lĩnh vực xã hội</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Văn hóa
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      Ngôn ngữ
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Editorial Board Section */}
      <section ref={boardRef} className="mb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Ban biên tập</h2>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>HỘI ĐỒNG BIÊN TẬP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium text-primary mb-1">Tổng Biên tập:</h4>
                  <p>NGƯT.TS. Nguyễn Thị Thu Lan</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium text-primary mb-1">Chủ tịch Hội đồng:</h4>
                  <p>TS. Lâm Thành Hiển</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-primary mb-3">Phó Chủ tịch Hội đồng:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-primary/5 rounded-lg">PGS.TS. Nguyễn Vũ Quỳnh</div>
                  <div className="p-3 bg-primary/5 rounded-lg">TS. Nguyễn Văn Tân</div>
                  <div className="p-3 bg-primary/5 rounded-lg">TS. Mai Thị Ánh Tuyết</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium text-primary mb-1">Trưởng ban biên tập:</h4>
                  <p>TS. Nguyễn Thanh Sơn</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium text-primary mb-1">Thư ký tòa soạn:</h4>
                  <p>TS. Lê Phương Long</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-xl font-bold mb-4">THÀNH VIÊN HỘI ĐỒNG BIÊN TẬP</h3>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="kinh-te">
              <AccordionTrigger className="text-lg font-medium">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  LĨNH VỰC KINH TẾ
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <p>GS.TS. Nguyễn Đông Phong, Trường Đại học Kinh tế TP. Hồ Chí Minh (Cố vấn)</p>
                  <p>PGS.TS. Nguyễn Thị Liên Diệp, Trường Đại học Lạc Hồng</p>
                  <p>PGS.TS. Lưu Thanh Đức Hải, Trường Đại học Cần Thơ</p>
                  <p>PGS.TS. Phước Minh Hiệp, Trường Đại học Quốc tế Sài Gòn</p>
                  <p>PGS.TS. Lê Văn Huy, Trường Đại học Kinh tế - Đại học Đà Nẵng</p>
                  <p>PGS.TS. Nguyễn Thanh Lâm, Trường Đại học Lạc Hồng</p>
                  <p>PGS.TS. Nguyễn Quyết Thắng, Trường Đại học Công nghệ TP. Hồ Chí Minh</p>
                  <p>PGS.TS. Trương Nam Thắng, Trường Đại học Kinh tế Quốc dân</p>
                  <p>PGS.TS. Bùi Thị Thanh, Trường Đại học Kinh tế TP. Hồ Chí Minh</p>
                  <p>TS. Trần Đăng Khoa, Trường Đại học Kinh tế TP. Hồ Chí Minh</p>
                  <p>TS. Phùng Ngọc Bảo, Tạp chí Cộng sản</p>
                  <p>TS. Nguyễn Văn Hải, Trường Đại học Lạc Hồng</p>
                  <p>TS. Võ Tấn Phong, Trường Đại học Lạc Hồng</p>
                  <p>TS. Nguyễn Văn Tân, Trường Đại học Lạc Hồng</p>
                  <p>TS. Phan Thành Tâm, Trường Đại học Lạc Hồng</p>
                  <p>TS. Mai Thị Ánh Tuyết, Trường Đại học Lạc Hồng</p>
                  <p>TS. Trần Hoàng Minh, Trường Đại học Lạc Hồng</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cong-nghe">
              <AccordionTrigger className="text-lg font-medium">
                <div className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-primary" />
                  LĨNH VỰC KHOA HỌC CÔNG NGHỆ
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <p>PGS.TS. Huỳnh Văn Hóa Trường Đại học Lạc Hồng</p>
                  <p>PGS.TS. Trần Văn Lăng, Viện Cơ học và Tin học ứng dụng</p>
                  <p>PGS.TS. Nguyễn Ngọc Lâm, Trường Đại Học Lạc Hồng</p>
                  <p>PGS.TS. Nguyễn Văn Nhờ, Trường Đại học Bách Khoa TP. Hồ Chí Minh</p>
                  <p>PGS.TS. Lê Văn Phúc, Trường Đại học Giao thông - Vận tải TP. HCM</p>
                  <p>PGS.TS. Nguyễn Vũ Quỳnh, Trường Đại Học Lạc Hồng</p>
                  <p>TS. Trần Xuân Hòa, Trường Đại học Giao thông - Vận tải TP. HCM</p>
                  <p>TS. Hà Mạnh Hùng, Trường Quốc tế (Đại học Quốc gia Hà Nội)</p>
                  <p>TS. Lê Tiến Lộc, Trường Đại học Lạc Hồng</p>
                  <p>TS. Lê Phương Long, Trường Đại học Lạc Hồng</p>
                  <p>TS. Nguyễn Thanh Sơn, Trường Đại học Lạc Hồng</p>
                  <p>TS. Lê Phương Trường, Trường Đại học Lạc Hồng</p>
                  <p>TS. Phan Như Quân, Trường Đại học Lạc Hồng</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hoa-duoc">
              <AccordionTrigger className="text-lg font-medium">
                <div className="flex items-center">
                  <Flask className="h-5 w-5 mr-2 text-primary" />
                  LĨNH VỰC HÓA - DƯỢC
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <p>PGS.TS. Võ Thị Bạch Huệ, Trường Đại học Lạc Hồng</p>
                  <p>TS. Phạm Ngọc Tuấn Anh, Trường Đại học Y Dược TP. Hồ Chí Minh</p>
                  <p>TS. Nguyễn Trọng Anh, Trường Đại học Lạc Hồng</p>
                  <p>TS. Cao Văn Dư, Trường Đại học Lạc Hồng</p>
                  <p>TS. Lê Thị Thu Hương, Trường Đại học Lạc Hồng</p>
                  <p>TS. Hồ Dũng Mạnh, Trường Đại học Lạc Hồng</p>
                  <p>TS. Nguyễn Thị Như Quỳnh, Trường Đại học Lạc Hồng</p>
                  <p>TS. Nguyễn Hữu Lạc Thủy, Trường Đại học Y Dược TP. Hồ Chí Minh</p>
                  <p>TS. Trương Ngọc Tuyền, Trường Đại học Y Dược TP. Hồ Chí Minh</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="xa-hoi">
              <AccordionTrigger className="text-lg font-medium">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  LĨNH VỰC XÃ HỘI
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <p>TS. Nguyễn Phước Hiền, Trường Đại học Nguyễn Tất Thành TP. Hồ Chí Minh</p>
                  <p>TS. Nguyễn Thị Hiền, Trường Đại học Khoa học Xã hội và Nhân văn TP. HCM</p>
                  <p>TS. Ngô Hương Lan, Trường Đại học Văn Lang</p>
                  <p>TS. Nguyễn Hữu Nghị, Trường Đại Học Lạc Hồng</p>
                  <p>TS. Trần Thị Phong, Đài Phát thanh và Truyền hình Đồng Nai</p>
                  <p>TS. Trương Phan Châu Tâm, Trường Đại học Khoa học Xã hội và Nhân văn TP. HCM</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="mb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Gửi bài báo khoa học</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Mời các nhà nghiên cứu, giảng viên và sinh viên gửi bài báo khoa học để đăng tải trên Tạp chí Khoa học Lạc
            Hồng.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-primary hover:bg-opacity-90 px-6 py-3 rounded-lg font-medium flex items-center">
              Hướng dẫn gửi bài
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium flex items-center">
              Liên hệ Ban biên tập
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Dashboard