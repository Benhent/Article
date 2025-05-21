import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import useContactStore from "../../../store/contact"

export default function Contact() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Contact Form and Info Section */}
      <ContactSection />

      {/* Map Section */}
      <MapSection />

      {/* FAQ Section */}
      <FaqSection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary py-16 md:py-24">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-30"></div>
        <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="border border-white/5"
              style={{
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge className="mb-4 bg-white/20 text-white border-white/20 backdrop-blur-sm">Liên hệ</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Liên hệ với Ban biên tập</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn về Tạp chí Khoa học Lạc Hồng
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <ContactMethod icon={<Mail className="h-5 w-5" />} label="Email" value="tapchi@lhu.edu.vn" />
            <ContactMethod icon={<Phone className="h-5 w-5" />} label="Điện thoại" value="(0251) 3951 777" />
            <ContactMethod
              icon={<Clock className="h-5 w-5" />}
              label="Giờ làm việc"
              value="Thứ 2 - Thứ 6: 8:00 - 17:00"
            />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  )
}

interface ContactMethodProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ContactMethod({ icon, label, value }: ContactMethodProps) {
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
      {icon}
      <div className="text-left">
        <div className="text-xs text-white/70">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  )
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

function AnimatedSection({ children, className = "" }: AnimatedSectionProps) {
  const controls = useAnimation()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function ContactSection() {
  const { submitContact, loading } = useContactStore();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await submitContact(formState)
      setIsSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      }, 3000)
    } catch (error) {
      // Error is handled by the store
    }
  }

  return (
    <AnimatedSection className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Badge className="mb-4 bg-accent text-primary">Gửi tin nhắn</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Liên hệ với chúng tôi</h2>
            <p className="text-muted-foreground mb-8">
              Vui lòng điền đầy đủ thông tin vào biểu mẫu bên dưới. Ban biên tập sẽ phản hồi trong thời gian sớm nhất.
            </p>

            {isSubmitted ? (
              <Card className="bg-accent/50 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Gửi tin nhắn thành công!</h3>
                    <p className="text-muted-foreground">
                      Cảm ơn bạn đã liên hệ với chúng tôi. Ban biên tập sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="pl-10"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="pl-10"
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Tiêu đề</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      required
                      className="pl-10"
                      placeholder="Nhập tiêu đề"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Nội dung</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    required
                    className="min-h-[150px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Gửi tin nhắn
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div>
            <Card className="h-full border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-primary">Thông tin liên hệ</CardTitle>
                <CardDescription>Các kênh liên hệ chính thức của Tạp chí Khoa học Lạc Hồng</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Địa chỉ</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Trường Đại học Lạc Hồng</p>
                        <p className="text-muted-foreground">
                          Số 10 Huỳnh Văn Nghệ, P. Bửu Long, TP. Biên Hòa, Tỉnh Đồng Nai
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Liên hệ trực tiếp</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Điện thoại</p>
                          <p className="font-medium">(0251) 3951 777</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">tapchi@lhu.edu.vn</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <p className="font-medium">tapchi.lhu.edu.vn</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

function MapSection() {
  return (
    <AnimatedSection className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-accent text-primary">Vị trí</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Bản đồ</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tạp chí Khoa học Lạc Hồng đặt tại Trường Đại học Lạc Hồng, Thành phố Biên Hòa, Tỉnh Đồng Nai
          </p>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-lg border border-border h-[400px] md:h-[500px]">
          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <p className="text-lg font-medium text-primary">Bản đồ Trường Đại học Lạc Hồng</p>
              <p className="text-muted-foreground mb-6">
                Số 10 Huỳnh Văn Nghệ, P. Bửu Long, TP. Biên Hòa, Tỉnh Đồng Nai
              </p>
              <Button className="bg-primary hover:bg-primary/90">Xem bản đồ Google Maps</Button>
            </div>
          </div>
          {/* This would be replaced with an actual map component in a real implementation */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15668.395461546836!2d106.8031561039429!3d10.95590412864198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d95970202f3f%3A0x679e7fa6d33f74e5!2zVHLGsOG7nW5nIMSR4bqhaSBo4buNYyBM4bqhYyBI4buTbmc!5e0!3m2!1svi!2s!4v1746523900483!5m2!1svi!2s"
            title="Bản đồ Trường Đại học Lạc Hồng"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </AnimatedSection>
  )
}

function FaqSection() {
  return (
    <AnimatedSection className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-accent text-primary">Hỗ trợ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Câu hỏi thường gặp</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Những câu hỏi thường gặp về quy trình gửi bài và xuất bản tại Tạp chí Khoa học Lạc Hồng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <FaqCard
            question="Làm thế nào để gửi bài báo khoa học?"
            answer="Để gửi bài báo khoa học, tác giả cần chuẩn bị bài viết theo đúng quy định về hình thức và nội dung của Tạp chí, sau đó gửi qua hệ thống trực tuyến hoặc email đến địa chỉ tapchi@lhu.edu.vn."
          />
          <FaqCard
            question="Quy trình phản biện bài báo như thế nào?"
            answer="Bài báo sau khi nhận được sẽ được Ban biên tập xem xét sơ bộ. Nếu đạt yêu cầu, bài báo sẽ được gửi cho ít nhất 2 phản biện độc lập. Thời gian phản biện thường kéo dài từ 4-8 tuần."
          />
          <FaqCard
            question="Tạp chí có tính phí xuất bản không?"
            answer="Có, Tạp chí có thu phí xuất bản để trang trải chi phí phản biện, biên tập và xuất bản. Mức phí cụ thể sẽ được thông báo cho tác giả sau khi bài báo được chấp nhận đăng."
          />
          <FaqCard
            question="Tôi có thể theo dõi tiến độ xử lý bài báo không?"
            answer="Có, tác giả có thể theo dõi tiến độ xử lý bài báo thông qua hệ thống quản lý trực tuyến hoặc liên hệ trực tiếp với Ban biên tập qua email hoặc điện thoại."
          />
          <FaqCard
            question="Tạp chí xuất bản với tần suất như thế nào?"
            answer="Tạp chí Khoa học Lạc Hồng xuất bản định kỳ 3 tháng/số, mỗi năm 4 số vào các tháng 3, 6, 9 và 12."
          />
          <FaqCard
            question="Làm thế nào để đặt mua Tạp chí?"
            answer="Để đặt mua Tạp chí, bạn có thể liên hệ trực tiếp với Ban biên tập qua email tapchi@lhu.edu.vn hoặc điện thoại (0251) 3951 777 để được hướng dẫn cụ thể."
          />
        </div>
      </div>
    </AnimatedSection>
  )
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg text-primary">{question}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  )
}