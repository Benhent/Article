import { useEffect, useState, ChangeEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
// import { useAuthStore } from "../../../../../store/authStore"
import useReviewStore from "../../../../../store/reviewStore"
import useUIStore from "../../../../../store/uiStore"
import useArticleStore from "../../../../../store/articleStore"
import { Button } from "../../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Badge } from "../../../../../components/ui/badge"
import { Textarea } from "../../../../../components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "../../../../../components/ui/radio-group"
import { Label } from "../../../../../components/ui/label"
import { Clock, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react"
import LoadingSpinner from "../../../../../components/LoadingSpinner"
import type { ArticleAuthor } from "../../../../../types/article"

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  declined: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
}

const STATUS_NAMES = {
  pending: "Chờ phản hồi",
  accepted: "Đã nhận",
  declined: "Từ chối",
  completed: "Hoàn thành",
}

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4" />,
  accepted: <AlertCircle className="h-4 w-4" />,
  declined: <XCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
}

const RECOMMENDATIONS = [
  { value: "accept", label: "Chấp nhận bài báo" },
  { value: "minorRevision", label: "Yêu cầu chỉnh sửa nhỏ" },
  { value: "majorRevision", label: "Yêu cầu chỉnh sửa lớn" },
  { value: "reject", label: "Từ chối bài báo" },
]

const MyReviewdetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  // const { user } = useAuthStore()
  const { currentReview, fetchReviewById, completeReview } = useReviewStore()
  const { loading } = useUIStore()
  const { article, fetchArticleById } = useArticleStore()
  const [recommendation, setRecommendation] = useState<string>("")
  const [commentsForAuthor, setCommentsForAuthor] = useState<string>("")
  const [commentsForEditor, setCommentsForEditor] = useState<string>("")

  useEffect(() => {
    if (id) {
      fetchReviewById(id)
    }
  }, [id, fetchReviewById])

  useEffect(() => {
    if (currentReview && typeof currentReview.articleId === "string") {
      fetchArticleById(currentReview.articleId)
    } else if (currentReview && typeof currentReview.articleId === "object" && currentReview.articleId?._id) {
      fetchArticleById(currentReview.articleId._id)
    }
  }, [currentReview, fetchArticleById])

  const handleSubmitReview = async () => {
    if (!id) return

    try {
      await completeReview(id, {
        recommendation,
        commentsForAuthor,
        commentsForEditor,
      })
      navigate("/my-reviews")
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const handleDownloadFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  if (loading.review) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!currentReview) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy bài phản biện</h1>
          <p className="mt-2 text-gray-600">Bài phản biện này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Button className="mt-4" onClick={() => navigate("/my-reviews")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Phản biện bài báo</h1>
          <p className="text-gray-600 mt-1">Đánh giá và góp ý cho bài báo</p>
        </div>
        <Badge className={STATUS_COLORS[currentReview.status as keyof typeof STATUS_COLORS]}>
          <span className="flex items-center gap-1">
            {STATUS_ICONS[currentReview.status as keyof typeof STATUS_ICONS]}
            {STATUS_NAMES[currentReview.status as keyof typeof STATUS_NAMES]}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin bài báo */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Thông tin bài báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Tiêu đề</h3>
              <p className="text-gray-600">{article?.title || "Không có tiêu đề"}</p>
            </div>
            <div>
              <h3 className="font-medium">Tác giả</h3>
              <p className="text-gray-600">
                {Array.isArray(article?.authors)
                  ? article.authors
                      .map((author: ArticleAuthor | string) =>
                        typeof author === "string" ? author : author.fullName
                      )
                      .join(", ")
                  : "Không có thông tin"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Tóm tắt</h3>
              <p className="text-gray-600">{article?.abstract || "Không có thông tin"}</p>
            </div>
            <div>
              <h3 className="font-medium">Từ khóa</h3>
              <p className="text-gray-600">
                {Array.isArray(article?.keywords)
                  ? article.keywords.join(", ")
                  : "Không có thông tin"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">File bài báo</h3>
              <div className="flex gap-2">
                {/* Nút xem trước */}
                {article?.articleFile?.fileUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (article.articleFile.fileUrl.endsWith(".pdf")) {
                        window.open(article.articleFile.fileUrl, "_blank");
                      } else {
                        window.open(
                          `https://docs.google.com/gview?url=${encodeURIComponent(article.articleFile.fileUrl)}&embedded=true`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    Xem trước
                  </Button>
                )}
                {/* Nút tải xuống */}
                {article?.articleFile?.fileUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      window.open(article.articleFile.fileUrl, "_blank");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form phản biện */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Đánh giá và góp ý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Đề xuất</h3>
              <RadioGroup value={recommendation} onValueChange={setRecommendation}>
                {RECOMMENDATIONS.map((rec) => (
                  <div key={rec.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={rec.value} id={rec.value} />
                    <Label htmlFor={rec.value}>{rec.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Nhận xét cho tác giả</h3>
              <Textarea
                placeholder="Nhập nhận xét cho tác giả..."
                value={commentsForAuthor}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCommentsForAuthor(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Nhận xét cho biên tập viên</h3>
              <Textarea
                placeholder="Nhập nhận xét cho biên tập viên..."
                value={commentsForEditor}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCommentsForEditor(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => navigate("/my-reviews")}>
                Hủy
              </Button>
              <Button onClick={handleSubmitReview} disabled={!recommendation}>
                Gửi phản biện
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MyReviewdetail