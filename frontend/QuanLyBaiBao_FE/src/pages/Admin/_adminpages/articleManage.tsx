"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useArticleStore, useFieldStore, useIssueStore, useUIStore } from "../../../store/rootStore"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination"
import { MoreHorizontal, Edit, Eye, Trash2, FileText, Calendar, UserPlus, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
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
} from "../../../components/ui/dialog"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import type { Article } from "../../../types/article"
import type { Field } from "../../../types/field"
import apiService from "../../../services/api"
import CreateDiscussionModal from "../../partial/discussion/CreateDiscussionModal"

// Định nghĩa màu và nhãn cho các trạng thái bài báo
const statusColor: Record<string, string> = {
  submitted: "bg-yellow-500 text-white",
  underReview: "bg-blue-500 text-white",
  revisionRequired: "bg-orange-500 text-white",
  resubmitted: "bg-purple-500 text-white",
  accepted: "bg-teal-500 text-white",
  rejected: "bg-red-500 text-white",
  published: "bg-green-500 text-white",
  draft: "bg-gray-500 text-white",
}

const statusLabels: Record<string, string> = {
  submitted: "Đã nộp",
  underReview: "Đang phản biện",
  revisionRequired: "Yêu cầu chỉnh sửa",
  resubmitted: "Đã nộp lại",
  accepted: "Đã chấp nhận",
  rejected: "Từ chối",
  published: "Đã xuất bản",
  draft: "Bản nháp",
}

export default function ArticleManage() {
  const {
    articles = [],
    fetchArticles,
    deleteArticle,
    changeArticleStatus,
    pagination,
    fetchArticleStats,
    stats = {},
  } = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
  const { issues, fetchIssues } = useIssueStore()
  const { loading, showSuccessToast, showErrorToast } = useUIStore()
  const navigate = useNavigate()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [fieldFilter, setFieldFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedIssue, setSelectedIssue] = useState("")
  const [publishData, setPublishData] = useState({
    doi: "",
    pageStart: "",
    pageEnd: "",
  })
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean
    articleId: string
    currentStatus: string
    newStatus: string
    reason: string
  }>({
    open: false,
    articleId: "",
    currentStatus: "",
    newStatus: "",
    reason: "",
  })
  const [createDiscussionModal, setCreateDiscussionModal] = useState<{
    isOpen: boolean;
    articleId: string;
    articleTitle: string;
  }>({
    isOpen: false,
    articleId: "",
    articleTitle: "",
  });

  useEffect(() => {
    fetchFields({ isActive: true })
    fetchIssues()
    fetchArticleStats()
    handleApplyFilters()
  }, [currentPage])

  const handleApplyFilters = () => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: 10,
    }

    if (searchTerm) {
      params.search = searchTerm
    }

    if (statusFilter !== "all") {
      params.status = statusFilter
    }

    if (fieldFilter !== "all") {
      params.field = fieldFilter
    }

    fetchArticles(params)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setFieldFilter("all")
    setCurrentPage(1)
    fetchArticles({ page: 1, limit: 10 })
  }

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id)
      showSuccessToast("Xóa bài báo thành công")
      handleApplyFilters()
    } catch (error) {
      console.error("Error deleting article:", error)
      showErrorToast("Lỗi khi xóa bài báo")
    }
  }

  const handleAddToIssue = (article: Article) => {
    setSelectedArticle(article)
    setSelectedIssue("")
    setPublishData({
      doi: article.doi || "",
      pageStart: article.pageStart?.toString() || "",
      pageEnd: article.pageEnd?.toString() || "",
    })
  }

  const handleStatusChange = async () => {
    try {
      if (!statusChangeDialog.articleId || !statusChangeDialog.newStatus) return

      await changeArticleStatus(statusChangeDialog.articleId, statusChangeDialog.newStatus, statusChangeDialog.reason)

      showSuccessToast(`Đã chuyển trạng thái thành ${statusLabels[statusChangeDialog.newStatus]}`)
      setStatusChangeDialog({
        open: false,
        articleId: "",
        currentStatus: "",
        newStatus: "",
        reason: "",
      })

      handleApplyFilters()
    } catch (error) {
      console.error("Error changing article status:", error)
      showErrorToast("Lỗi khi thay đổi trạng thái bài báo")
    }
  }

  const openStatusChangeDialog = (article: Article, newStatus: string) => {
    setStatusChangeDialog({
      open: true,
      articleId: article._id,
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

  const getFieldName = (field: string | { _id: string; name: string }) => {
    if (typeof field === "string") {
      const foundField = fields?.find((f) => f._id === field)
      return foundField?.name || field
    }
    return field?.name || "Không xác định"
  }

  const getSubmitterName = (
    submitterId: string | { _id: string; name?: string; fullName?: string; email?: string },
  ) => {
    if (typeof submitterId === "string") {
      return submitterId
    }
    return submitterId.name || submitterId.fullName || submitterId.email || "Không xác định"
  }

  const handlePublishArticle = async () => {
    if (!selectedArticle || !selectedIssue) return

    try {
      // 1. Gán bài báo vào số báo
      await apiService.post(`/issues/${selectedIssue}/articles`, {
        articleId: selectedArticle._id,
      })

      // 2. Xuất bản bài báo
      await apiService.put(`/articles/${selectedArticle._id}/publish`, {
        issueId: selectedIssue,
        doi: publishData.doi || undefined,
        pageStart: publishData.pageStart ? Number.parseInt(publishData.pageStart) : undefined,
        pageEnd: publishData.pageEnd ? Number.parseInt(publishData.pageEnd) : undefined,
      })

      showSuccessToast("Xuất bản bài báo thành công")
      setSelectedArticle(null)
      handleApplyFilters()
    } catch (error) {
      console.error("Error publishing article:", error)
      showErrorToast("Lỗi khi xuất bản bài báo")
    }
  }

  const handleCreateDiscussion = (article: Article) => {
    setCreateDiscussionModal({
      isOpen: true,
      articleId: article._id,
      articleTitle: article.title,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài báo</h1>
          <p className="text-gray-500">Quản lý tất cả bài báo trong hệ thống</p>
        </div>
        <Button onClick={() => navigate("/admin/articles/create")}>+ Tạo bài báo mới</Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Tổng số bài báo</div>
          <div className="text-2xl font-bold">{stats.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Đã xuất bản</div>
          <div className="text-2xl font-bold text-green-600">{stats.published || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Đang phản biện</div>
          <div className="text-2xl font-bold text-blue-600">{stats.underReview || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Đã chấp nhận</div>
          <div className="text-2xl font-bold text-teal-600">{stats.accepted || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="submitted">Đã nộp</SelectItem>
                <SelectItem value="underReview">Đang phản biện</SelectItem>
                <SelectItem value="revisionRequired">Yêu cầu chỉnh sửa</SelectItem>
                <SelectItem value="resubmitted">Đã nộp lại</SelectItem>
                <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo lĩnh vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                {fields &&
                  fields.length > 0 &&
                  fields.map((field: Field) => (
                    <SelectItem key={field._id} value={field._id || ""}>
                      {field.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="mr-2">
            Đặt lại bộ lọc
          </Button>
          <Button size="sm" onClick={handleApplyFilters}>
            Áp dụng
          </Button>
        </div>
      </div>

      {/* Articles table */}
      {loading.articles ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium">Lĩnh vực</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Người gửi</th>
                  <th className="px-4 py-3 font-medium">Ngày tạo</th>
                  <th className="px-4 py-3 font-medium">Lượt xem</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Không có bài báo nào
                    </td>
                  </tr>
                ) : (
                  articles.map((article: Article) => (
                    <tr key={article._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">
                        <div className="max-w-xs truncate">{article.title}</div>
                      </td>
                      <td className="px-4 py-3">{getFieldName(article.field)}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusColor[article.status] || "bg-gray-200"}>
                          {statusLabels[article.status] || article.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{getSubmitterName(article.submitterId)}</td>
                      <td className="px-4 py-3">{new Date(article.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-3">{article.viewCount || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/articles/${article._id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/articles/${article._id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>

                            {/* Dropdown menu cho thay đổi trạng thái */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled className="text-xs text-gray-500 font-semibold">
                              Thay đổi trạng thái
                            </DropdownMenuItem>

                            {/* Chuyển sang trạng thái "Đã nộp" từ bản nháp */}
                            {canChangeStatus(article.status, "submitted") && (
                              <DropdownMenuItem onClick={() => openStatusChangeDialog(article, "submitted")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                Nộp bài báo
                              </DropdownMenuItem>
                            )}

                            {/* Chuyển sang trạng thái "Đang phản biện" */}
                            {canChangeStatus(article.status, "underReview") && (
                              <DropdownMenuItem onClick={() => openStatusChangeDialog(article, "underReview")}>
                                <UserPlus className="mr-2 h-4 w-4 text-blue-500" />
                                Chuyển sang phản biện
                              </DropdownMenuItem>
                            )}

                            {/* Chuyển sang trạng thái "Yêu cầu chỉnh sửa" */}
                            {canChangeStatus(article.status, "revisionRequired") && (
                              <DropdownMenuItem onClick={() => openStatusChangeDialog(article, "revisionRequired")}>
                                <Edit className="mr-2 h-4 w-4 text-orange-500" />
                                Yêu cầu chỉnh sửa
                              </DropdownMenuItem>
                            )}

                            {/* Chuyển sang trạng thái "Đã chấp nhận" */}
                            {canChangeStatus(article.status, "accepted") && (
                              <DropdownMenuItem onClick={() => openStatusChangeDialog(article, "accepted")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-teal-500" />
                                Chấp nhận bài báo
                              </DropdownMenuItem>
                            )}

                            {/* Chuyển sang trạng thái "Từ chối" */}
                            {canChangeStatus(article.status, "rejected") && (
                              <DropdownMenuItem onClick={() => openStatusChangeDialog(article, "rejected")}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Từ chối bài báo
                              </DropdownMenuItem>
                            )}

                            {/* Chuyển sang trạng thái "Đã xuất bản" */}
                            {article.status === "accepted" && (
                              <DropdownMenuItem onClick={() => handleAddToIssue(article)}>
                                <Calendar className="mr-2 h-4 w-4 text-green-500" />
                                Xuất bản bài báo
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Quản lý phản biện */}
                            <DropdownMenuItem onClick={() => navigate(`/admin/articles/${article._id}?tab=reviews`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Quản lý phản biện
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleCreateDiscussion(article)}>
                              <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                              Create Discussion
                            </DropdownMenuItem>

                            {/* Xóa bài báo */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
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
                                  <AlertDialogAction onClick={() => handleDeleteArticle(article._id)}>
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="py-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))}
                      className={currentPage === pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

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
                  articleId: "",
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

      {/* Dialog thêm vào số và xuất bản */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm bài báo vào số & xuất bản</DialogTitle>
            <DialogDescription>Chọn số để thêm và xuất bản bài báo "{selectedArticle?.title}".</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="issueSelect">Chọn số tạp chí</Label>
            <Select value={selectedIssue} onValueChange={setSelectedIssue}>
              <SelectTrigger id="issueSelect" className="mt-2">
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

            <div className="mt-4">
              <Label htmlFor="doiInput">DOI (tùy chọn)</Label>
              <Input
                id="doiInput"
                placeholder="Nhập DOI"
                className="mt-2"
                value={publishData.doi}
                onChange={(e) => setPublishData((prev) => ({ ...prev, doi: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="pageStart">Trang bắt đầu</Label>
                <Input
                  id="pageStart"
                  type="number"
                  placeholder="Trang bắt đầu"
                  className="mt-2"
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
                  className="mt-2"
                  value={publishData.pageEnd}
                  onChange={(e) => setPublishData((prev) => ({ ...prev, pageEnd: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedArticle(null)}>
              Hủy
            </Button>
            <Button onClick={handlePublishArticle} disabled={!selectedIssue}>
              Thêm & Xuất bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add CreateDiscussionModal */}
      <CreateDiscussionModal
        isOpen={createDiscussionModal.isOpen}
        onClose={() => setCreateDiscussionModal({ isOpen: false, articleId: "", articleTitle: "" })}
        articleId={createDiscussionModal.articleId}
        articleTitle={createDiscussionModal.articleTitle}
      />
    </div>
  )
}