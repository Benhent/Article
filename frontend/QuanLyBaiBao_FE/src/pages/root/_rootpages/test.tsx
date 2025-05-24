import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  Save,
  Upload,
  CheckCircle,
  Lock,
  History,
  Clock,
  FileSymlink,
  ChevronLeft,
  BookOpen,
  Users,
  Paperclip,
  X,
  Star,
  Globe,
  Tag,
  ImageIcon,
  ArrowRight,
  Check,
  AlertTriangle,
  Zap,
  Sparkles,
  Target,
  Shield,
  Monitor,
  Smartphone,
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Badge } from "../../../components/ui/badge"
import { Checkbox } from "../../../components/ui/checkbox"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Progress } from "../../../components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Separator } from "../../../components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { useArticleStore, useFieldStore, useFileStore, useUIStore, useAuthorStore } from "../../../store/rootStore"
import { uploadArticleThumbnailToCloudinary } from "../../../config/cloudinary"
import { format } from "date-fns"

// Import all necessary types
import type { Article, ArticleStatus } from "../../../types/article"
import type { ArticleAuthor } from "../../../types/author"
import type { Field } from "../../../types/field"
import type { StatusHistory } from "../../../types/statushistory"

interface FormState {
  titlePrefix: string
  title: string
  subtitle: string
  abstract: string
  keywords: string
  articleLanguage: string
  field: string
  secondaryFields: string[]
  authors: ArticleAuthor[]
  submitterNote: string
}

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

export default function test() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { article, fetchArticleById, updateArticle, loading } = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
  const { files, getArticleFiles, deleteArticleFile, uploadArticleFile } = useFileStore()
  const { createArticleAuthor, updateArticleAuthor, deleteArticleAuthor } = useAuthorStore()
  const { showSuccessToast, showErrorToast } = useUIStore()

  // Form state
  const [form, setForm] = useState<FormState>({
    titlePrefix: "",
    title: "",
    subtitle: "",
    abstract: "",
    keywords: "",
    articleLanguage: "vi",
    field: "",
    secondaryFields: [],
    authors: [],
    submitterNote: "",
  })

  // File state
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  // Author state
  const [authorInput, setAuthorInput] = useState<ArticleAuthor>({
    fullName: "",
    email: "",
    institution: "",
    country: "",
    isCorresponding: false,
    hasAccount: false,
    order: 1,
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    {
      id: 0,
      title: "Thông tin cơ bản",
      description: "Tiêu đề, tóm tắt và thông tin chính",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 1,
      title: "Tác giả",
      description: "Thông tin về các tác giả",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      title: "Tệp đính kèm",
      description: "Tải lên tài liệu và hình ảnh",
      icon: Paperclip,
      color: "from-green-500 to-emerald-500",
    },
  ]

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
      setForm({
        titlePrefix: article.titlePrefix || "",
        title: article.title || "",
        subtitle: article.subtitle || "",
        abstract: article.abstract || "",
        keywords: Array.isArray(article.keywords) ? article.keywords.join(", ") : "",
        articleLanguage: article.articleLanguage || "vi",
        field: typeof article.field === "string" ? article.field : article.field?._id || "",
        secondaryFields: Array.isArray(article.secondaryFields)
          ? article.secondaryFields.map((f) => (typeof f === "string" ? f : f._id))
          : [],
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
        submitterNote: article.submitterNote || "",
      })

      if (article.thumbnail) {
        setThumbnailPreview(article.thumbnail)
      }

      setIsPublished(article.status === "published")
      setIsLoaded(true)
    }
  }, [article, isLoaded])

  // Handle thumbnail preview
  useEffect(() => {
    if (thumbnail) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(thumbnail)
    }
  }, [thumbnail])

  // Check step completion
  useEffect(() => {
    const completed: number[] = []

    // Step 0: Basic info
    if (form.title && form.abstract && form.keywords && form.field) {
      completed.push(0)
    }

    // Step 1: Authors
    if (form.authors.length > 0) {
      completed.push(1)
    }

    // Step 2: Files (if article has file or new files)
    if (article?.articleFile || newFiles.length > 0) {
      completed.push(2)
    }

    setCompletedSteps(completed)
  }, [form, article, newFiles])

  const handleFieldChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      field: value,
      secondaryFields: prev.secondaryFields.filter((id) => id !== value),
    }))

    if (formErrors.field) {
      setFormErrors((prev) => ({ ...prev, field: "" }))
    }
  }

  const handleSecondaryFieldChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      secondaryFields: prev.secondaryFields.includes(value)
        ? prev.secondaryFields.filter((id) => id !== value)
        : [...prev.secondaryFields, value],
    }))
  }

  const handleAddAuthor = () => {
    const errors: Record<string, string> = {}
    if (!authorInput.fullName) errors.authorName = "Tên tác giả là bắt buộc"
    if (!authorInput.email) errors.authorEmail = "Email tác giả là bắt buộc"
    else if (!/\S+@\S+\.\S+/.test(authorInput.email)) errors.authorEmail = "Email không hợp lệ"

    if (Object.keys(errors).length > 0) {
      setFormErrors({ ...formErrors, ...errors })
      return
    }

    const newAuthor: ArticleAuthor = {
      ...authorInput,
      order: form.authors.length + 1,
    }

    setForm((prev) => ({
      ...prev,
      authors: [...prev.authors, newAuthor],
    }))

    setAuthorInput({
      fullName: "",
      email: "",
      institution: "",
      country: "",
      isCorresponding: false,
      hasAccount: false,
      order: form.authors.length + 2,
    })

    setFormErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.authorName
      delete newErrors.authorEmail
      return newErrors
    })
  }

  const handleRemoveAuthor = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors
        .filter((_, i) => i !== idx)
        .map((author, newIndex) => ({
          ...author,
          order: newIndex + 1,
        })),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      const validTypes = [".pdf", ".doc", ".docx", ".zip"]
      const invalidTypeFiles = selectedFiles.filter((file) => {
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
        return !validTypes.includes(extension)
      })

      if (invalidTypeFiles.length > 0) {
        setFormErrors((prev) => ({
          ...prev,
          files: "Chỉ chấp nhận các tệp PDF, DOC, DOCX, hoặc ZIP",
        }))
        return
      }

      const invalidSizeFiles = selectedFiles.filter((file) => file.size > 10 * 1024 * 1024)

      if (invalidSizeFiles.length > 0) {
        setFormErrors((prev) => ({
          ...prev,
          files: "Một số tệp vượt quá giới hạn 10MB",
        }))
        return
      }

      setNewFiles((prev) => [...prev, ...selectedFiles])

      if (formErrors.files) {
        setFormErrors((prev) => ({ ...prev, files: "" }))
      }

      e.target.value = ""
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({ ...prev, thumbnail: "Vui lòng chọn tệp hình ảnh" }))
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, thumbnail: "Kích thước ảnh không được vượt quá 2MB" }))
        return
      }

      setThumbnail(file)

      if (formErrors.thumbnail) {
        setFormErrors((prev) => ({ ...prev, thumbnail: "" }))
      }
    }
  }

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {}

    if (currentStep === 0) {
      if (!form.title.trim()) errors.title = "Tiêu đề là bắt buộc"
      if (!form.abstract.trim()) errors.abstract = "Tóm tắt là bắt buộc"
      if (!form.keywords.trim()) errors.keywords = "Từ khóa là bắt buộc"
      if (!form.field) errors.field = "Lĩnh vực chính là bắt buộc"
    } else if (currentStep === 1) {
      if (form.authors.length === 0) {
        errors.authors = "Cần ít nhất một tác giả"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!id || !validateCurrentStep()) return

    setIsSubmitting(true)

    try {
      const keywordsArr = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)

      let thumbnailUrl = article?.thumbnail || ""
      if (thumbnail) {
        setUploadingThumbnail(true)
        try {
          thumbnailUrl = await uploadArticleThumbnailToCloudinary(thumbnail)
        } catch (error) {
          console.error("Error uploading thumbnail:", error)
          showErrorToast("Lỗi khi tải lên ảnh thu nhỏ")
        } finally {
          setUploadingThumbnail(false)
        }
      }

      const data: Partial<Article> = {
        titlePrefix: form.titlePrefix,
        title: form.title,
        subtitle: form.subtitle,
        abstract: form.abstract,
        keywords: keywordsArr,
        articleLanguage: form.articleLanguage,
        field: form.field,
        secondaryFields: form.secondaryFields,
        submitterNote: form.submitterNote,
        thumbnail: thumbnailUrl,
        status: "resubmitted" as ArticleStatus,
      }
      await updateArticle(id, data)

      // Handle authors
      if (article?.authors && Array.isArray(article.authors)) {
        for (const author of article.authors) {
          if (typeof author === "object" && author._id) {
            const stillExists = form.authors.some(
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

      for (let i = 0; i < form.authors.length; i++) {
        const author = form.authors[i]

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

      // Handle new files
      if (newFiles.length > 0) {
        setUploadingFiles(true)
        try {
          const currentRound = article?.currentRound || 1

          for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i]
            const progress = ((i + 1) / newFiles.length) * 100
            setUploadProgress(progress)

            try {
              await uploadArticleFile(id, "manuscript", file, currentRound)
            } catch (uploadError) {
              console.error("Error uploading file:", uploadError)
              showErrorToast(`Lỗi khi tải lên tệp ${file.name}`)
            }
          }
        } catch (error) {
          console.error("Error handling files:", error)
          showErrorToast("Lỗi khi xử lý tệp đính kèm")
        } finally {
          setUploadingFiles(false)
          setUploadProgress(0)
        }
      }

      await fetchArticleById(id)
      await getArticleFiles(id)

      showSuccessToast("Cập nhật bài báo thành công")
      navigate(`/admin/articles/${id}`)
    } catch (error) {
      console.error("Error updating article:", error)
      showErrorToast("Lỗi khi cập nhật bài báo")
    } finally {
      setIsSubmitting(false)
    }
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A"
    return format(new Date(date), "dd/MM/yyyy HH:mm")
  }

  const isLoading = isSubmitting || uploadingThumbnail || uploadingFiles || loading.updateArticle

  if (loading.article && !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang tải bài báo</h3>
          <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
        </motion.div>
      </div>
    )
  }

  if (isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 mb-8 shadow-lg"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Lock className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài báo đã xuất bản</h1>
                  <p className="text-gray-700 text-lg">
                    Bài báo này đã được xuất bản và không thể chỉnh sửa để đảm bảo tính minh bạch
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/articles/${id}`)}
                  className="bg-white hover:bg-gray-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVersionHistory(true)}
                  className="bg-white hover:bg-gray-50"
                >
                  <History className="mr-2 h-4 w-4" /> Lịch sử phiên bản
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Published article content would go here */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/articles/${id}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Quay lại
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa bài báo</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Cập nhật và gửi lại để xét duyệt</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(true)}
                className="hidden sm:flex"
              >
                <History className="h-4 w-4 mr-2" />
                Lịch sử
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tiến trình chỉnh sửa</h2>
              <div className="text-sm text-gray-600">
                Bước {currentStep + 1} / {steps.length}
              </div>
            </div>

            {/* Desktop Steps */}
            <div className="hidden md:flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === index
                const isCompleted = completedSteps.includes(index)
                const StepIcon = step.icon

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <motion.div
                        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                            : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-400"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isCompleted && !isActive ? <Check className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-white/20"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          />
                        )}
                      </motion.div>
                      <div className="mt-3 text-center">
                        <div className={`font-medium text-sm ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 max-w-24">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-px bg-gray-200 mx-4 mt-6">
                        <div
                          className={`h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ${
                            completedSteps.includes(index) ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile Steps */}
            <div className="md:hidden">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? "bg-blue-500 w-8"
                          : completedSteps.includes(index)
                            ? "bg-green-500"
                            : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{steps[currentStep].title}</h3>
                <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Alert className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Lưu ý quan trọng</AlertTitle>
            <AlertDescription className="text-amber-700">
              Khi cập nhật bài báo, trạng thái sẽ được chuyển thành "Đã gửi lại" và quá trình xét duyệt sẽ bắt đầu lại.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
                    <p className="text-gray-600">Nhập tiêu đề, tóm tắt và thông tin chính của bài báo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label
                        htmlFor="title"
                        className={`text-sm font-medium ${formErrors.title ? "text-red-500" : "text-gray-700"}`}
                      >
                        Tiêu đề bài báo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        className={`mt-2 h-12 text-lg ${formErrors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Nhập tiêu đề bài báo của bạn..."
                      />
                      {formErrors.title && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.title}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label htmlFor="titlePrefix" className="text-sm font-medium text-gray-700">
                        Tiền tố tiêu đề
                      </Label>
                      <Input
                        id="titlePrefix"
                        value={form.titlePrefix}
                        onChange={(e) => setForm((f) => ({ ...f, titlePrefix: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="Ví dụ: Nghiên cứu, Phân tích..."
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="subtitle" className="text-sm font-medium text-gray-700">
                        Tiêu đề phụ
                      </Label>
                      <Input
                        id="subtitle"
                        value={form.subtitle}
                        onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="Tiêu đề phụ (nếu có)..."
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label
                        htmlFor="keywords"
                        className={`text-sm font-medium ${formErrors.keywords ? "text-red-500" : "text-gray-700"}`}
                      >
                        Từ khóa <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="keywords"
                        value={form.keywords}
                        onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                        className={`mt-2 h-12 ${formErrors.keywords ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Ví dụ: khoa học, công nghệ, giáo dục"
                      />
                      {formErrors.keywords && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.keywords}
                        </motion.p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Phân cách các từ khóa bằng dấu phẩy</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Label htmlFor="articleLanguage" className="text-sm font-medium text-gray-700">
                          Ngôn ngữ
                        </Label>
                        <Select
                          value={form.articleLanguage}
                          onValueChange={(v) => setForm((f) => ({ ...f, articleLanguage: v }))}
                        >
                          <SelectTrigger id="articleLanguage" className="mt-2 h-12">
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vi">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Tiếng Việt
                              </div>
                            </SelectItem>
                            <SelectItem value="en">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Tiếng Anh
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Label
                          htmlFor="field"
                          className={`text-sm font-medium ${formErrors.field ? "text-red-500" : "text-gray-700"}`}
                        >
                          Lĩnh vực chính <span className="text-red-500">*</span>
                        </Label>
                        <Select value={form.field} onValueChange={handleFieldChange}>
                          <SelectTrigger id="field" className={`mt-2 h-12 ${formErrors.field ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Chọn lĩnh vực chính" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields?.map((field: Field) => (
                              <SelectItem key={field._id} value={field._id || ""}>
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  {field.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.field && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2 flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {formErrors.field}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Label
                        htmlFor="abstract"
                        className={`text-sm font-medium ${formErrors.abstract ? "text-red-500" : "text-gray-700"}`}
                      >
                        Tóm tắt <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="abstract"
                        value={form.abstract}
                        onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
                        className={`mt-2 min-h-[200px] resize-none ${formErrors.abstract ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Nhập tóm tắt chi tiết về nội dung bài báo..."
                      />
                      {formErrors.abstract && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.abstract}
                        </motion.p>
                      )}
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Mô tả ngắn gọn về nghiên cứu của bạn</span>
                        <span>{form.abstract.length} ký tự</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Label className="text-sm font-medium text-gray-700">Lĩnh vực phụ</Label>
                      <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {fields
                            ?.filter((f: Field) => f._id !== form.field)
                            .map((field: Field) => (
                              <motion.div key={field._id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Badge
                                  variant={form.secondaryFields.includes(field._id || "") ? "default" : "outline"}
                                  className="cursor-pointer transition-all duration-200 hover:shadow-md"
                                  onClick={() => handleSecondaryFieldChange(field._id || "")}
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {field.name}
                                </Badge>
                              </motion.div>
                            ))}
                        </div>
                        {fields?.filter((f: Field) => f._id !== form.field).length === 0 && (
                          <p className="text-gray-500 text-sm">Không có lĩnh vực phụ khả dụng</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Chọn các lĩnh vực liên quan đến bài báo</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <Label htmlFor="submitterNote" className="text-sm font-medium text-gray-700">
                        Ghi chú
                      </Label>
                      <Textarea
                        id="submitterNote"
                        value={form.submitterNote}
                        onChange={(e) => setForm((f) => ({ ...f, submitterNote: e.target.value }))}
                        placeholder="Ghi chú thêm về bài báo (nếu có)..."
                        rows={4}
                        className="mt-2 resize-none"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Authors */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin tác giả</h2>
                    <p className="text-gray-600">Quản lý danh sách tác giả của bài báo</p>
                  </div>
                </div>

                {/* Current Authors */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Danh sách tác giả ({form.authors.length})</h3>
                    {formErrors.authors && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-sm flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.authors}
                      </motion.p>
                    )}
                  </div>

                  {form.authors.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
                    >
                      <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tác giả</h3>
                      <p className="text-gray-600 mb-6">Thêm ít nhất một tác giả để tiếp tục</p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.authors.map((author, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{author.fullName}</h4>
                                {author.isCorresponding && (
                                  <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Liên hệ
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{author.email}</p>
                              {author.institution && <p className="text-sm text-gray-600 mb-1">{author.institution}</p>}
                              {author.country && <p className="text-sm text-gray-600">{author.country}</p>}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAuthor(idx)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa tác giả</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Author */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-indigo-900 mb-6 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Thêm tác giả mới
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="authorName"
                        className={`text-sm font-medium ${formErrors.authorName ? "text-red-500" : "text-gray-700"}`}
                      >
                        Họ tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="authorName"
                        value={authorInput.fullName}
                        onChange={(e) => setAuthorInput((a) => ({ ...a, fullName: e.target.value }))}
                        className={`mt-2 h-12 ${formErrors.authorName ? "border-red-500" : ""}`}
                        placeholder="Nhập họ tên đầy đủ"
                      />
                      {formErrors.authorName && <p className="text-red-500 text-sm mt-1">{formErrors.authorName}</p>}
                    </div>

                    <div>
                      <Label
                        htmlFor="authorEmail"
                        className={`text-sm font-medium ${formErrors.authorEmail ? "text-red-500" : "text-gray-700"}`}
                      >
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="authorEmail"
                        type="email"
                        value={authorInput.email}
                        onChange={(e) => setAuthorInput((a) => ({ ...a, email: e.target.value }))}
                        className={`mt-2 h-12 ${formErrors.authorEmail ? "border-red-500" : ""}`}
                        placeholder="email@example.com"
                      />
                      {formErrors.authorEmail && <p className="text-red-500 text-sm mt-1">{formErrors.authorEmail}</p>}
                    </div>

                    <div>
                      <Label htmlFor="authorInstitution" className="text-sm font-medium text-gray-700">
                        Tổ chức
                      </Label>
                      <Input
                        id="authorInstitution"
                        value={authorInput.institution}
                        onChange={(e) => setAuthorInput((a) => ({ ...a, institution: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="Tên tổ chức, trường đại học..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="authorCountry" className="text-sm font-medium text-gray-700">
                        Quốc gia
                      </Label>
                      <Input
                        id="authorCountry"
                        value={authorInput.country}
                        onChange={(e) => setAuthorInput((a) => ({ ...a, country: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="Việt Nam"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="isCorresponding"
                          checked={authorInput.isCorresponding}
                          onCheckedChange={(checked) =>
                            setAuthorInput((a) => ({ ...a, isCorresponding: checked === true }))
                          }
                        />
                        <Label htmlFor="isCorresponding" className="text-sm font-medium text-gray-700">
                          Đây là tác giả liên hệ
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={handleAddAuthor}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm tác giả
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Files */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 lg:p-8"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                    <Paperclip className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tệp đính kèm</h2>
                    <p className="text-gray-600">Tải lên tài liệu và hình ảnh cho bài báo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Main Files */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tệp bài báo chính</h3>

                      {article?.articleFile ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="h-8 w-8 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {article.articleFile.fileName || article.articleFile.originalName}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>
                                    {article.articleFile.fileSize
                                      ? `${(article.articleFile.fileSize / 1024 / 1024).toFixed(2)} MB`
                                      : "Unknown size"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {article.articleFile.createdAt
                                      ? new Date(article.articleFile.createdAt).toLocaleDateString("vi-VN")
                                      : "Unknown date"}
                                  </span>
                                  {article.articleFile.fileVersion && (
                                    <>
                                      <span>•</span>
                                      <span>v{article.articleFile.fileVersion}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.articleFile.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Xem
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.articleFile.fileUrl} download>
                                  <FileSymlink className="h-4 w-4 mr-1" />
                                  Tải
                                </a>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tệp bài báo</h3>
                          <p className="text-gray-600 mb-6">
                            Tải lên tệp bài báo chính để tiếp tục quá trình xét duyệt
                          </p>
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Chọn tệp
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.zip"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-4">PDF, DOCX, ZIP (tối đa 10MB)</p>
                        </motion.div>
                      )}
                    </div>

                    {/* New Files */}
                    {newFiles.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          Tệp mới sẽ được tải lên
                        </h4>
                        {newFiles.map((file, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Upload Progress */}
                    {uploadingFiles && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="animate-spin">
                            <Loader2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-blue-900">Đang tải lên tệp...</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2 bg-blue-100" />
                        <p className="text-sm text-blue-700 mt-2">
                          {Math.round(uploadProgress)}% - Vui lòng không đóng trang này
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Right Column - Thumbnail */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh thu nhỏ</h3>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="flex-1"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Chọn ảnh thu nhỏ
                          </Button>
                          <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                          />
                          {thumbnailPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setThumbnail(null)
                                setThumbnailPreview("")
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {formErrors.thumbnail && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {formErrors.thumbnail}
                          </motion.p>
                        )}

                        <p className="text-xs text-gray-500">PNG, JPG, GIF (tối đa 2MB)</p>

                        {thumbnailPreview && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                          >
                            <img
                              src={thumbnailPreview || "/placeholder.svg"}
                              alt="Thumbnail preview"
                              className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-lg"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                          </motion.div>
                        )}

                        {uploadingThumbnail && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-blue-600"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Đang tải ảnh...</span>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    {/* File Guidelines */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6"
                    >
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Hướng dẫn tải tệp
                      </h4>
                      <ul className="space-y-2 text-sm text-amber-800">
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Định dạng được hỗ trợ: PDF, DOCX, ZIP
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Kích thước tối đa: 10MB cho tệp, 2MB cho ảnh
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Tên tệp nên rõ ràng và có ý nghĩa
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Ảnh thu nhỏ giúp bài báo nổi bật hơn
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </div>

                {/* Final Confirmation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                  <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Xác nhận cập nhật</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Khi cập nhật bài báo, trạng thái sẽ được chuyển thành "Đã gửi lại" và quá trình xét duyệt sẽ bắt
                      đầu lại. Hãy kiểm tra kỹ thông tin trước khi xác nhận.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </Button>

              <div className="flex items-center gap-3">
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!completedSteps.includes(currentStep)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white flex items-center gap-2"
                  >
                    Tiếp tục
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        disabled={isLoading || !completedSteps.includes(0)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2 min-w-[140px]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Lưu và gửi lại
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          Xác nhận cập nhật
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn cập nhật bài báo này? Sau khi cập nhật, bài báo sẽ được chuyển sang
                          trạng thái "Đã gửi lại" và quá trình xét duyệt sẽ bắt đầu lại.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              Xác nhận
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Version History Dialog */}
        <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                Lịch sử phiên bản bài báo
              </DialogTitle>
              <DialogDescription>Xem lịch sử các phiên bản và thay đổi trạng thái của bài báo</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              {/* Status History */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Lịch sử trạng thái
                </h3>
                <div className="space-y-3">
                  {article?.statusHistory && Array.isArray(article.statusHistory) ? (
                    article.statusHistory.map((history, index) => {
                      const statusItem = isStatusHistory(history)
                        ? history
                        : { status: "unknown" as ArticleStatus, timestamp: new Date() }
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="mt-1">
                            <Badge variant={getStatusBadgeColor(statusItem.status)}>{statusItem.status}</Badge>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(statusItem.timestamp)}</span>
                            </div>
                            {isStatusHistory(statusItem) && statusItem.reason && (
                              <p className="mt-2 text-sm text-gray-700">{statusItem.reason}</p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có lịch sử trạng thái</p>
                  )}
                </div>
              </div>

              {/* File History */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-indigo-500" />
                  Lịch sử tệp đính kèm
                </h3>
                <div className="space-y-3">
                  {files && files.length > 0 ? (
                    files.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.fileName || file.originalName}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>Phiên bản: {file.fileVersion}</span>
                              <span>•</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </a>
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có lịch sử tệp đính kèm</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVersionHistory(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 sm:hidden"
              onClick={() => setShowMobileMenu(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Menu</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowVersionHistory(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Lịch sử phiên bản
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate(`/admin/articles/${id}`)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Quay lại bài báo
                    </Button>
                  </div>

                  {/* Device indicators */}
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Thiết bị hiện tại</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Smartphone className="h-4 w-4" />
                      <span>Điện thoại di động</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}