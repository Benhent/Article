"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useArticleStore, useReviewStore, useIssueStore, useUIStore } from "../../../../../store/rootStore"
import { Button } from "../../../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs"
import { Badge } from "../../../../../components/ui/badge"
import { Card, CardContent } from "../../../../../components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../../components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select"
import { Textarea } from "../../../../../components/ui/textarea"
import { Input } from "../../../../../components/ui/input"
import { ArrowLeft, Download, Edit, Eye, FileText, Trash2, Upload, UserPlus, Send, Clock } from "lucide-react"
import LoadingSpinner from "../../../../../components/LoadingSpinner"
import type { Review, Issue } from "../../../../../types/article"

const statusColor: Record<string, string> = {
  published: "bg-green-500 text-white",
  under_review: "bg-blue-500 text-white",
  draft: "bg-gray-500 text-white",
  rejected: "bg-red-500 text-white",
}

const statusLabels: Record<string, string> = {
  published: "Đã xuất bản",
  under_review: "Đang xét duyệt",
  draft: "Bản nháp",
  rejected: "Từ chối",
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const { article, fetchArticleById, changeArticleStatus, deleteArticle, publishArticle, loading } = useArticleStore()
  const { reviews, fetchReviews, createReview } = useReviewStore()
  const { issues, fetchIssues } = useIssueStore()
  const { showSuccessToast, showErrorToast } = useUIStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState("overview")
  const [statusReason, setStatusReason] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [publishData, setPublishData] = useState({
    doi: "",
    pageStart: "",
    pageEnd: "",
    issueId: "",
  })
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [reviewDeadline, setReviewDeadline] = useState("")

  useEffect(() => {
    if (id) {
      fetchArticleById(id)
      fetchReviews({ articleId: id })
      fetchIssues()
    }
  }, [id, fetchArticleById, fetchReviews, fetchIssues])

  useEffect(() => {
    if (article) {
      setPublishData({
        doi: article.doi || "",
        pageStart: article.pageStart?.toString() || "",
        pageEnd: article.pageEnd?.toString() || "",
        issueId: article.issueId?.toString() || "",
      })
    }
  }, [article])

  const handleStatusChange = async () => {
    if (!id || !newStatus) return
    try {
      await changeArticleStatus(id, newStatus, statusReason)
      setStatusReason("")
      setNewStatus("")
    } catch (error) {
      console.error("Error changing status:", error)
    }
  }

  const handlePublish = async () => {
    if (!id) return
    try {
      await publishArticle(id, {
        doi: publishData.doi,
        pageStart: Number(publishData.pageStart) || undefined,
        pageEnd: Number(publishData.pageEnd) || undefined,
        issueId: publishData.issueId || undefined,
      })
    } catch (error) {
      console.error("Error publishing article:", error)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteArticle(id)
      navigate("/admin/articles")
    } catch (error) {
      console.error("Error deleting article:", error)
    }
  }

  const handleAddReviewer = async () => {
    if (!id || !reviewerEmail || !reviewDeadline) {
      showErrorToast("Vui lòng nhập đầy đủ thông tin")
      return
    }

    try {
      // Normally you would validate the email and check if the user exists
      // For simplicity, we'll just create the review invitation
      const responseDeadline = new Date()
      responseDeadline.setDate(responseDeadline.getDate() + 7) // 7 days to respond

      await createReview({
        articleId: id,
        reviewerId: reviewerEmail,
        responseDeadline: responseDeadline.toISOString(),
        reviewDeadline,
        status: "pending",
        round: 1,
      })

      setReviewerEmail("")
      setReviewDeadline("")
      showSuccessToast("Đã gửi lời mời phản biện")
      fetchReviews({ articleId: id })
    } catch (error) {
      console.error("Error adding reviewer:", error)
      showErrorToast("Không thể gửi lời mời phản biện")
    }
  }

  const handleSendReminder = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      showSuccessToast("Đã gửi nhắc nhở")
    } catch (error) {
      console.error("Error sending reminder:", error)
      showErrorToast("Không thể gửi nhắc nhở")
    }
  }

  if (loading.article) return <LoadingSpinner />
  if (!article) return <div>Không tìm thấy bài báo</div>

  const getIssueTitle = (issueId?: string) => {
    if (!issueId) return "Chưa thuộc số nào"
    const issue = issues.find((i) => i._id === issueId)
    return issue ? `${issue.title} (Tập ${issue.volumeNumber}, Số ${issue.issueNumber})` : "Không tìm thấy số"
  }

  const getReviewerName = (reviewer: string | { _id: string; fullName: string; email: string }) => {
    if (typeof reviewer === "string") return reviewer
    return `${reviewer.fullName} (${reviewer.email})`
  }

  const getReviewStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "Chờ phản hồi", color: "bg-yellow-500" },
      accepted: { label: "Đã nhận", color: "bg-blue-500" },
      declined: { label: "Từ chối", color: "bg-red-500" },
      completed: { label: "Hoàn thành", color: "bg-green-500" },
    }
    return statusMap[status] || { label: status, color: "bg-gray-500" }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/articles")} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Thay đổi trạng thái</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thay đổi trạng thái bài báo</DialogTitle>
                <DialogDescription>Chọn trạng thái mới và nhập lý do (nếu cần)</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái mới" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="under_review">Đang xét duyệt</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Lý do thay đổi trạng thái (tùy chọn)"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleStatusChange}>Lưu thay đổi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {article.status !== "published" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Xuất bản</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xuất bản bài báo</DialogTitle>
                  <DialogDescription>Nhập thông tin xuất bản cho bài báo</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label className="text-sm font-medium">DOI</label>
                    <Input
                      placeholder="Nhập DOI"
                      value={publishData.doi}
                      onChange={(e) => setPublishData({ ...publishData, doi: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Số</label>
                    <Select
                      value={publishData.issueId}
                      onValueChange={(value) => setPublishData({ ...publishData, issueId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn số" />
                      </SelectTrigger>
                      <SelectContent>
                        {issues &&
                          issues.length > 0 &&
                          issues.map((issue: Issue) => (
                            <SelectItem key={issue._id} value={issue._id}>
                              {issue.title} (Tập {issue.volumeNumber}, Số {issue.issueNumber})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Trang bắt đầu</label>
                      <Input
                        type="number"
                        placeholder="Trang bắt đầu"
                        value={publishData.pageStart}
                        onChange={(e) => setPublishData({ ...publishData, pageStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Trang kết thúc</label>
                      <Input
                        type="number"
                        placeholder="Trang kết thúc"
                        value={publishData.pageEnd}
                        onChange={(e) => setPublishData({ ...publishData, pageEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePublish}>Xuất bản</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button onClick={() => navigate(`/admin/articles/${article._id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa bài báo này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  {article.titlePrefix && <div className="text-gray-500 text-sm">{article.titlePrefix}</div>}
                  <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
                  {article.subtitle && <div className="text-gray-600">{article.subtitle}</div>}
                </div>
                <div className="mt-2 md:mt-0">
                  <Badge className={statusColor[article.status] || "bg-gray-200"}>
                    {statusLabels[article.status] || article.status}
                  </Badge>
                </div>
              </div>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="authors">Tác giả</TabsTrigger>
                  <TabsTrigger value="files">Tệp đính kèm</TabsTrigger>
                  <TabsTrigger value="reviews">Phản biện</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Tóm tắt</h3>
                      <div className="bg-gray-50 p-4 rounded-md">{article.abstract}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Thông tin chung</h3>
                        <div className="space-y-2">
                          <div className="flex">
                            <span className="font-medium w-32">Lĩnh vực:</span>
                            <span>
                              {typeof article.field === "string"
                                ? article.field
                                : article.field?.name || "Không có lĩnh vực"}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Lĩnh vực phụ:</span>
                            <span>
                              {Array.isArray(article.secondaryFields) && article.secondaryFields.length > 0
                                ? article.secondaryFields.map((f) => (typeof f === "string" ? f : f.name)).join(", ")
                                : "Không có"}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Ngôn ngữ:</span>
                            <span>{article.articleLanguage === "en" ? "Tiếng Anh" : "Tiếng Việt"}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Số:</span>
                            <span>{getIssueTitle(article.issueId)}</span>
                          </div>
                          {article.doi && (
                            <div className="flex">
                              <span className="font-medium w-32">DOI:</span>
                              <span>{article.doi}</span>
                            </div>
                          )}
                          <div className="flex">
                            <span className="font-medium w-32">Từ khóa:</span>
                            <span>{Array.isArray(article.keywords) ? article.keywords.join(", ") : ""}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">Thống kê</h3>
                        <div className="space-y-2">
                          <div className="flex">
                            <span className="font-medium w-32">Ngày tạo:</span>
                            <span>{new Date(article.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Cập nhật:</span>
                            <span>{new Date(article.updatedAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Lượt xem:</span>
                            <span>{article.viewCount || 0}</span>
                          </div>
                          {article.pageStart && article.pageEnd && (
                            <div className="flex">
                              <span className="font-medium w-32">Trang:</span>
                              <span>
                                {article.pageStart} - {article.pageEnd}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="authors">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Danh sách tác giả</h3>
                    {Array.isArray(article.authors) && article.authors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {article.authors.map((author, idx) => (
                          <Card key={idx}>
                            <CardContent className="p-4">
                              <div className="font-semibold">
                                {typeof author === "string" ? author : author.fullName}
                                {typeof author !== "string" && author.isCorresponding && (
                                  <Badge className="ml-2 bg-blue-500">Tác giả liên hệ</Badge>
                                )}
                              </div>
                              {typeof author !== "string" && (
                                <>
                                  <div className="text-sm text-gray-600">{author.email}</div>
                                  {author.institution && (
                                    <div className="text-sm text-gray-600">{author.institution}</div>
                                  )}
                                  {author.country && <div className="text-sm text-gray-600">{author.country}</div>}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">Không có thông tin tác giả</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="files">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Tệp đính kèm</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/articles/${article._id}/edit`)}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Tải lên tệp mới
                      </Button>
                    </div>

                    {Array.isArray(article.files) && article.files.length > 0 ? (
                      <div className="space-y-2">
                        {article.files.map((file) => (
                          <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-gray-500" />
                              <div>
                                <div className="font-medium">{file.fileName}</div>
                                <div className="text-xs text-gray-500">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB •
                                  {new Date(file.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={file.fileUrl} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">Không có tệp đính kèm</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Phản biện</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" /> Thêm người phản biện
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Thêm người phản biện</DialogTitle>
                            <DialogDescription>Nhập email và thời hạn để gửi lời mời phản biện</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
                              <label className="text-sm font-medium">Email người phản biện</label>
                              <Input
                                placeholder="Nhập email"
                                value={reviewerEmail}
                                onChange={(e) => setReviewerEmail(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Thời hạn phản biện</label>
                              <Input
                                type="date"
                                value={reviewDeadline}
                                onChange={(e) => setReviewDeadline(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddReviewer}>Gửi lời mời</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {reviews &&
                      reviews.length > 0 &&
                      reviews.map((review: Review) => {
                        const status = getReviewStatusLabel(review.status)
                        return (
                          <div key={review._id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{getReviewerName(review.reviewerId)}</div>
                                <Badge className={`${status.color} mt-1`}>{status.label}</Badge>
                              </div>
                              <div className="flex gap-2">
                                {review.status === "pending" && (
                                  <Button size="sm" variant="outline" onClick={() => handleSendReminder(review._id)}>
                                    <Send className="mr-2 h-4 w-4" /> Nhắc nhở
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/admin/reviews/${review._id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> Chi tiết
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Thời hạn: {new Date(review.reviewDeadline).toLocaleDateString("vi-VN")}
                            </div>
                            {review.status === "completed" && review.recommendation && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                <div className="font-medium">Đề xuất: {review.recommendation}</div>
                                {review.commentsForEditor && (
                                  <div className="mt-1 text-sm">
                                    <span className="font-medium">Nhận xét cho biên tập viên:</span>{" "}
                                    {review.commentsForEditor}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Ảnh thu nhỏ</h3>
              {article.thumbnail ? (
                <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={article.thumbnail || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">Không có ảnh thu nhỏ</span>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Thông tin người gửi</h3>
                {typeof article.submitterId !== "string" && article.submitterId ? (
                  <div>
                    <div className="font-medium">{article.submitterId.fullName}</div>
                    <div className="text-sm text-gray-600">{article.submitterId.email}</div>
                    {article.submitterId.institution && (
                      <div className="text-sm text-gray-600">{article.submitterId.institution}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">Không có thông tin người gửi</div>
                )}
              </div>

              {article.submitterNote && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Ghi chú</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">{article.submitterNote}</div>
                </div>
              )}

              {Array.isArray(article.statusHistory) && article.statusHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Lịch sử trạng thái</h3>
                  <div className="space-y-2">
                    {article.statusHistory.map((history, idx) => (
                      <div key={idx} className="text-sm border-l-2 border-gray-300 pl-3 py-1">
                        <div className="font-medium">
                          {typeof history === "string" ? history : `${statusLabels[history.status] || history.status}`}
                        </div>
                        {typeof history !== "string" && (
                          <>
                            <div className="text-gray-500">
                              {new Date(history.timestamp).toLocaleDateString("vi-VN")}
                            </div>
                            {history.reason && <div className="text-gray-600 mt-1">{history.reason}</div>}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}