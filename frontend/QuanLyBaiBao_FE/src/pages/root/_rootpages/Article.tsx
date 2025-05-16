import React, { useEffect, useState } from "react"
import useArticleStore from "../../../store/articleStore"
import useUIStore from "../../../store/uiStore"
import useFieldStore from "../../../store/fieldStore"
import type { Article, ArticleAuthor } from "../../../types/article"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { Button } from "../../../components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Checkbox } from "../../../components/ui/checkbox"
import { Calendar } from "../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { CalendarIcon, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { cn } from "../../../lib/utils"
import ArticleDetail from "./partial/ArticleDetail"

const ArticlePage: React.FC = () => {
  const { articles = [], fetchArticles, fetchArticleById, article, pagination } = useArticleStore()
  const { fields = [], fetchFields } = useFieldStore()
  const { loading: uiLoading } = useUIStore()
  const articleLoading = uiLoading["article"] || false
  const fieldsLoading = uiLoading["fields"] || false
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | undefined>(undefined)
  const [selectedDateTo, setSelectedDateTo] = useState<Date | undefined>(undefined)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(true)

  // Get all unique keywords from articles
  const allKeywords = React.useMemo(() => {
    const keywordSet = new Set<string>()
    articles.forEach((article: Article) => {
      article.keywords?.forEach((keyword) => keywordSet.add(keyword))
    })
    return Array.from(keywordSet)
  }, [articles])

  useEffect(() => {
    fetchArticles({
      page,
      status: "published",
      field: selectedField || undefined,
      search: searchTerm || undefined,
      // Add date filters if needed in the API
    })
    fetchFields()
  }, [fetchArticles, fetchFields, page, selectedField, searchTerm])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    fetchArticleById(id)
  }

  const handleBackToList = () => setSelectedId(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
    fetchArticles({
      page: 1,
      status: "published",
      field: selectedField || undefined,
      search: searchTerm || undefined,
    })
  }

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedField("")
    setSelectedDateFrom(undefined)
    setSelectedDateTo(undefined)
    setSelectedKeywords([])
    setPage(1)
    fetchArticles({ page: 1, status: "published" })
  }

  // Filter articles based on selected keywords (client-side filtering)
  const filteredArticles = React.useMemo(() => {
    if (!selectedKeywords.length) return articles

    return articles.filter((article: Article) =>
      selectedKeywords.some((keyword) => article.keywords?.includes(keyword)),
    )
  }, [articles, selectedKeywords])

  // Get published articles
  const publishedArticles = Array.isArray(filteredArticles)
    ? filteredArticles.filter((item: Article) => item.status === "published")
    : []

  // Breadcrumb component
  const breadcrumb = (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={handleBackToList} className="cursor-pointer">
            Trang chủ
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink onClick={handleBackToList} className="cursor-pointer">
            Bài báo
          </BreadcrumbLink>
        </BreadcrumbItem>
        {selectedId && article && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{article.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <div className="container mx-auto py-8">
      {breadcrumb}

      {!selectedId ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content - Article list */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Danh sách bài báo đã xuất bản</h1>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>

            {/* Mobile filters */}
            <div className={cn("md:hidden mb-4", showFilters ? "block" : "hidden")}>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h2 className="font-semibold mb-3">Bộ lọc</h2>
                <form onSubmit={handleSearch} className="mb-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tìm kiếm bài báo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      <Search size={16} />
                    </Button>
                  </div>
                </form>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="mobile-field">Lĩnh vực</Label>
                    <Select value={selectedField} onValueChange={setSelectedField}>
                      <SelectTrigger id="mobile-field">
                        <SelectValue placeholder="Tất cả lĩnh vực" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                        {fieldsLoading ? (
                          <SelectItem value="loading" disabled>
                            Đang tải...
                          </SelectItem>
                        ) : Array.isArray(fields) && fields.length > 0 ? (
                          fields.map((field) => (
                            <SelectItem key={field._id} value={field._id}>
                              {field.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            Không có dữ liệu
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleResetFilters} className="w-full">
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </div>

            {articleLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : Array.isArray(publishedArticles) && publishedArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {publishedArticles.map((item: Article) => (
                  <Card
                    key={item._id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelect(item._id)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/4 h-48 sm:h-auto relative">
                        <img
                          src={item.thumbnail || "/placeholder.svg?height=200&width=200"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.abstract?.slice(0, 150)}...</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.keywords?.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {item.keywords?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>Tác giả: {(item.authors as ArticleAuthor[])?.map((a) => a.fullName).join(", ")}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Không có bài báo nào phù hợp với tiêu chí tìm kiếm.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.pages }).map((_, idx) => (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          isActive={page === idx + 1}
                          onClick={() => setPage(idx + 1)}
                          className="cursor-pointer"
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        className={page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Sidebar - Filters */}
          <div className="w-full md:w-1/4 hidden md:block">
            <div className="sticky top-4 p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold mb-4">Bộ lọc</h2>

              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tìm kiếm bài báo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Search size={16} />
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="field" className="mb-1 block">
                    Lĩnh vực
                  </Label>
                  <Select value={selectedField} onValueChange={setSelectedField}>
                    <SelectTrigger id="field">
                      <SelectValue placeholder="Tất cả lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                      {fieldsLoading ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : Array.isArray(fields) && fields.length > 0 ? (
                        fields.map((field) => (
                          <SelectItem key={field._id} value={field._id}>
                            {field.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          Không có dữ liệu
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block">Thời gian</Label>
                  <div className="flex flex-col gap-2">
                    <div>
                      <Label htmlFor="date-from" className="text-xs">
                        Từ ngày
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-from"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            size="sm"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateFrom ? format(selectedDateFrom, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateFrom}
                            onSelect={setSelectedDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="date-to" className="text-xs">
                        Đến ngày
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-to"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            size="sm"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateTo ? format(selectedDateTo, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDateTo} onSelect={setSelectedDateTo} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {allKeywords.length > 0 && (
                  <div>
                    <Label className="mb-1 block">Từ khóa</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {allKeywords.map((keyword) => (
                        <div key={keyword} className="flex items-center space-x-2">
                          <Checkbox
                            id={`keyword-${keyword}`}
                            checked={selectedKeywords.includes(keyword)}
                            onCheckedChange={() => handleKeywordToggle(keyword)}
                          />
                          <Label htmlFor={`keyword-${keyword}`} className="text-sm cursor-pointer">
                            {keyword}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={handleResetFilters} className="w-full">
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Article detail view */
        article && article._id === selectedId && <ArticleDetail article={article} onBack={handleBackToList} />
      )}
    </div>
  )
}

export default ArticlePage