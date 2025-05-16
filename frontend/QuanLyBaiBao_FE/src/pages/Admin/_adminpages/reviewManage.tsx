import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useReviewStore } from "../../../store/rootStore"
import type { Review } from "../../../types/article"
import { formatDate } from "../../../utils/dateUtils"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Select } from "../../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { toast } from "react-hot-toast"

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
      (typeof review.reviewerId === "object" && review.reviewerId.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phản biện</h1>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm theo tên bài báo hoặc người phản biện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-48"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="invited">Đã mời</option>
            <option value="accepted">Đã chấp nhận</option>
            <option value="declined">Đã từ chối</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="expired">Hết hạn</option>
          </Select>
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
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không tìm thấy phản biện nào
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    {typeof review.articleId === "object" ? review.articleId.title : "Loading..."}
                  </TableCell>
                  <TableCell>
                    {typeof review.reviewerId === "object" ? review.reviewerId.fullName : "Loading..."}
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
