import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useReviewStore } from "../../../store/rootStore"
import { formatDate } from "../../../utils/dateUtils"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"

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

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      (typeof review.articleId === "object" && review.articleId.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof review.reviewerId === "object" && review.reviewerId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sắp xếp reviews theo hạn nộp giảm dần (mới nhất lên đầu)
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const dateA = new Date(a.reviewDeadline).getTime();
    const dateB = new Date(b.reviewDeadline).getTime();
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
                    {typeof review.articleId === "object" ? review.articleId.title : "Loading..."}
                  </TableCell>
                  <TableCell>
                    {typeof review.reviewerId === "object" ? review.reviewerId.name : "Loading..."}
                  </TableCell>
                  <TableCell>Vòng {review.round}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(review.responseDeadline)}</TableCell>
                  <TableCell>{formatDate(review.reviewDeadline)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(review._id)}
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
