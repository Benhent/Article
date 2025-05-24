import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom"
import {
  useArticleStore,
  useReviewStore,
  useIssueStore,
  useUIStore,
  useAuthStore,
} from "../../../store/rootStore"
import { Button } from "../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
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
} from "../../../components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Textarea } from "../../../components/ui/textarea"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Separator } from "../../../components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Calendar } from "../../../components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileText,
  Trash2,
  UserPlus,
  Send,
  Clock,
  CalendarIcon,
  CheckCircle,
  XCircle,
  ExternalLink,
  ImageIcon,
  AlertCircle,
} from "lucide-react"
import LoadingSpinner from "../../../components/LoadingSpinner"
import type { Review } from "../../../types/review"
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "../../../components/ui/timeline"

// Định nghĩa màu và nhãn cho các trạng thái bài báo
const statusColor: Record<string, string> = {
  draft: "bg-gray-500 text-white",
  submitted: "bg-yellow-500 text-white",
  underReview: "bg-blue-500 text-white",
  revisionRequired: "bg-orange-500 text-white",
  resubmitted: "bg-purple-500 text-white",
  accepted: "bg-teal-500 text-white",
  rejected: "bg-red-500 text-white",
  published: "bg-green-500 text-white",
}

const statusLabels: Record<string, string> = {
  draft: "Bản nháp",
  submitted: "Đã nộp",
  underReview: "Đang phản biện",
  revisionRequired: "Yêu cầu chỉnh sửa",
  resubmitted: "Đã nộp lại",
  accepted: "Đã chấp nhận",
  rejected: "Từ chối",
  published: "Đã xuất bản",
}

// Biểu tượng cho các trạng thái
const statusIcons: Record<string, React.ReactNode> = {
  draft: <Edit size={16} />,
  submitted: <FileText size={16} />,
  underReview: <UserPlus size={16} />,
  revisionRequired: <AlertCircle size={16} />,
  resubmitted: <FileText size={16} />,
  accepted: <CheckCircle size={16} />,
  rejected: <XCircle size={16} />,
  published: <ExternalLink size={16} />,
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParamsObj] = useSearchParams()
  const location = useLocation()
  const initialTab = searchParamsObj.get("tab") || "overview"
  const navigate = useNavigate()

  const { article, fetchArticleById, changeArticleStatus, deleteArticle, publishArticle, loading } = useArticleStore()
  const { reviews, fetchReviews, createReview, sendReminder } = useReviewStore()
  const { issues, fetchIssues } = useIssueStore()
  const { showSuccessToast, showErrorToast } = useUIStore()
  const { checkEmailExists, getUserByEmail, user } = useAuthStore()

  // Determine current route and permissions
  const isAdminRoute = location.pathname.startsWith('/admin/articles')
  const isPostArticleRoute = location.pathname.startsWith('/post-article')
  const isArticleRoute = location.pathname.startsWith('/article')
  
  // Check if current user is the author
  const isAuthor = article?.submitterId && typeof article.submitterId !== 'string' && 
    article.submitterId._id === user?._id
  
  // Check if article is editable (not published)
  const isEditable = article?.status !== 'published'
  
  // Check if user has edit permissions
  const canEdit = isAdminRoute || (isAuthor && isEditable)
  
  // Check if user has admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'editor'

  const [tab, setTab] = useState(initialTab)
  const [publishData, setPublishData] = useState({
    doi: "",
    pageStart: "",
    pageEnd: "",
    issueId: "",
  })
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [reviewDeadline, setReviewDeadline] = useState<Date | undefined>(undefined)
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null)
  const [showFullImage, setShowFullImage] = useState(false)
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean
    currentStatus: string
    newStatus: string
    reason: string
  }>({
    open: false,
    currentStatus: "",
    newStatus: "",
    reason: "",
  })

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

  // Hàm hỗ trợ chuyển đổi Date thành string
  const formatDateString = (date: Date | string | undefined): string => {
    if (!date) return ""
    if (date instanceof Date) {
      return date.toISOString()
    }
    return date
  }

  const handleStatusChange = async () => {
    if (!id || !statusChangeDialog.newStatus) return
    try {
      await changeArticleStatus(id, statusChangeDialog.newStatus, statusChangeDialog.reason)
      showSuccessToast(`Đã chuyển trạng thái thành ${statusLabels[statusChangeDialog.newStatus]}`)
      setStatusChangeDialog({
        open: false,
        currentStatus: "",
        newStatus: "",
        reason: "",
      })
    } catch (error) {
      console.error("Error changing status:", error)
      showErrorToast("Lỗi khi thay đổi trạng thái bài báo")
    }
  }

  const openStatusChangeDialog = (newStatus: string) => {
    if (!article) return
    setStatusChangeDialog({
      open: true,
      currentStatus: article.status,
      newStatus,
      reason: "",
    })
  }

  // Kiểm tra xem có thể chuyển từ trạng thái hiện tại sang trạng thái mới không
  const canChangeStatus = (currentStatus: string, newStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      draft: ["submitted"],
      submitted: ["underReview", "rejected"],
      underReview: ["revisionRequired", "accepted", "rejected"],
      revisionRequired: ["resubmitted"],
      resubmitted: ["underReview", "accepted", "rejected"],
      accepted: ["published", "rejected"],
      rejected: [],
      published: [],
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
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
      showSuccessToast("Xuất bản bài báo thành công")
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể xuất bản bài báo. Vui lòng kiểm tra lại trạng thái và thông tin."
      showErrorToast(message)
      console.error("Error publishing article:", error)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteArticle(id)
      showSuccessToast("Xóa bài báo thành công")
      navigate("/admin/articles")
    } catch (error) {
      console.error("Error deleting article:", error)
      showErrorToast("Lỗi khi xóa bài báo")
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
        reviewDeadline: formatDateString(reviewDeadline),
        status: "invited", // Thay đổi từ "pending" sang "invited"
        round: 1,
      })

      setReviewerEmail("")
      setReviewDeadline(undefined)
      showSuccessToast("Đã gửi lời mời phản biện")
      fetchReviews({ articleId: id })
    } catch (error) {
      console.error("Error adding reviewer:", error)
      showErrorToast("Không thể gửi lời mời phản biện")
    }
  }

  const handleSendReminder = async (reviewId: string) => {
    try {
      await sendReminder(reviewId)
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
    if (typeof reviewer === "string") return reviewer
    // Sử dụng nullish coalescing để tránh lỗi undefined
    return `${reviewer.fullName ?? reviewer.name ?? "No Name"} (${reviewer.email})`
  }

  const getReviewStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      invited: { label: "Chờ phản hồi", color: "bg-yellow-500" },
      accepted: { label: "Đã nhận", color: "bg-blue-500" },
      declined: { label: "Từ chối", color: "bg-red-500" },
      completed: { label: "Hoàn thành", color: "bg-green-500" },
      expired: { label: "Hết hạn", color: "bg-gray-500" },
    }
    return statusMap[status] || { label: status, color: "bg-gray-500" }
  }

  const getUserDisplayName = (user: string | { name?: string; fullName?: string; email?: string }) => {
    if (typeof user === "string") return user
    return user?.name ?? user?.fullName ?? user?.email ?? "No Name"
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Không xác định"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch (error) {
      return "Không xác định"
    }
  }

  // Get available actions based on route and permissions
  const getAvailableActions = () => {
    if (!article) return []

    const actions = []

    // For post-article route, only show edit and delete buttons
    if (isPostArticleRoute) {
      if (article.status !== 'published') {
        // Edit button
        if (canEdit) {
          actions.push({
            label: "Chỉnh sửa",
            icon: <Edit className="mr-2 h-4 w-4" />,
            action: () => navigate(`/admin/articles/${article._id}/edit`),
            variant: "outline" as const,
          })
        }

        // Delete button
        if (isEditable) {
          actions.push({
            label: "Xóa",
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            action: () => handleDelete(),
            variant: "destructive" as const,
          })
        }
      }
      return actions
    }

    // For other routes (admin/articles), show all available actions
    if (isAdminRoute && isAdmin) {
      // Edit button
      if (canEdit) {
        actions.push({
          label: "Chỉnh sửa",
          icon: <Edit className="mr-2 h-4 w-4" />,
          action: () => navigate(`/admin/articles/${article._id}/edit`),
          variant: "outline" as const,
        })
      }

      // Admin-only actions
      if (canChangeStatus(article.status, "submitted")) {
        actions.push({
          label: "Nộp bài báo",
          icon: <FileText className="mr-2 h-4 w-4" />,
          action: () => openStatusChangeDialog("submitted"),
          variant: "default" as const,
        })
      }

      if (canChangeStatus(article.status, "underReview")) {
        actions.push({
          label: "Chuyển sang phản biện",
          icon: <UserPlus className="mr-2 h-4 w-4" />,
          action: () => openStatusChangeDialog("underReview"),
          variant: "default" as const,
        })
      }

      if (canChangeStatus(article.status, "revisionRequired")) {
        actions.push({
          label: "Yêu cầu chỉnh sửa",
          icon: <Edit className="mr-2 h-4 w-4" />,
          action: () => openStatusChangeDialog("revisionRequired"),
          variant: "default" as const,
        })
      }

      if (canChangeStatus(article.status, "accepted")) {
        actions.push({
          label: "Chấp nhận bài báo",
          icon: <CheckCircle className="mr-2 h-4 w-4" />,
          action: () => openStatusChangeDialog("accepted"),
          variant: "default" as const,
        })
      }

      if (article.status === "accepted") {
        actions.push({
          label: "Xuất bản bài báo",
          icon: <ExternalLink className="mr-2 h-4 w-4" />,
          action: () => setTab("publish"),
          variant: "default" as const,
        })
      }

      if (canChangeStatus(article.status, "rejected")) {
        actions.push({
          label: "Từ chối bài báo",
          icon: <XCircle className="mr-2 h-4 w-4" />,
          action: () => openStatusChangeDialog("rejected"),
          variant: "destructive" as const,
        })
      }

      // Delete button for admin route
      if (isEditable) {
        actions.push({
          label: "Xóa",
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          action: () => handleDelete(),
          variant: "destructive" as const,
        })
      }
    }

    return actions
  }

  // Get back button based on route
  const getBackButton = () => {
    if (isAdminRoute) {
      return {
        label: "Quay lại danh sách",
        path: "/admin/articles"
      }
    } else if (isPostArticleRoute) {
      return {
        label: "Quay lại bài viết",
        path: "/post-article"
      }
    } else {
      return {
        label: "Quay lại trang chủ",
        path: "/"
      }
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(getBackButton().path)} 
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {getBackButton().label}
        </Button>

        <div className="flex gap-2">
          {getAvailableActions().map((action, index) => (
            <Button key={index} variant={action.variant} onClick={action.action}>
              {action.icon} {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Thumbnail Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ảnh thu nhỏ</CardTitle>
            </CardHeader>
            <CardContent>
              {article.thumbnail ? (
                <div className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={article.thumbnail || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={() => setShowFullImage(true)}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" /> Xem đầy đủ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">Không có ảnh thu nhỏ</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Badge className={`${statusColor[article.status]} px-3 py-1`}>
                  {statusLabels[article.status] || article.status}
                </Badge>
              </div>

              <div className="text-sm text-gray-500">
                <div className="flex justify-between mb-2">
                  <span>Ngày tạo:</span>
                  <span className="font-medium">{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Cập nhật:</span>
                  <span className="font-medium">{formatDate(article.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lượt xem:</span>
                  <span className="font-medium">{article.viewCount || 0}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="text-sm">
                <div className="font-medium mb-2">Số tạp chí:</div>
                <div className="text-gray-700">{getIssueTitle(article.issueId)}</div>
              </div>

              {article.doi && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    <div className="font-medium mb-2">DOI:</div>
                    <div className="text-gray-700 break-all">
                      <a
                        href={`https://doi.org/${article.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {article.doi}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </>
              )}

              {article.pageStart && article.pageEnd && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    <div className="font-medium mb-2">Trang:</div>
                    <div className="text-gray-700">
                      {article.pageStart} - {article.pageEnd}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submitter Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Thông tin người gửi</CardTitle>
            </CardHeader>
            <CardContent>
              {typeof article.submitterId !== "string" && article.submitterId ? (
                <div>
                  <div className="font-medium">{article.submitterId.name ?? article.submitterId.name}</div>
                  <div className="text-sm text-gray-600">{article.submitterId.email}</div>
                  {article.submitterId.institution && (
                    <div className="text-sm text-gray-600">{article.submitterId.institution}</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Không có thông tin người gửi</div>
              )}

              {article.submitterNote && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="font-medium mb-2">Ghi chú:</div>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">{article.submitterNote}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                <div>
                  {article.titlePrefix && <div className="text-gray-500 text-sm">{article.titlePrefix}</div>}
                  <CardTitle className="text-2xl">{article.title}</CardTitle>
                  {article.subtitle && <CardDescription className="mt-1 text-base">{article.subtitle}</CardDescription>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="authors">Tác giả</TabsTrigger>
                  <TabsTrigger value="files">Tệp đính kèm</TabsTrigger>
                  {!isPostArticleRoute && !isArticleRoute && (
                    <>
                      <TabsTrigger value="reviews">Phản biện</TabsTrigger>
                      <TabsTrigger value="history">Lịch sử</TabsTrigger>
                    </>
                  )}
                  {isPostArticleRoute && (
                    <TabsTrigger value="history">Lịch sử</TabsTrigger>
                  )}
                  {article.status === "accepted" && isAdminRoute && (
                    <TabsTrigger value="publish">Xuất bản</TabsTrigger>
                  )}
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

                          {Array.isArray(article.secondaryFields) && article.secondaryFields.length > 0 && (
                            <div className="flex">
                              <span className="font-medium w-32">Lĩnh vực phụ:</span>
                              <span>
                                {article.secondaryFields.map((f) => (typeof f === "string" ? f : f.name)).join(", ")}
                              </span>
                            </div>
                          )}

                          <div className="flex">
                            <span className="font-medium w-32">Ngôn ngữ:</span>
                            <span>{article.articleLanguage === "en" ? "Tiếng Anh" : "Tiếng Việt"}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">Từ khóa</h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(article.keywords) &&
                            article.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {keyword}
                              </Badge>
                            ))}
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
                                  <div className="font-semibold flex items-center justify-between">
                                    <span>{author.fullName}</span>
                                    {author.isCorresponding && <Badge className="bg-blue-500">Tác giả liên hệ</Badge>}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">{author.email}</div>
                                  {(author.institution || author.country) && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {author.institution}
                                      {author.institution && author.country ? ", " : ""}
                                      {author.country}
                                    </div>
                                  )}
                                  {author.orcid && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      <a
                                        href={`https://orcid.org/${author.orcid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center"
                                      >
                                        ORCID: {author.orcid}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                      </a>
                                    </div>
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
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border">
                          <div className="flex items-center">
                            <FileText className="h-10 w-10 mr-4 text-blue-500" />
                            <div>
                              <div className="font-medium">{article.articleFile.fileName}</div>
                              <div className="text-xs text-gray-500">
                                {((article.articleFile.fileSize || 0) / 1024 / 1024).toFixed(2)} MB •
                                {formatDate(article.articleFile.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPreviewFile({
                                  url: article.articleFile.fileUrl,
                                  type: article.articleFile.fileType,
                                })
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" /> Xem
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={article.articleFile.fileUrl} download>
                                <Download className="mr-2 h-4 w-4" /> Tải xuống
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 p-4 bg-gray-50 rounded-md border border-dashed text-center">
                        Không có tệp đính kèm
                      </div>
                    )}

                    {/* Modal xem trước file */}
                    {previewFile && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full h-[80vh] p-4 relative">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Xem trước tệp</h3>
                            <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="h-[calc(100%-3rem)] overflow-hidden">
                            {previewFile.type === "application/pdf" ? (
                              <iframe
                                src={`${previewFile.url}#toolbar=0`}
                                width="100%"
                                height="100%"
                                title="PDF preview"
                                className="border-0"
                              />
                            ) : previewFile.type.includes("word") ||
                              previewFile.type.includes("doc") ||
                              previewFile.url.endsWith(".doc") ||
                              previewFile.url.endsWith(".docx") ? (
                              <iframe
                                src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewFile.url)}`}
                                width="100%"
                                height="100%"
                                title="DOC preview"
                                className="border-0"
                              />
                            ) : previewFile.type.startsWith("image/") ? (
                              <div className="h-full flex items-center justify-center bg-gray-100">
                                <img
                                  src={previewFile.url || "/placeholder.svg"}
                                  alt="Preview"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                  <p>Không hỗ trợ xem trước file này.</p>
                                  <Button variant="outline" className="mt-4" asChild>
                                    <a href={previewFile.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="mr-2 h-4 w-4" /> Mở trong tab mới
                                    </a>
                                  </Button>
                                </div>
                              </div>
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
                              <Label htmlFor="reviewerEmail">Email người phản biện</Label>
                              <Input
                                id="reviewerEmail"
                                placeholder="Nhập email"
                                value={reviewerEmail}
                                onChange={(e) => setReviewerEmail(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="reviewDeadline">Thời hạn phản biện</Label>
                              <div className="mt-1">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {reviewDeadline
                                        ? format(reviewDeadline, "dd/MM/yyyy", { locale: vi })
                                        : "Chọn ngày"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={reviewDeadline}
                                      onSelect={setReviewDeadline}
                                      initialFocus
                                      disabled={(date) => date < new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddReviewer}>Gửi lời mời</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review: Review) => {
                          const status = getReviewStatusLabel(review.status || 'invited')
                          return (
                            <Card key={review._id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{getReviewerName(review.reviewerId)}</div>
                                    <Badge className={`${status.color} mt-1`}>{status.label}</Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    {review.status === "invited" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => review._id && handleSendReminder(review._id)}
                                      >
                                        <Send className="mr-2 h-4 w-4" /> Nhắc nhở
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/admin/reviews/${review._id}`)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" /> Chi tiết
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-500 flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Thời hạn: {formatDate(review.reviewDeadline)}
                                </div>
                                {review.status === "completed" && review.recommendation && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                    <div className="font-medium">Đề xuất: {review.recommendation}</div>
                                    {/* Kiểm tra tồn tại trước khi sử dụng */}
                                    {(review as any).commentsForEditor && (
                                      <div className="mt-2 text-sm">
                                        <span className="font-medium">Nhận xét cho biên tập viên:</span>
                                        <p className="mt-1">{(review as any).commentsForEditor}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-500 p-4 bg-gray-50 rounded-md border border-dashed text-center">
                        Chưa có phản biện nào
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Lịch sử trạng thái</h3>

                    {Array.isArray(article.statusHistory) && article.statusHistory.length > 0 ? (
                      <Timeline>
                        {article.statusHistory.map((history, idx) => (
                          <TimelineItem key={idx}>
                            <TimelineSeparator>
                              <TimelineDot
                                className={statusColor[typeof history === "string" ? history : history.status]}
                              >
                                {statusIcons[typeof history === "string" ? history : history.status]}
                              </TimelineDot>
                              {idx < article.statusHistory.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                              <div className="ml-4">
                                <div className="font-medium">
                                  {typeof history === "string"
                                    ? statusLabels[history] || history
                                    : statusLabels[history.status] || history.status}
                                </div>
                                {typeof history !== "string" && (
                                  <>
                                    <div className="text-sm text-gray-500">
                                      {history.timestamp ? formatDate(history.timestamp) : ""}
                                    </div>
                                    {history.changedBy && (
                                      <div className="text-sm text-gray-600 mt-1">
                                        Người thay đổi: {getUserDisplayName(history.changedBy)}
                                      </div>
                                    )}
                                    {history.reason && (
                                      <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded-md">
                                        {history.reason}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : (
                      <div className="text-gray-500 p-4 bg-gray-50 rounded-md border border-dashed text-center">
                        Không có lịch sử trạng thái
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="publish">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Xuất bản bài báo</h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="issueSelect">Chọn số tạp chí</Label>
                        <Select
                          value={publishData.issueId}
                          onValueChange={(value) => setPublishData((prev) => ({ ...prev, issueId: value }))}
                        >
                          <SelectTrigger id="issueSelect" className="mt-1">
                            <SelectValue placeholder="Chọn số" />
                          </SelectTrigger>
                          <SelectContent>
                            {issues &&
                              issues.length > 0 &&
                              issues.map((issue) => (
                                <SelectItem key={issue._id} value={issue._id || ""}>
                                  {issue.title} (Tập {issue.volumeNumber}, Số {issue.issueNumber})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="doiInput">DOI (tùy chọn)</Label>
                        <Input
                          id="doiInput"
                          placeholder="Nhập DOI"
                          className="mt-1"
                          value={publishData.doi}
                          onChange={(e) => setPublishData((prev) => ({ ...prev, doi: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pageStart">Trang bắt đầu</Label>
                          <Input
                            id="pageStart"
                            type="number"
                            placeholder="Trang bắt đầu"
                            className="mt-1"
                            value={publishData.pageStart}
                            onChange={(e) => setPublishData((prev) => ({ ...prev, pageStart: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pageEnd">Trang kết thúc</Label>
                          <Input
                            id="pageEnd"
                            type="number"
                            placeholder="Trang kết thúc"
                            className="mt-1"
                            value={publishData.pageEnd}
                            onChange={(e) => setPublishData((prev) => ({ ...prev, pageEnd: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button onClick={handlePublish} disabled={!publishData.issueId} className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" /> Xuất bản bài báo
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog thay đổi trạng thái */}
      <Dialog
        open={statusChangeDialog.open}
        onOpenChange={(open) => setStatusChangeDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi trạng thái bài báo</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái từ "
              {statusLabels[statusChangeDialog.currentStatus] || statusChangeDialog.currentStatus}" sang "
              {statusLabels[statusChangeDialog.newStatus] || statusChangeDialog.newStatus}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="statusReason">Lý do thay đổi</Label>
            <Textarea
              id="statusReason"
              placeholder="Nhập lý do thay đổi trạng thái"
              value={statusChangeDialog.reason}
              onChange={(e) => setStatusChangeDialog((prev) => ({ ...prev, reason: e.target.value }))}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusChangeDialog({
                  open: false,
                  currentStatus: "",
                  newStatus: "",
                  reason: "",
                })
              }
            >
              Hủy
            </Button>
            <Button onClick={handleStatusChange}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal xem ảnh đầy đủ */}
      {showFullImage && article.thumbnail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-w-5xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShowFullImage(false)}
            >
              <XCircle className="h-6 w-6" />
            </Button>
            <img
              src={article.thumbnail || "/placeholder.svg"}
              alt={article.title}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}