import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useArticleStore, useFieldStore, useFileStore, useUIStore, useAuthorStore } from "../../../store/rootStore"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Switch } from "../../../components/ui/switch"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Edit,
  History,
  AlertCircle,
  Eye,
  FileSymlink,
  Calendar,
  Clock,
} from "lucide-react"
import LoadingSpinner from "../../../components/LoadingSpinner"
import type { Field } from "../../../types/field"
import type { ArticleAuthor } from "../../../types/author"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { uploadArticleThumbnailToCloudinary, uploadArticleFileToCloudinary } from "../../../config/cloudinary"
import apiService from "../../../services/api"
import type { ArticleFile } from "../../../types/file"
import type { ArticleStatus } from "../../../types/article"
import type { StatusHistory } from "../../../types/statushistory"
import { format } from "date-fns"

// Add type guard for StatusHistory
const isStatusHistory = (item: any): item is StatusHistory => {
  return typeof item === "object" && "status" in item && "timestamp" in item
}

// Add type guard for ArticleAuthor
const isArticleAuthor = (author: any): author is ArticleAuthor => {
  return (
    typeof author === "object" &&
    author !== null &&
    "fullName" in author &&
    "email" in author &&
    "institution" in author &&
    "country" in author &&
    "isCorresponding" in author &&
    "order" in author
  )
}

interface ArticleEditProps {
  parentRoute?: string;
}

export default function ArticleEdit({ parentRoute }: ArticleEditProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { article, fetchArticleById, updateArticle, loading } = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
  const { files, getArticleFiles, uploadArticleFile, deleteArticleFile } = useFileStore()
  const { createArticleAuthor, updateArticleAuthor, deleteArticleAuthor } = useAuthorStore()
  const { showSuccessToast, showErrorToast } = useUIStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState("basic-info")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    titlePrefix: "",
    subtitle: "",
    abstract: "",
    field: "",
    secondaryFields: [] as string[],
    keywords: [] as string[],
    articleLanguage: "vi",
    submitterNote: "",
    authors: [] as ArticleAuthor[],
  })

  // File state
  const [articleFile, setArticleFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [currentKeyword, setCurrentKeyword] = useState("")

  // Tác giả mới
  const [newAuthor, setNewAuthor] = useState<ArticleAuthor>({
    fullName: "",
    email: "",
    institution: "",
    country: "",
    orcid: "",
    isCorresponding: false,
    hasAccount: false,
    order: 0,
  })

  useEffect(() => {
    fetchFields({ isActive: true })
    if (id) {
      fetchArticleById(id)
      getArticleFiles(id)
    }
  }, [id, fetchArticleById, fetchFields, getArticleFiles])

  // Load article data into form
  useEffect(() => {
    if (article && !isLoaded) {
      setFormData({
        title: article.title || "",
        titlePrefix: article.titlePrefix || "",
        subtitle: article.subtitle || "",
        abstract: article.abstract || "",
        field: typeof article.field === "string" ? article.field : article.field?._id || "",
        secondaryFields: Array.isArray(article.secondaryFields)
          ? article.secondaryFields.map((f) => (typeof f === "string" ? f : f._id))
          : [],
        keywords: Array.isArray(article.keywords) ? article.keywords : [],
        articleLanguage: article.articleLanguage || "vi",
        submitterNote: article.submitterNote || "",
        authors: Array.isArray(article.authors)
          ? article.authors.map((a, index) => {
              if (typeof a === "string") {
                return {
                  fullName: a,
                  email: "",
                  institution: "",
                  country: "",
                  isCorresponding: false,
                  hasAccount: false,
                  order: index + 1,
                }
              } else {
                return {
                  ...a,
                  order: a.order || index + 1,
                }
              }
            })
          : [],
      })

      if (article.thumbnail) {
        setThumbnailPreview(article.thumbnail)
      }

      setIsPublished(article.status === "published")
      setIsLoaded(true)
    }
  }, [article, isLoaded])

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Xóa lỗi khi người dùng nhập
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Xử lý thay đổi select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Xóa lỗi khi người dùng chọn
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Xử lý thêm từ khóa
  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword.trim()],
      }))
      setCurrentKeyword("")
    }
  }

  // Xử lý xóa từ khóa
  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }))
  }

  // Xử lý thay đổi thông tin tác giả mới
  const handleNewAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAuthor((prev) => ({ ...prev, [name]: value }))
  }

  // Xử lý thêm tác giả
  const handleAddAuthor = () => {
    // Validate thông tin tác giả
    if (!newAuthor.fullName || !newAuthor.email) {
      showErrorToast("Vui lòng nhập tên và email của tác giả")
      return
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newAuthor.email)) {
      showErrorToast("Email không hợp lệ")
      return
    }

    // Kiểm tra trùng email
    if (formData.authors.some((author) => author.email === newAuthor.email)) {
      showErrorToast("Email này đã tồn tại trong danh sách tác giả")
      return
    }

    setFormData((prev) => ({
      ...prev,
      authors: [...prev.authors, { ...newAuthor }],
    }))

    // Reset form tác giả mới
    setNewAuthor({
      fullName: "",
      email: "",
      institution: "",
      country: "",
      orcid: "",
      isCorresponding: false,
      hasAccount: false,
      order: 0,
    })
  }

  // Xử lý xóa tác giả
  const handleRemoveAuthor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }))
  }

  // Xử lý đặt tác giả liên hệ
  const handleSetCorrespondingAuthor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.map((author, i) => ({
        ...author,
        isCorresponding: i === index,
      })),
    }))
  }

  // Xử lý thay đổi vị trí tác giả
  const handleMoveAuthor = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === formData.authors.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const newAuthors = [...formData.authors]
    const temp = newAuthors[index]
    newAuthors[index] = newAuthors[newIndex]
    newAuthors[newIndex] = temp

    setFormData((prev) => ({
      ...prev,
      authors: newAuthors,
    }))
  }

  // Xử lý upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "article" | "thumbnail") => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    if (type === "article") {
      // Kiểm tra loại file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        showErrorToast("Chỉ chấp nhận file PDF hoặc Word")
        return
      }

      // Kiểm tra kích thước file (tối đa 20MB)
      if (file.size > 20 * 1024 * 1024) {
        showErrorToast("Kích thước file không được vượt quá 20MB")
        return
      }

      setArticleFile(file)

      // Xóa lỗi nếu có
      if (formErrors.articleFile) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.articleFile
          return newErrors
        })
      }
    } else if (type === "thumbnail") {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        showErrorToast("Vui lòng chọn file hình ảnh")
        return
      }

      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Kích thước ảnh không được vượt quá 5MB")
        return
      }

      setThumbnail(file)

      // Tạo URL preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý xóa file
  const handleRemoveFile = (type: "article" | "thumbnail") => {
    if (type === "article") {
      setArticleFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } else if (type === "thumbnail") {
      setThumbnail(null)
      setThumbnailPreview(null)
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = ""
      }
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Kiểm tra các trường bắt buộc
    if (!formData.title.trim()) {
      errors.title = "Tiêu đề không được để trống"
    } else if (formData.title.length < 5) {
      errors.title = "Tiêu đề quá ngắn, cần ít nhất 5 ký tự"
    }

    if (!formData.abstract.trim()) {
      errors.abstract = "Tóm tắt không được để trống"
    } else if (formData.abstract.length < 50) {
      errors.abstract = "Tóm tắt quá ngắn, cần ít nhất 50 ký tự"
    }

    if (!formData.field) {
      errors.field = "Vui lòng chọn lĩnh vực"
    }

    if (formData.keywords.length === 0) {
      errors.keywords = "Vui lòng thêm ít nhất một từ khóa"
    }

    if (formData.authors.length === 0) {
      errors.authors = "Vui lòng thêm ít nhất một tác giả"
    } else if (!formData.authors.some((author) => author.isCorresponding)) {
      errors.correspondingAuthor = "Vui lòng chỉ định một tác giả liên hệ"
    }

    // Kiểm tra file bài báo nếu không có file hiện tại và không có file mới
    if (!article?.articleFile && !articleFile) {
      errors.articleFile = "Vui lòng tải lên file bài báo"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Xử lý chuyển tab
  const handleTabChange = (tab: string) => {
    // Validate tab hiện tại trước khi chuyển
    let canProceed = true

    if (activeTab === "basic-info") {
      if (!formData.title.trim()) {
        setFormErrors((prev) => ({ ...prev, title: "Tiêu đề không được để trống" }))
        canProceed = false
      }
      if (!formData.abstract.trim()) {
        setFormErrors((prev) => ({ ...prev, abstract: "Tóm tắt không được để trống" }))
        canProceed = false
      }
      if (!formData.field) {
        setFormErrors((prev) => ({ ...prev, field: "Vui lòng chọn lĩnh vực" }))
        canProceed = false
      }
    } else if (activeTab === "authors") {
      if (formData.authors.length === 0) {
        showErrorToast("Vui lòng thêm ít nhất một tác giả")
        canProceed = false
      } else if (!formData.authors.some((author) => author.isCorresponding)) {
        showErrorToast("Vui lòng chỉ định một tác giả liên hệ")
        canProceed = false
      }
    }

    if (canProceed) {
      setActiveTab(tab)
    }
  }

  // Xử lý cập nhật bài báo
  const handleSubmit = async () => {
    if (!id) return

    // Validate toàn bộ form
    const isValid = validateForm()
    if (!isValid) {
      // Hiển thị thông báo lỗi và chuyển đến tab có lỗi
      showErrorToast("Vui lòng kiểm tra lại thông tin bài báo")

      if (formErrors.title || formErrors.abstract || formErrors.field || formErrors.keywords) {
        setActiveTab("basic-info")
      } else if (formErrors.authors || formErrors.correspondingAuthor) {
        setActiveTab("authors")
      } else if (formErrors.articleFile) {
        setActiveTab("files")
      }

      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      // Chuẩn bị dữ liệu JSON
      const articleData: any = {
        title: formData.title,
        titlePrefix: formData.titlePrefix || "",
        subtitle: formData.subtitle || "",
        abstract: formData.abstract,
        field: formData.field,
        articleLanguage: formData.articleLanguage,
        submitterNote: formData.submitterNote || "",
        status: "resubmitted",
        keywords: formData.keywords.length > 0 ? formData.keywords : ["Chưa phân loại"],
        secondaryFields: formData.secondaryFields || [],
      }

      // Upload thumbnail if exists
      if (thumbnail) {
        try {
          setUploadProgress(20)
          showSuccessToast("Đang tải lên ảnh thu nhỏ...")
          const thumbnailUrl = await uploadArticleThumbnailToCloudinary(thumbnail)
          articleData.thumbnail = thumbnailUrl
          setUploadProgress(30)
        } catch (error) {
          console.error("Error uploading thumbnail:", error)
          showErrorToast("Lỗi khi tải lên ảnh thu nhỏ")
          setIsSubmitting(false)
          return
        }
      }

      // Upload article file if exists
      let uploadedFileId = null
      if (articleFile) {
        try {
          setUploadProgress(50)
          showSuccessToast("Đang tải lên file bài báo...")
          await uploadArticleFile(id, "manuscript", articleFile, article?.currentRound || 1)
          // Sau khi upload thành công, lấy lại danh sách file để lấy fileId mới nhất
          await getArticleFiles(id)
          // Lấy fileId của file mới nhất (manuscript, round hiện tại, isActive)
          const latestFile = files.find(f => f.fileCategory === "manuscript" && f.isActive)
          if (latestFile) {
            uploadedFileId = latestFile._id
            articleData.articleFile = uploadedFileId
          }
          setUploadProgress(70)
        } catch (error) {
          console.error("Error uploading article file:", error)
          showErrorToast("Lỗi khi tải lên file bài báo")
          setIsSubmitting(false)
          return
        }
      }

      // Update article
      setUploadProgress(80)
      await updateArticle(id, articleData)

      // Handle authors (giữ nguyên như cũ)
      if (article?.authors && Array.isArray(article.authors)) {
        for (const author of article.authors) {
          if (typeof author === "object" && author._id) {
            const stillExists = formData.authors.some(
              (a) => (a._id && a._id === author._id) || (a.email === author.email && a.fullName === author.fullName),
            )

            if (!stillExists) {
              try {
                await deleteArticleAuthor(author._id)
              } catch (error) {
                console.error("Error deleting author:", error)
              }
            }
          }
        }
      }

      for (let i = 0; i < formData.authors.length; i++) {
        const author = formData.authors[i]

        if (author._id) {
          await updateArticleAuthor(author._id, {
            ...author,
            order: i + 1,
          })
        } else {
          await createArticleAuthor({
            articleId: id,
            fullName: author.fullName,
            email: author.email,
            institution: author.institution || "",
            country: author.country || "",
            isCorresponding: author.isCorresponding || false,
            hasAccount: author.hasAccount || false,
            order: i + 1,
          })
        }
      }

      setUploadProgress(100)
      showSuccessToast("Đã cập nhật bài báo thành công")

      // Chuyển hướng đến trang danh sách bài báo
      navigate(`/admin/articles/${id}`)
    } catch (error) {
      console.error("Error updating article:", error)
      showErrorToast("Có lỗi xảy ra khi cập nhật bài báo")
    } finally {
      setIsSubmitting(false)
      setShowConfirmation(false)
      setUploadProgress(0)
    }
  }

  // Xử lý nút "Tiếp theo"
  const handleNext = () => {
    if (activeTab === "basic-info") {
      handleTabChange("authors")
    } else if (activeTab === "authors") {
      handleTabChange("files")
    } else if (activeTab === "files") {
      handleTabChange("review")
    }
  }

  // Xử lý nút "Quay lại"
  const handleBack = () => {
    if (activeTab === "authors") {
      setActiveTab("basic-info")
    } else if (activeTab === "files") {
      setActiveTab("authors")
    } else if (activeTab === "review") {
      setActiveTab("files")
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A"
    return format(new Date(date), "dd/MM/yyyy HH:mm")
  }

  const getStatusBadgeColor = (status: ArticleStatus): "default" | "secondary" | "outline" | "destructive" => {
    const colors: Record<ArticleStatus, "default" | "secondary" | "outline" | "destructive"> = {
      draft: "outline",
      submitted: "secondary",
      underReview: "secondary",
      revisionRequired: "outline",
      resubmitted: "secondary",
      accepted: "default",
      rejected: "destructive",
      published: "default",
    }
    return colors[status] || "outline"
  }

  // Thêm hàm getBackRoute để xác định route quay lại
  const getBackRoute = () => {
    if (parentRoute) {
      return parentRoute;
    }
    // Nếu không có parentRoute, xác định dựa trên đường dẫn hiện tại
    const path = location.pathname;
    if (path.startsWith('/admin/articles')) {
      return '/admin/articles';
    }
    return '/post-article';
  }

  if (loading.fields || (loading.article && !isLoaded)) {
    return <LoadingSpinner />
  }

  // Nếu bài báo đã xuất bản, hiển thị chế độ chỉ đọc
  if (isPublished) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button variant="ghost" onClick={() => navigate(getBackRoute())} className="flex items-center mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>
            <h1 className="text-2xl font-bold">Bài báo đã xuất bản</h1>
            <p className="text-gray-500">Bài báo này đã được xuất bản và không thể chỉnh sửa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowVersionHistory(true)}>
              <History className="mr-2 h-4 w-4" /> Lịch sử phiên bản
            </Button>
          </div>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Bài báo đã xuất bản</AlertTitle>
          <AlertDescription className="text-amber-700">
            Bài báo này đã được xuất bản và không thể chỉnh sửa để đảm bảo tính minh bạch và toàn vẹn của nội dung đã
            công bố.
          </AlertDescription>
        </Alert>

        {/* Hiển thị thông tin bài báo ở chế độ chỉ đọc */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Thông tin bài báo</CardTitle>
                  <Badge variant={getStatusBadgeColor(article?.status || "draft")}>{article?.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {article?.titlePrefix ? `${article.titlePrefix} ` : ""}
                    {article?.title}
                  </h2>
                  {article?.subtitle && <p className="text-lg text-gray-600 mt-1">{article.subtitle}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Tóm tắt</h3>
                  <p className="text-gray-700 whitespace-pre-line">{article?.abstract}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Từ khóa</h3>
                    <div className="flex flex-wrap gap-2">
                      {article?.keywords?.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Lĩnh vực</h3>
                    <div>
                      <Badge variant="default" className="mb-2">
                        {typeof article?.field === "object" ? article?.field?.name : ""}
                      </Badge>

                      {article?.secondaryFields && article.secondaryFields.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500 block mb-1">Lĩnh vực phụ:</span>
                          <div className="flex flex-wrap gap-2">
                            {article.secondaryFields.map((field, idx) => (
                              <Badge key={idx} variant="outline">
                                {typeof field === "object" ? field.name : ""}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Ngôn ngữ</h3>
                    <p>{article?.articleLanguage === "vi" ? "Tiếng Việt" : "Tiếng Anh"}</p>
                  </div>

                  {article?.doi && (
                    <div>
                      <h3 className="font-medium mb-2">DOI</h3>
                      <p className="font-mono text-sm">{article.doi}</p>
                    </div>
                  )}
                </div>

                {article?.articleFile && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium">Tệp đính kèm</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-10 w-10 text-blue-500 mr-3" />
                          <div>
                            <div className="font-medium">
                              {article.articleFile.fileName || article.articleFile.originalName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {article.articleFile.fileSize
                                ? `${(article.articleFile.fileSize / 1024 / 1024).toFixed(2)} MB`
                                : "Unknown size"}{" "}
                              •{" "}
                              {article.articleFile.createdAt
                                ? new Date(article.articleFile.createdAt).toLocaleDateString("vi-VN")
                                : "Unknown date"}
                              {article.articleFile.fileVersion && <> • Phiên bản: {article.articleFile.fileVersion}</>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={article.articleFile.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" /> Xem
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={article.articleFile.fileUrl} download>
                              <FileSymlink className="h-4 w-4 mr-1" /> Tải xuống
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tác giả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {article?.authors?.map((author, idx) => {
                    const authorObj = isArticleAuthor(author) ? author : { fullName: author }
                    return (
                      <div key={idx} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{authorObj.fullName}</div>
                            {isArticleAuthor(authorObj) && authorObj.email && (
                              <div className="text-sm text-gray-600 mt-1">{authorObj.email}</div>
                            )}
                            {isArticleAuthor(authorObj) && authorObj.institution && (
                              <div className="text-sm text-gray-600 mt-1">{authorObj.institution}</div>
                            )}
                            {isArticleAuthor(authorObj) && authorObj.country && (
                              <div className="text-sm text-gray-600 mt-1">{authorObj.country}</div>
                            )}
                            {isArticleAuthor(authorObj) && authorObj.orcid && (
                              <div className="text-sm text-gray-600 mt-1">ORCID: {authorObj.orcid}</div>
                            )}
                          </div>
                          {isArticleAuthor(authorObj) && authorObj.isCorresponding && (
                            <Badge className="bg-blue-500">Tác giả liên hệ</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {article?.thumbnail && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Ảnh thu nhỏ</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={article.thumbnail || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-auto object-cover"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog lịch sử phiên bản */}
        <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <History className="h-5 w-5 mr-2 text-blue-500" />
                Lịch sử phiên bản bài báo
              </DialogTitle>
              <DialogDescription>Xem lịch sử các phiên bản và thay đổi trạng thái của bài báo</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Lịch sử trạng thái
              </h3>
              <div className="space-y-2 mb-6">
                {article?.statusHistory && Array.isArray(article.statusHistory) ? (
                  article.statusHistory.map((history, index) => {
                    const statusItem = isStatusHistory(history)
                      ? history
                      : { status: "unknown" as ArticleStatus, timestamp: new Date() }
                    return (
                      <div key={index} className="flex items-start gap-4 p-3 border rounded-md">
                        <div className="mt-1">
                          <Badge variant={getStatusBadgeColor(statusItem.status)}>{statusItem.status}</Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{formatDate(statusItem.timestamp)}</span>
                          </div>
                          {isStatusHistory(statusItem) && statusItem.reason && (
                            <p className="mt-1 text-sm">{statusItem.reason}</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-muted-foreground">Không có lịch sử trạng thái</p>
                )}
              </div>

              <h3 className="font-medium mb-2 mt-6 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Lịch sử tệp đính kèm
              </h3>
              <div className="space-y-2">
                {files && files.length > 0 ? (
                  files.map((file, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border rounded-md">
                      <div className="mt-1">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{file.fileName || file.originalName}</div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>Phiên bản: {file.fileVersion}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" /> Xem
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Không có lịch sử tệp đính kèm</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVersionHistory(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="ghost" onClick={() => navigate(getBackRoute())} className="flex items-center mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa bài báo</h1>
          <p className="text-gray-500">Cập nhật thông tin bài báo của bạn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowVersionHistory(true)}>
            <History className="mr-2 h-4 w-4" /> Lịch sử phiên bản
          </Button>
          <Button
            onClick={() => {
              const isValid = validateForm()
              if (isValid) {
                setShowConfirmation(true)
              } else {
                showErrorToast("Vui lòng kiểm tra lại thông tin bài báo")
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Cập nhật bài báo
          </Button>

          {/* Dialog xác nhận cập nhật */}
          <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận cập nhật bài báo</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn cập nhật bài báo này? Sau khi cập nhật, bài báo sẽ được chuyển thành trạng thái
                  "Đã gửi lại" và quá trình xét duyệt sẽ bắt đầu lại.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit}>Cập nhật bài báo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar for uploads */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {uploadProgress < 100 ? "Đang tải lên..." : "Hoàn thành!"}
          </p>
        </div>
      )}

      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-800">Lưu ý quan trọng</AlertTitle>
        <AlertDescription className="text-amber-700">
          Khi cập nhật bài báo, trạng thái sẽ được chuyển thành "Đã gửi lại" và quá trình xét duyệt sẽ bắt đầu lại.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Các bước thực hiện</CardTitle>
              <CardDescription>Hoàn thành các bước sau để cập nhật bài báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    activeTab === "basic-info" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveTab("basic-info")}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "basic-info"
                        ? "bg-primary-foreground text-primary"
                        : "bg-muted-foreground text-muted"
                    }`}
                  >
                    1
                  </div>
                  <span>Thông tin cơ bản</span>
                </div>
                <div
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    activeTab === "authors" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveTab("authors")}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "authors" ? "bg-primary-foreground text-primary" : "bg-muted-foreground text-muted"
                    }`}
                  >
                    2
                  </div>
                  <span>Thông tin tác giả</span>
                </div>
                <div
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    activeTab === "files" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveTab("files")}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "files" ? "bg-primary-foreground text-primary" : "bg-muted-foreground text-muted"
                    }`}
                  >
                    3
                  </div>
                  <span>Tệp đính kèm</span>
                </div>
                <div
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    activeTab === "review" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveTab("review")}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "review" ? "bg-primary-foreground text-primary" : "bg-muted-foreground text-muted"
                    }`}
                  >
                    4
                  </div>
                  <span>Xem lại & Cập nhật</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <div className="text-sm text-muted-foreground mb-4">
                <p className="font-medium mb-2">Lưu ý:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Các trường có dấu (*) là bắt buộc</li>
                  <li>Kiểm tra kỹ thông tin trước khi cập nhật</li>
                  <li>File sẽ được tải lên khi bạn xác nhận cập nhật</li>
                </ul>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-2" />
                <span>Cần trợ giúp? Liên hệ ban biên tập</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                {/* Tab Thông tin cơ bản */}
                <TabsContent value="basic-info" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Nhập các thông tin cơ bản về bài báo của bạn. Thông tin này sẽ được hiển thị công khai và được
                        sử dụng để tìm kiếm.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="title" className="font-medium">
                            Tiêu đề bài báo <span className="text-red-500">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                                  <HelpCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Tiêu đề nên ngắn gọn, súc tích và phản ánh chính xác nội dung nghiên cứu
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Nhập tiêu đề bài báo"
                          className={formErrors.title ? "border-red-500" : ""}
                        />
                        {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          Tiêu đề nên có độ dài từ 10 đến 20 từ và phản ánh nội dung chính của bài báo
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="titlePrefix" className="font-medium">
                            Tiền tố tiêu đề
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                                  <HelpCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Tiền tố tiêu đề thường là một cụm từ ngắn xuất hiện trước tiêu đề chính
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="titlePrefix"
                          name="titlePrefix"
                          value={formData.titlePrefix}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: Nghiên cứu khoa học:"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Tiền tố tiêu đề là tùy chọn và thường được sử dụng để phân loại bài báo
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="subtitle" className="font-medium">
                            Tiêu đề phụ
                          </Label>
                        </div>
                        <Input
                          id="subtitle"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleInputChange}
                          placeholder="Nhập tiêu đề phụ (nếu có)"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Tiêu đề phụ cung cấp thêm thông tin về nội dung hoặc phạm vi của bài báo
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="abstract" className="font-medium">
                            Tóm tắt <span className="text-red-500">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                                  <HelpCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Tóm tắt nên bao gồm mục tiêu nghiên cứu, phương pháp, kết quả chính và kết luận
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Textarea
                          id="abstract"
                          name="abstract"
                          value={formData.abstract}
                          onChange={handleInputChange}
                          placeholder="Nhập tóm tắt bài báo"
                          className={`min-h-[150px] ${formErrors.abstract ? "border-red-500" : ""}`}
                        />
                        {formErrors.abstract && <p className="text-sm text-red-500 mt-1">{formErrors.abstract}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          Tóm tắt nên có độ dài từ 150 đến 250 từ và cung cấp tổng quan về nghiên cứu
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="field" className="font-medium">
                            Lĩnh vực nghiên cứu <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        <Select value={formData.field} onValueChange={(value) => handleSelectChange("field", value)}>
                          <SelectTrigger id="field" className={formErrors.field ? "border-red-500" : ""}>
                            <SelectValue placeholder="Chọn lĩnh vực nghiên cứu" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields &&
                              fields.map((field: Field) => (
                                <SelectItem key={field._id} value={field._id || ""}>
                                  {field.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {formErrors.field && <p className="text-sm text-red-500 mt-1">{formErrors.field}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          Chọn lĩnh vực phù hợp nhất với nội dung nghiên cứu của bạn
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="secondaryFields" className="font-medium">
                            Lĩnh vực phụ
                          </Label>
                        </div>
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (!formData.secondaryFields.includes(value) && value !== formData.field) {
                              setFormData((prev) => ({
                                ...prev,
                                secondaryFields: [...prev.secondaryFields, value],
                              }))
                            }
                          }}
                        >
                          <SelectTrigger id="secondaryFields">
                            <SelectValue placeholder="Chọn lĩnh vực phụ (nếu có)" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields &&
                              fields
                                .filter((field: Field) => field._id !== formData.field)
                                .map((field: Field) => (
                                  <SelectItem key={field._id} value={field._id || ""}>
                                    {field.name}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.secondaryFields.map((fieldId) => {
                            const fieldName = fields?.find((f: Field) => f._id === fieldId)?.name || fieldId
                            return (
                              <Badge key={fieldId} variant="secondary" className="px-3 py-1">
                                {fieldName}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-1 p-0"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      secondaryFields: prev.secondaryFields.filter((id) => id !== fieldId),
                                    }))
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            )
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bạn có thể chọn thêm các lĩnh vực phụ liên quan đến nghiên cứu
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="keywords" className="font-medium">
                            Từ khóa <span className="text-red-500">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                                  <HelpCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Từ khóa giúp độc giả tìm thấy bài báo của bạn khi tìm kiếm</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex">
                          <Input
                            id="keywords"
                            value={currentKeyword}
                            onChange={(e) => setCurrentKeyword(e.target.value)}
                            placeholder="Nhập từ khóa"
                            className={`flex-1 ${formErrors.keywords ? "border-red-500" : ""}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddKeyword()
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={handleAddKeyword}
                            className="ml-2"
                            disabled={!currentKeyword.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formErrors.keywords && <p className="text-sm text-red-500 mt-1">{formErrors.keywords}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="px-3 py-1">
                              {keyword}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 p-0"
                                onClick={() => handleRemoveKeyword(keyword)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Thêm 3-5 từ khóa liên quan đến nội dung nghiên cứu
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Label htmlFor="articleLanguage" className="font-medium">
                            Ngôn ngữ bài báo
                          </Label>
                        </div>
                        <RadioGroup
                          value={formData.articleLanguage}
                          onValueChange={(value) => handleSelectChange("articleLanguage", value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vi" id="vi" />
                            <Label htmlFor="vi">Tiếng Việt</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="en" id="en" />
                            <Label htmlFor="en">Tiếng Anh</Label>
                          </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground mt-1">
                          Chọn ngôn ngữ chính được sử dụng trong bài báo
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button onClick={handleNext} className="flex items-center">
                      Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab Thông tin tác giả */}
                <TabsContent value="authors" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Thông tin tác giả</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Thêm thông tin về tất cả các tác giả của bài báo. Đảm bảo thông tin chính xác và đầy đủ.
                      </p>
                    </div>

                    {/* Danh sách tác giả */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Danh sách tác giả</h3>
                      {formData.authors.length === 0 ? (
                        <div className="bg-muted p-4 rounded-md text-center">
                          <p className="text-muted-foreground">Chưa có tác giả nào. Vui lòng thêm tác giả bên dưới.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.authors.map((author, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-semibold flex items-center">
                                      {author.fullName}
                                      {author.isCorresponding && (
                                        <Badge className="ml-2 bg-blue-500">Tác giả liên hệ</Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">{author.email}</div>
                                    {(author.institution || author.country) && (
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {author.institution}
                                        {author.institution && author.country ? ", " : ""}
                                        {author.country}
                                      </div>
                                    )}
                                    {author.orcid && (
                                      <div className="text-sm text-blue-600 mt-1">ORCID: {author.orcid}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveAuthor(index, "up")}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveAuthor(index, "down")}
                                      disabled={index === formData.authors.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    {!author.isCorresponding && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetCorrespondingAuthor(index)}
                                      >
                                        Đặt làm tác giả liên hệ
                                      </Button>
                                    )}
                                    <Button variant="destructive" size="icon" onClick={() => handleRemoveAuthor(index)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Form thêm tác giả */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Thêm tác giả mới</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="authorFullName" className="font-medium">
                            Họ tên <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="authorFullName"
                            name="fullName"
                            value={newAuthor.fullName}
                            onChange={handleNewAuthorChange}
                            placeholder="Nhập họ tên đầy đủ"
                          />
                        </div>
                        <div>
                          <Label htmlFor="authorEmail" className="font-medium">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="authorEmail"
                            name="email"
                            type="email"
                            value={newAuthor.email}
                            onChange={handleNewAuthorChange}
                            placeholder="Nhập địa chỉ email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="authorInstitution" className="font-medium">
                            Cơ quan
                          </Label>
                          <Input
                            id="authorInstitution"
                            name="institution"
                            value={newAuthor.institution}
                            onChange={handleNewAuthorChange}
                            placeholder="Nhập tên cơ quan"
                          />
                        </div>
                        <div>
                          <Label htmlFor="authorCountry" className="font-medium">
                            Quốc gia
                          </Label>
                          <Input
                            id="authorCountry"
                            name="country"
                            value={newAuthor.country}
                            onChange={handleNewAuthorChange}
                            placeholder="Nhập tên quốc gia"
                          />
                        </div>
                        <div>
                          <Label htmlFor="authorOrcid" className="font-medium">
                            ORCID
                          </Label>
                          <Input
                            id="authorOrcid"
                            name="orcid"
                            value={newAuthor.orcid}
                            onChange={handleNewAuthorChange}
                            placeholder="Nhập mã ORCID (nếu có)"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            ORCID là mã định danh duy nhất cho nhà nghiên cứu (ví dụ: 0000-0002-1825-0097)
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                          <Switch
                            id="isCorresponding"
                            checked={newAuthor.isCorresponding}
                            onCheckedChange={(checked) =>
                              setNewAuthor((prev) => ({ ...prev, isCorresponding: checked }))
                            }
                          />
                          <Label htmlFor="isCorresponding">Đây là tác giả liên hệ</Label>
                        </div>
                      </div>
                      <Button onClick={handleAddAuthor} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Thêm tác giả
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md mt-6">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-700">Lưu ý về tác giả</h4>
                          <ul className="text-sm text-blue-600 mt-1 list-disc pl-5 space-y-1">
                            <li>Thứ tự tác giả rất quan trọng. Bạn có thể điều chỉnh bằng các nút mũi tên.</li>
                            <li>Mỗi bài báo phải có một tác giả liên hệ chịu trách nhiệm trao đổi với ban biên tập.</li>
                            <li>
                              Đảm bảo thông tin của tất cả tác giả là chính xác và đầy đủ trước khi cập nhật bài báo.
                            </li>
                            <li>
                              Tất cả tác giả được liệt kê phải có đóng góp đáng kể vào nghiên cứu và chấp thuận việc
                              đăng bài.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack} className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                    <Button onClick={handleNext} className="flex items-center">
                      Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab Tệp đính kèm */}
                <TabsContent value="files" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Tệp đính kèm</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Tải lên file bài báo và ảnh thu nhỏ (nếu có). Đảm bảo file bài báo đúng định dạng và không vượt
                        quá kích thước cho phép.
                      </p>
                    </div>

                    {/* Upload file bài báo */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">File bài báo</h3>

                      {/* Hiển thị file hiện tại nếu có */}
                      {article?.articleFile && (
                        <div className="mb-4 p-4 border rounded-md bg-gray-50">
                          <h4 className="font-medium mb-2">File hiện tại:</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-8 w-8 text-blue-500 mr-3" />
                              <div>
                                <p className="font-medium">
                                  {article.articleFile.fileName || article.articleFile.originalName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {article.articleFile.fileSize
                                    ? `${(article.articleFile.fileSize / 1024 / 1024).toFixed(2)} MB`
                                    : "Unknown size"}{" "}
                                  •{" "}
                                  {article.articleFile.createdAt
                                    ? new Date(article.articleFile.createdAt).toLocaleDateString("vi-VN")
                                    : "Unknown date"}
                                  {article.articleFile.fileVersion && (
                                    <> • Phiên bản: {article.articleFile.fileVersion}</>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.articleFile.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-1" /> Xem
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.articleFile.fileUrl} download>
                                  <FileSymlink className="h-4 w-4 mr-1" /> Tải xuống
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        {articleFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-10 w-10 text-blue-500 mr-4" />
                              <div className="text-left">
                                <p className="font-medium">{articleFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(articleFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleRemoveFile("article")}>
                                <Trash2 className="h-4 w-4 mr-2" /> Xóa
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium">
                              {article?.articleFile
                                ? "Tải lên file mới để thay thế"
                                : "Kéo thả file hoặc nhấp để tải lên"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Hỗ trợ định dạng PDF, DOC, DOCX (tối đa 20MB)
                            </p>
                            <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                              <Upload className="h-4 w-4 mr-2" /> Chọn file
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileChange(e, "article")}
                            />
                          </div>
                        )}
                      </div>
                      {formErrors.articleFile && <p className="text-sm text-red-500 mt-1">{formErrors.articleFile}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        File bài báo nên được định dạng theo hướng dẫn của tạp chí và không chứa thông tin nhận dạng tác
                        giả nếu bài báo được đánh giá ẩn danh.
                      </p>
                    </div>

                    {/* Upload ảnh thu nhỏ */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Ảnh thu nhỏ (tùy chọn)</h3>
                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        {thumbnailPreview ? (
                          <div>
                            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-4 max-w-md mx-auto">
                              <img
                                src={thumbnailPreview || "/placeholder.svg"}
                                alt="Thumbnail preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex justify-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleRemoveFile("thumbnail")}>
                                <Trash2 className="h-4 w-4 mr-2" /> Xóa
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium">Kéo thả ảnh hoặc nhấp để tải lên</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Hỗ trợ định dạng JPG, PNG, GIF (tối đa 5MB)
                            </p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => thumbnailInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" /> Chọn ảnh
                            </Button>
                            <input
                              type="file"
                              ref={thumbnailInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, "thumbnail")}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ảnh thu nhỏ sẽ được hiển thị cùng với bài báo của bạn trên trang web. Nên chọn ảnh có tỷ lệ 16:9
                        và độ phân giải tốt.
                      </p>
                    </div>

                    {/* Ghi chú */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Ghi chú cho ban biên tập (tùy chọn)</h3>
                      <Textarea
                        name="submitterNote"
                        value={formData.submitterNote}
                        onChange={handleInputChange}
                        placeholder="Nhập ghi chú hoặc thông tin bổ sung cho ban biên tập"
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Bạn có thể cung cấp thông tin bổ sung hoặc yêu cầu đặc biệt cho ban biên tập.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack} className="flex items-center">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Button>
                    <Button onClick={handleNext} className="flex items-center">
                      Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab Xem lại & Cập nhật */}
                <TabsContent value="review" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Xem lại & Cập nhật</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Vui lòng kiểm tra lại tất cả thông tin trước khi cập nhật bài báo. Sau khi cập nhật, bài báo sẽ
                        được chuyển thành trạng thái "Đã gửi lại" và quá trình xét duyệt sẽ bắt đầu lại.
                      </p>
                    </div>

                    {/* Thông tin cơ bản */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Thông tin cơ bản</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("basic-info")}
                            className="text-blue-600"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Chỉnh sửa
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Tiêu đề</dt>
                            <dd className="mt-1">
                              {formData.titlePrefix ? `${formData.titlePrefix} ` : ""}
                              {formData.title}
                              {formData.subtitle ? ` - ${formData.subtitle}` : ""}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Tóm tắt</dt>
                            <dd className="mt-1">{formData.abstract || "Chưa có tóm tắt"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Lĩnh vực</dt>
                            <dd className="mt-1">
                              {fields?.find((f: Field) => f._id === formData.field)?.name || "Chưa chọn lĩnh vực"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Từ khóa</dt>
                            <dd className="mt-1">
                              {formData.keywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {formData.keywords.map((keyword) => (
                                    <Badge key={keyword} variant="secondary">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                "Chưa có từ khóa"
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Ngôn ngữ</dt>
                            <dd className="mt-1">{formData.articleLanguage === "vi" ? "Tiếng Việt" : "Tiếng Anh"}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    {/* Thông tin tác giả */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Thông tin tác giả</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("authors")}
                            className="text-blue-600"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Chỉnh sửa
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {formData.authors.length > 0 ? (
                          <div className="space-y-4">
                            {formData.authors.map((author, index) => (
                              <div key={index} className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium flex items-center">
                                    {author.fullName}
                                    {author.isCorresponding && (
                                      <Badge className="ml-2 bg-blue-500">Tác giả liên hệ</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">{author.email}</div>
                                  {(author.institution || author.country) && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {author.institution}
                                      {author.institution && author.country ? ", " : ""}
                                      {author.country}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Chưa có thông tin tác giả</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Tệp đính kèm */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Tệp đính kèm</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("files")}
                            className="text-blue-600"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Chỉnh sửa
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">File bài báo</dt>
                            <dd className="mt-1">
                              {articleFile ? (
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                                  <span>
                                    {articleFile.name} ({(articleFile.size / 1024 / 1024).toFixed(2)} MB) - File mới
                                  </span>
                                </div>
                              ) : article?.articleFile ? (
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                                  <span>
                                    {article.articleFile.fileName || article.articleFile.originalName} - File hiện tại
                                  </span>
                                </div>
                              ) : (
                                <span className="text-yellow-600">Chưa tải lên file bài báo</span>
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Ảnh thu nhỏ</dt>
                            <dd className="mt-1">
                              {thumbnail ? (
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3">
                                    <img
                                      src={thumbnailPreview || ""}
                                      alt="Thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span>
                                    {thumbnail.name} ({(thumbnail.size / 1024 / 1024).toFixed(2)} MB) - Ảnh mới
                                  </span>
                                </div>
                              ) : article?.thumbnail ? (
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3">
                                    <img
                                      src={article.thumbnail || "/placeholder.svg"}
                                      alt="Current thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span>Ảnh thu nhỏ hiện tại</span>
                                </div>
                              ) : (
                                "Chưa tải lên ảnh thu nhỏ (tùy chọn)"
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Ghi chú cho ban biên tập</dt>
                            <dd className="mt-1">
                              {formData.submitterNote ? (
                                <div className="bg-gray-50 p-3 rounded-md">{formData.submitterNote}</div>
                              ) : (
                                "Không có ghi chú"
                              )}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    {/* Xác nhận và cập nhật */}
                    <div className="bg-blue-50 p-6 rounded-md">
                      <h3 className="text-lg font-semibold text-blue-700 mb-3">Xác nhận và cập nhật</h3>
                      <p className="text-blue-600 mb-4">
                        Vui lòng kiểm tra lại tất cả thông tin trước khi cập nhật bài báo. Sau khi cập nhật, bài báo sẽ
                        được chuyển thành trạng thái "Đã gửi lại" và quá trình xét duyệt sẽ bắt đầu lại.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button variant="outline" onClick={handleBack} className="flex items-center">
                          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          className="flex items-center"
                          disabled={isSubmitting || !formData.title.trim()}
                        >
                          {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Cập nhật bài báo
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

      {/* Dialog lịch sử phiên bản */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-500" />
              Lịch sử phiên bản bài báo
            </DialogTitle>
            <DialogDescription>Xem lịch sử các phiên bản và thay đổi trạng thái của bài báo</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              Lịch sử trạng thái
            </h3>
            <div className="space-y-2 mb-6">
              {article?.statusHistory && Array.isArray(article.statusHistory) ? (
                article.statusHistory.map((history, index) => {
                  const statusItem = isStatusHistory(history)
                    ? history
                    : { status: "unknown" as ArticleStatus, timestamp: new Date() }
                  return (
                    <div key={index} className="flex items-start gap-4 p-3 border rounded-md">
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeColor(statusItem.status)}>{statusItem.status}</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatDate(statusItem.timestamp)}</span>
                        </div>
                        {isStatusHistory(statusItem) && statusItem.reason && (
                          <p className="mt-1 text-sm">{statusItem.reason}</p>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground">Không có lịch sử trạng thái</p>
              )}
            </div>

            <h3 className="font-medium mb-2 mt-6 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Lịch sử tệp đính kèm
            </h3>
            <div className="space-y-2">
              {files && files.length > 0 ? (
                files.map((file, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 border rounded-md">
                    <div className="mt-1">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{file.fileName || file.originalName}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>Phiên bản: {file.fileVersion}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" /> Xem
                      </a>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Không có lịch sử tệp đính kèm</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionHistory(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}