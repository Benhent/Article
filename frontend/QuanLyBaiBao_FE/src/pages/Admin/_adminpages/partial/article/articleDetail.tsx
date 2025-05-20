import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useArticleStore, useReviewStore, useIssueStore, useUIStore, useAuthStore } from "../../../../../store/rootStore"
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
import apiService from "../../../../../services/api"
import { Label } from "../../../../../components/ui/label"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../../../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../components/ui/popover"
import { cn } from "../../../../../lib/utils"

const statusColor: Record<string, string> = {
  published: "bg-green-500 text-white",
  under_review: "bg-blue-500 text-white",
  rejected: "bg-red-500 text-white",
}

const statusLabels: Record<string, string> = {
  published: "Đã xuất bản",
  under_review: "Đang xét duyệt",
  rejected: "Từ chối",
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const { article, fetchArticleById, changeArticleStatus, deleteArticle, publishArticle, loading } = useArticleStore()
  const { reviews, fetchReviews, createReview } = useReviewStore()
  const { issues, fetchIssues } = useIssueStore()
  const { showSuccessToast, showErrorToast } = useUIStore()
  const { checkEmailExists, getUserByEmail } = useAuthStore()
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
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null)

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
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể xuất bản bài báo. Vui lòng kiểm tra lại trạng thái và thông tin.'
      showErrorToast(message)
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
      // 1. Kiểm tra email có tồn tại không
      const emailCheck = await checkEmailExists(reviewerEmail)
      if (!emailCheck) {
        showErrorToast("Email không tồn tại trong hệ thống")
        return
      }

      // 2. Lấy user theo email từ store
      const user = await getUserByEmail(reviewerEmail)
      if (!user) {
        showErrorToast("Không tìm thấy người dùng với email này")
        return
      }
      if (user.role !== "reviewer") {
        showErrorToast("Người dùng này không phải là reviewer")
        return
      }

      // 3. Tạo review với _id của user
      const responseDeadline = new Date()
      responseDeadline.setDate(responseDeadline.getDate() + 7)

      await createReview({
        articleId: id,
        reviewerId: user._id,
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

  const getReviewerName = (reviewer: string | { _id: string; name?: string; fullName?: string; email: string }) => {
    if (typeof reviewer === "string") return reviewer;
    // Ưu tiên fullName, nếu không có thì lấy name, nếu không có thì fallback "No Name"
    return `${reviewer.fullName || reviewer.name || "No Name"} (${reviewer.email})`;
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

  const getUserDisplayName = (user: string | { name?: string; fullName?: string; email?: string }) => {
    if (typeof user === "string") return user;
    return user?.name || user?.fullName || user?.email || "No Name";
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/articles")} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <div className="flex gap-2">
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
                              {typeof author === "string" ? (
                                <div className="font-semibold">{author}</div>
                              ) : (
                                <>
                                  <div className="font-semibold">
                                    {author.fullName}
                                    {author.isCorresponding && (
                                      <Badge className="ml-2 bg-blue-500">Tác giả liên hệ</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">{author.email}</div>
                                  <div className="text-sm text-gray-600">
                                    {author.institution}
                                    {author.institution && author.country ? ", " : ""}
                                    {author.country}
                                  </div>
                                  {author.orcid && (
                                    <div className="text-sm text-gray-600">ORCID: {author.orcid}</div>
                                  )}
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
                    </div>

                    {article.articleFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                              <div className="font-medium">{article.articleFile.fileName}</div>
                              <div className="text-xs text-gray-500">
                                {(article.articleFile.fileSize / 1024 / 1024).toFixed(2)} MB •
                                {new Date(article.articleFile.createdAt).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setPreviewFile({ url: article.articleFile.fileUrl, type: article.articleFile.fileType })}>
                              <Eye className="h-4 w-4" /> Xem
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={article.articleFile.fileUrl} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">Không có tệp đính kèm</div>
                    )}

                    {/* Modal xem trước file */}
                    {previewFile && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded shadow-lg max-w-3xl w-full p-4 relative">
                          <button onClick={() => setPreviewFile(null)} className="absolute top-2 right-2 text-red-500 font-bold">Đóng</button>
                          <div className="mt-4">
                            {previewFile.type === "application/pdf" ? (
                              <iframe src={previewFile.url} width="100%" height="600px" title="PDF preview" />
                            ) : previewFile.type.includes("word") || previewFile.type.includes("doc") || previewFile.url.endsWith(".doc") || previewFile.url.endsWith(".docx") ? (
                              <iframe
                                src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewFile.url)}`}
                                width="100%"
                                height="600px"
                                title="DOC preview"
                              />
                            ) : previewFile.type.startsWith("image/") ? (
                              <img src={previewFile.url} alt="Preview" style={{ maxWidth: "100%", maxHeight: 600 }} />
                            ) : (
                              <div className="text-center text-gray-500">Không hỗ trợ xem trước file này.</div>
                            )}
                          </div>
                        </div>
                      </div>
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
                          {typeof history === "string"
                            ? history
                            : `${statusLabels[history.status] || history.status}`}
                        </div>
                        {typeof history !== "string" && (
                          <>
                            <div className="text-gray-500">
                              {history.timestamp ? new Date(history.timestamp).toLocaleDateString("vi-VN") : ""}
                            </div>
                            {history.changedBy && (
                              <div className="text-gray-600 mt-1">
                                Người thay đổi: {getUserDisplayName(history.changedBy)}
                              </div>
                            )}
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