import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useArticleStore from "../../../store/articleStore"
import useUIStore from "../../../store/uiStore"
import useFieldStore from "../../../store/fieldStore"
import useAuthStore from "../../../store/authStore"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, FileUp, Calendar, LogIn } from 'lucide-react'
import LoadingSpinner from "../../../components/LoadingSpinner"
import type { Article } from "../../../types/article"

// Status badge colors
const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  published: "bg-purple-100 text-purple-800",
  revisions_required: "bg-orange-100 text-orange-800",
}

// Status display names
const STATUS_NAMES = {
  draft: "Bản nháp",
  submitted: "Đã gửi",
  under_review: "Đang xét duyệt",
  accepted: "Đã chấp nhận",
  rejected: "Từ chối",
  published: "Đã xuất bản",
  revisions_required: "Yêu cầu chỉnh sửa",
}

// Status icons
const STATUS_ICONS = {
  draft: <FileText className="h-4 w-4" />,
  submitted: <FileUp className="h-4 w-4" />,
  under_review: <Clock className="h-4 w-4" />,
  accepted: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  published: <CheckCircle className="h-4 w-4" />,
  revisions_required: <AlertCircle className="h-4 w-4" />,
}

const PostArticle = () => {
  const navigate = useNavigate()
  const { articles, pagination, fetchArticles } = useArticleStore()
  const { loading } = useUIStore()
  const { fetchFields } = useFieldStore()
  const { isAuthenticated, user } = useAuthStore()
  
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  
  const ITEMS_PER_PAGE = 6

  // Fetch user's articles on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchArticles({ 
        page, 
        limit: ITEMS_PER_PAGE,
        submitterId: user?._id
      })
      fetchFields({ isActive: true })
    }
  }, [fetchArticles, fetchFields, page, isAuthenticated, user])

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Handle view article details
  const handleViewArticle = (id: string) => {
    navigate(`/articles/${id}`)
  }

  // Handle create new article
  const handleCreateArticle = () => {
    navigate('/admin/articles/create')
  }

  // Filter articles based on active tab
  const filteredArticles = React.useMemo(() => {
    if (!Array.isArray(articles)) return []
    
    if (activeTab === "all") return articles
    return articles.filter(article => article.status === activeTab)
  }, [articles, activeTab])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <LogIn className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
            <p className="text-gray-600 mb-6">
              Để quản lý và gửi bài báo, bạn cần đăng nhập vào hệ thống.
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button variant="outline" onClick={() => navigate('/signup')}>
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bài báo của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi các bài báo bạn đã gửi</p>
        </div>
        
        <Button className="flex items-center gap-2" onClick={handleCreateArticle}>
          <Plus className="h-4 w-4" />
          Gửi bài báo mới
        </Button>
      </div>

      {/* Tabs for filtering articles */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="draft">Bản nháp</TabsTrigger>
          <TabsTrigger value="submitted">Đã gửi</TabsTrigger>
          <TabsTrigger value="under_review">Đang xét duyệt</TabsTrigger>
          <TabsTrigger value="revisions_required">Cần chỉnh sửa</TabsTrigger>
          <TabsTrigger value="accepted">Đã chấp nhận</TabsTrigger>
          <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {loading.articles ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article: Article) => (
                <Card key={article._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={STATUS_COLORS[article.status as keyof typeof STATUS_COLORS] || "bg-gray-100"}>
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[article.status as keyof typeof STATUS_ICONS] || <FileText className="h-4 w-4" />}
                          {STATUS_NAMES[article.status as keyof typeof STATUS_NAMES] || article.status}
                        </span>
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.createdAt)}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2 line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {article.abstract || "Không có tóm tắt"}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Array.isArray(article.keywords) && article.keywords.slice(0, 3).map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {Array.isArray(article.keywords) && article.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewArticle(article._id)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-900">Không có bài báo nào</p>
              <p className="mt-2 text-gray-500">
                {activeTab === "all" 
                  ? "Bạn chưa gửi bài báo nào. Hãy bắt đầu bằng cách nhấn nút \"Gửi bài báo mới\"."
                  : `Bạn không có bài báo nào ở trạng thái "${STATUS_NAMES[activeTab as keyof typeof STATUS_NAMES] || activeTab}".`
                }
              </p>
              <Button className="mt-4" onClick={handleCreateArticle}>
                <Plus className="h-4 w-4 mr-2" />
                Gửi bài báo mới
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: pagination.pages }).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={page === idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className="cursor-pointer"
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(pagination.pages, page + 1))}
                  className={page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Submission Guidelines */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Quy định gửi bài</h2>
        <Separator className="mb-6" />
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Checklist cho các bài chuẩn bị gửi</h3>
          <p className="mb-4 text-gray-700">
            Là một phần của quy trình gửi, các tác giả được yêu cầu kiểm tra sự tuân thủ của họ đối với tất cả các mục sau đây và các bài gửi có thể được trả lại cho các tác giả không tuân thủ các mục này.
          </p>
          
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Tính nguyên bản</AlertTitle>
              <AlertDescription>
                Bài viết là công trình gốc chưa được xuất bản ở bất kì Tạp chí nào kể cả Hội thảo quốc tế có yêu cầu ký copyright
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Tiêu đề</AlertTitle>
              <AlertDescription>
                Tên bài viết không nên vượt quá 20 từ
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Định dạng</AlertTitle>
              <AlertDescription>
                Bài báo phải được trình bày trên khổ A4 theo chiều dọc, với các thông số PageSetup cụ thể như sau: Top: 3 cm, Bottom: 2 cm, Left: 3,0 cm, Right: 2 cm, Header: 1cm, Footer: 1,2 cm. Nội dung bài báo gõ bằng font chữ Times New Roman, cỡ 11, không dãn hay co cỡ chữ; chế độ dãn dòng: Single, khoảng trống dòng: before: 0, after: 3pt; căn lề justified. Khoảng thụt đầu dòng của đoạn văn là 0,5 cm. Tiêu đề các phần không thụt đầu dòng. Khoảng trống dòng của tiêu đề: before 6, after 6.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Tóm tắt</AlertTitle>
              <AlertDescription>
                Từ khóa trong khoảng 150-250 từ gồm các nội dung Giới thiệu nghiên cứu, mục đích nghiên cứu, phương pháp nghiên cứu, kết quả và kết luận.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Thông tin liên hệ</AlertTitle>
              <AlertDescription>
                Để tiện liên hệ người viết cần ghi rõ: Họ tên, học hàm, học vị, chuyên ngành, điện thoại, fax, email, địa chỉ cuối bài.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Từ khóa</AlertTitle>
              <AlertDescription>
                Liệt kê đủ 5 từ khóa
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Thông tin tác giả</AlertTitle>
              <AlertDescription>
                Tất cả tác giả là thành viên bài báo cần cung cấp thông tin đầy đủ gồm họ tên, nơi công tác và email. (khi khai báo thông tin để nộp bài)
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Công thức</AlertTitle>
              <AlertDescription>
                Tất cả công thức được đánh số thứ tự từ số đầu tiên (1) đến số cuối cùng (n+1).
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Tài liệu tham khảo</AlertTitle>
              <AlertDescription>
                Tài liệu tham khảo theo chuẩn IEEE. Số tài liệu trong danh mục tài liệu tham khảo bằng số tài liệu được trích dẫn trong bài và để trong ngoặc vuông [....].
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Độ dài bài viết</AlertTitle>
              <AlertDescription>
                Nội dung bài viết không vượt quá 10 (mười) trang A4 (210x297mm), bao gồm cả hình ảnh, bảng biểu, tài liệu tham khảo.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostArticle