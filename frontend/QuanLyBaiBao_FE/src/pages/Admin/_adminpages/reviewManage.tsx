import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useReviewStore } from "../../../store/rootStore"
import { formatDate } from "../../../utils/dateUtils"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import type { Review } from "../../../types/review"

interface PopulatedArticle {
  _id: string;
  title: string;
}

interface PopulatedReviewer {
  _id: string;
  name: string;
}

type PopulatedReview = Review & {
  articleId: PopulatedArticle;
  reviewerId: PopulatedReviewer;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "invited", label: "Đã mời" },
  { value: "accepted", label: "Đã chấp nhận" },
  { value: "declined", label: "Đã từ chối" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "expired", label: "Hết hạn" },
];

const ReviewManage = () => {
  const navigate = useNavigate()
  const { reviews, fetchReviews, loading } = useReviewStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

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

  const handleViewDetail = (reviewId: string) => {
    navigate(`/admin/reviews/${reviewId}`)
  }

  const isPopulatedReview = (review: Review): review is PopulatedReview => {
    return (
      typeof review.articleId === 'object' &&
      review.articleId !== null &&
      'title' in review.articleId &&
      typeof review.reviewerId === 'object' &&
      review.reviewerId !== null &&
      'name' in review.reviewerId
    )
  }

  const getArticleTitle = (review: Review) => {
    if (isPopulatedReview(review)) {
      return review.articleId.title || 'Loading...'
    }
    return 'Loading...'
  }

  const getReviewerName = (review: Review) => {
    if (isPopulatedReview(review)) {
      return review.reviewerId.name || 'Loading...'
    }
    return 'Loading...'
  }

  const filteredReviews = reviews.filter((review) => {
    const articleTitle = getArticleTitle(review)
    const reviewerName = getReviewerName(review)
    
    const matchesSearch = 
      articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sắp xếp reviews theo hạn nộp giảm dần (mới nhất lên đầu)
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const dateA = a.reviewDeadline ? new Date(a.reviewDeadline).getTime() : 0;
    const dateB = b.reviewDeadline ? new Date(b.reviewDeadline).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phản biện</h1>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-4 mb-4 items-center flex-wrap">
          <Input
            placeholder="Tìm kiếm theo tên bài báo hoặc người phản biện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`px-3 py-1 rounded-full border text-sm font-medium ${statusFilter === opt.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"} transition`}
                onClick={() => setStatusFilter(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bài báo</TableHead>
              <TableHead>Người phản biện</TableHead>
              <TableHead>Vòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hạn phản hồi</TableHead>
              <TableHead>Hạn nộp</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : sortedReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không tìm thấy phản biện nào
                </TableCell>
              </TableRow>
            ) : (
              sortedReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    {getArticleTitle(review)}
                  </TableCell>
                  <TableCell>
                    {getReviewerName(review)}
                  </TableCell>
                  <TableCell>Vòng {review.round}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(review.status || 'invited')}>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{review.responseDeadline ? formatDate(review.responseDeadline) : '-'}</TableCell>
                  <TableCell>{review.reviewDeadline ? formatDate(review.reviewDeadline) : '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => review._id && handleViewDetail(review._id)}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default ReviewManage
