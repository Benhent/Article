import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../../store/authStore"
import useReviewStore from "../../../store/reviewStore"
import useUIStore from "../../../store/uiStore"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import LoadingSpinner from "../../../components/LoadingSpinner"
import type { Review } from "../../../types/article"

const STATUS_LABELS: Record<string, string> = {
  invited: "Đang mời",
  accepted: "Đã nhận",
  declined: "Đã từ chối",
  completed: "Hoàn thành",
  expired: "Hết hạn"
}

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "invited", label: "Đang mời" },
  { key: "accepted", label: "Đã nhận" },
  { key: "completed", label: "Hoàn thành" },
  { key: "declined", label: "Đã từ chối" }
]

const ReviewList = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { reviews, fetchReviews, acceptReview, declineReview } = useReviewStore()
  const { loading } = useUIStore()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (user?._id) {
      fetchReviews({ reviewerId: user._id })
    }
  }, [user?._id, fetchReviews])

  const filteredReviews = activeTab === "all"
    ? reviews
    : reviews.filter(r => r.status === activeTab)

  if (loading?.reviews) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Danh sách bài báo phản biện</h1>
      <div className="flex gap-2 mb-4">
        {TABS.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {filteredReviews.length === 0 ? (
        <div className="text-center text-gray-500 py-10">Không có bài báo nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map(review => (
            <Card key={review._id}>
              <CardHeader>
                <CardTitle>
                  {typeof review.articleId === "object" && review.articleId !== null && "title" in review.articleId
                    ? review.articleId.title
                    : "Không có tiêu đề"}
                </CardTitle>
                <Badge className="ml-2">{STATUS_LABELS[review.status]}</Badge>
              </CardHeader>
              <CardContent>
                <div>
                  <b>Hạn phản hồi:</b> {review.responseDeadline ? new Date(review.responseDeadline).toLocaleDateString() : "N/A"}
                </div>
                <div>
                  <b>Hạn nộp phản biện:</b> {review.reviewDeadline ? new Date(review.reviewDeadline).toLocaleDateString() : "N/A"}
                </div>
                <div className="flex gap-2 mt-4">
                  {review.status === "invited" && (
                    <>
                      <Button onClick={() => acceptReview(review._id)}>Nhận phản biện</Button>
                      <Button variant="outline" onClick={() => declineReview(review._id, "Từ chối qua giao diện")}>Từ chối</Button>
                    </>
                  )}
                  <Button variant="secondary" onClick={() => navigate(`/my-reviews/${review._id}`)}>
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewList
