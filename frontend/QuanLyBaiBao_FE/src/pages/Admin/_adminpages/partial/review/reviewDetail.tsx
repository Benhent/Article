import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import useReviewStore from "../../../../../store/reviewStore"
import { formatDate } from "../../../../../utils/dateUtils"
import { Badge } from "../../../../../components/ui/badge"
import { Button } from "../../../../../components/ui/button"
import { Card } from "../../../../../components/ui/card"

const ReviewDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentReview, fetchReviewById } = useReviewStore()

  useEffect(() => {
    if (id) {
      fetchReviewById(id)
    }
  }, [id, fetchReviewById])

  // Debug log
  console.log("currentReview:", currentReview)

  // Loading state: show loading if currentReview chưa có và reviewId đã có
  if (!currentReview && id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  if (!currentReview) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Không tìm thấy thông tin phản biện</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "invited":
        return "bg-yellow-500"
      case "accepted":
        return "bg-blue-500"
      case "declined":
        return "bg-red-500"
      case "completed":
        return "bg-green-500"
      case "expired":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chi tiết phản biện</h1>
        <Button variant="outline" onClick={() => navigate("/admin/reviews")}>Quay lại</Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bài báo</p>
              <p className="font-medium">
                {typeof currentReview.articleId === "object" && currentReview.articleId !== null && "title" in currentReview.articleId
                  ? currentReview.articleId.title
                  : "Không có tiêu đề"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Người phản biện</p>
              <p className="font-medium">
                {typeof currentReview.reviewerId === "object" && currentReview.reviewerId !== null && "name" in currentReview.reviewerId
                  ? currentReview.reviewerId.name
                  : "Không rõ"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vòng phản biện</p>
              <p className="font-medium">Vòng {currentReview.round}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <Badge className={getStatusColor(currentReview.status)}>
                {currentReview.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hạn phản hồi</p>
              <p className="font-medium">{formatDate(currentReview.responseDeadline)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hạn nộp</p>
              <p className="font-medium">{formatDate(currentReview.reviewDeadline)}</p>
            </div>
          </div>
        </Card>

        {currentReview.status === "completed" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Kết quả phản biện</h2>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Đề xuất</p>
                <p className="font-medium">{currentReview.recommendation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nhận xét cho tác giả</p>
                <p className="whitespace-pre-wrap">{currentReview.comments?.forAuthor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nhận xét cho biên tập viên</p>
                <p className="whitespace-pre-wrap">{currentReview.comments?.forEditor}</p>
              </div>
            </div>
          </Card>
        )}

        {currentReview.status === "declined" && currentReview.declineReason && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Lý do từ chối</h2>
            <p className="whitespace-pre-wrap">{currentReview.declineReason}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ReviewDetail 