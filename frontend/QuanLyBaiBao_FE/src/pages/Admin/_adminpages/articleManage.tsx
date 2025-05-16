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
import { MoreHorizontal, Edit, Eye, Trash2, FileText, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Article, Field } from "../../../types/article"

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

export default function ArticleManage() {
  const { articles = [], fetchArticles, deleteArticle, pagination, fetchArticleStats, stats = {} } = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
  const { issues, fetchIssues } = useIssueStore()
  const { loading } = useUIStore()
  const navigate = useNavigate()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [fieldFilter, setFieldFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedIssue, setSelectedIssue] = useState("")

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
    await deleteArticle(id)
    handleApplyFilters()
  }

  const handleAddToIssue = (article: Article) => {
    setSelectedArticle(article)
    setSelectedIssue("")
  }

  const confirmAddToIssue = async () => {
    if (!selectedArticle || !selectedIssue) return

    try {
      // Implement the logic to add article to issue
      // This would typically call a function from issueStore
      await fetch(`/api/issues/${selectedIssue}/add-article`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ articleId: selectedArticle._id }),
      })

      // Refresh the articles list
      handleApplyFilters()
      setSelectedArticle(null)
    } catch (error) {
      console.error("Error adding article to issue:", error)
    }
  }

  const getFieldName = (field: string | { _id: string; name: string }) => {
    if (typeof field === "string") {
      const foundField = fields?.find((f) => f._id === field)
      return foundField?.name
    }
    return field?.name
  }

  const getSubmitterName = (submitterId: string | { _id: string; fullName: string; email: string }) => {
    if (typeof submitterId === "string") {
      return submitterId
    }
    return submitterId.fullName
  }

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
          <div className="text-sm text-gray-500">Đang xét duyệt</div>
          <div className="text-2xl font-bold text-blue-600">{stats.under_review || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Bản nháp</div>
          <div className="text-2xl font-bold text-gray-600">{stats.draft || 0}</div>
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
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="under_review">Đang xét duyệt</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
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
                    <SelectItem key={field._id} value={field._id}>
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
                            {article.status === "published" && (
                              <DropdownMenuItem onClick={() => handleAddToIssue(article)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Thêm vào số
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate(`/admin/articles/${article._id}/reviews`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Quản lý phản biện
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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

      {/* Add to Issue Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm bài báo vào số</DialogTitle>
            <DialogDescription>Chọn số để thêm bài báo "{selectedArticle?.title}" vào.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedIssue} onValueChange={setSelectedIssue}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn số" />
              </SelectTrigger>
              <SelectContent>
                {issues &&
                  issues.length > 0 &&
                  issues.map((issue) => (
                    <SelectItem key={issue._id} value={issue._id}>
                      {issue.title} (Tập {issue.volumeNumber}, Số {issue.issueNumber})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedArticle(null)}>
              Hủy
            </Button>
            <Button onClick={confirmAddToIssue} disabled={!selectedIssue}>
              Thêm vào số
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}