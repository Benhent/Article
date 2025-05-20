import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Button } from "../../../../../components/ui/button"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Textarea } from "../../../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs"
import { Badge } from "../../../../../components/ui/badge"
import { Checkbox } from "../../../../../components/ui/checkbox"
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
import { ArrowLeft, FileText, Loader2, Plus, Trash2, Eye } from "lucide-react"
import {
  useArticleStore,
  useFieldStore,
  useFileStore,
  useUIStore,
  useAuthorStore,
} from "../../../../../store/rootStore"
import { uploadArticleThumbnailToCloudinary, uploadArticleFileToCloudinary } from "../../../../../config/cloudinary"
import apiService from "../../../../../services/api"
import type { ArticleAuthor, Field } from "../../../../../types/article"

export default function MyArticleEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { article, fetchArticleById, updateArticle, loading} = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
  const { deleteArticleFile} = useFileStore()
  const { createArticleAuthor, updateArticleAuthor, deleteArticleAuthor } = useAuthorStore()
  const { showSuccessToast, showErrorToast } = useUIStore()

  // Form state
  const [form, setForm] = useState({
    titlePrefix: "",
    title: "",
    subtitle: "",
    abstract: "",
    keywords: "",
    articleLanguage: "vi",
    field: "",
    secondaryFields: [] as string[],
    authors: [] as ArticleAuthor[],
    submitterNote: "",
  })

  // File state
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Author state
  const [authorInput, setAuthorInput] = useState<ArticleAuthor>({
    fullName: "",
    email: "",
    institution: "",
    country: "",
    isCorresponding: false,
    hasAccount: false,
  })

  const [tab, setTab] = useState("basic")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchFields({ isActive: true })
    if (id) {
      fetchArticleById(id)
    }
  }, [id, fetchArticleById, fetchFields])

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
          ? article.authors.map((a) =>
              typeof a === "string"
                ? { fullName: a, email: "", institution: "", country: "", isCorresponding: false, hasAccount: false }
                : a,
            )
          : [],
        submitterNote: article.submitterNote || "",
      })

      if (article.thumbnail) {
        setThumbnailPreview(article.thumbnail)
      }

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

  const handleFieldChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      field: value,
      secondaryFields: prev.secondaryFields.filter((id) => id !== value),
    }))

    // Clear field error if exists
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
    // Validate author input
    const errors: Record<string, string> = {}
    if (!authorInput.fullName) errors.authorName = "Tên tác giả là bắt buộc"
    if (!authorInput.email) errors.authorEmail = "Email tác giả là bắt buộc"
    else if (!/\S+@\S+\.\S+/.test(authorInput.email)) errors.authorEmail = "Email không hợp lệ"

    if (Object.keys(errors).length > 0) {
      setFormErrors({ ...formErrors, ...errors })
      return
    }

    setForm((prev) => ({
      ...prev,
      authors: [...prev.authors, authorInput],
    }))

    setAuthorInput({
      fullName: "",
      email: "",
      institution: "",
      country: "",
      isCorresponding: false,
      hasAccount: false,
    })

    // Clear author errors
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
      authors: prev.authors.filter((_, i) => i !== idx),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      // Xác thực loại tệp
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

      // Xác thực kích thước tệp (10MB limit)
      const invalidSizeFiles = selectedFiles.filter((file) => file.size > 10 * 1024 * 1024)

      if (invalidSizeFiles.length > 0) {
        setFormErrors((prev) => ({
          ...prev,
          files: "Một số tệp vượt quá giới hạn 10MB",
        }))
        return
      }

      setNewFiles((prev) => [...prev, ...selectedFiles])

      // Xóa lỗi nếu có
      if (formErrors.files) {
        setFormErrors((prev) => ({ ...prev, files: "" }))
      }

      // Reset giá trị input để cho phép chọn lại cùng một tệp
      e.target.value = ""
    }
  }

  const handleRemoveNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleDeleteExistingFile = async (fileId: string) => {
    if (fileId) {
      try {
        await deleteArticleFile(fileId)
        showSuccessToast("Đã xóa tệp thành công")

        // Cập nhật lại thông tin bài báo sau khi xóa tệp
        if (id) {
          await fetchArticleById(id)
        }
      } catch (error) {
        console.error("Error deleting file:", error)
        showErrorToast("Lỗi khi xóa tệp")
      }
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({ ...prev, thumbnail: "Vui lòng chọn tệp hình ảnh" }))
        return
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, thumbnail: "Kích thước ảnh không được vượt quá 2MB" }))
        return
      }

      setThumbnail(file)

      // Clear thumbnail error if exists
      if (formErrors.thumbnail) {
        setFormErrors((prev) => ({ ...prev, thumbnail: "" }))
      }
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Xác thực các trường bắt buộc
    if (!form.title.trim()) errors.title = "Tiêu đề là bắt buộc"
    if (!form.abstract.trim()) errors.abstract = "Tóm tắt là bắt buộc"
    if (!form.keywords.trim()) errors.keywords = "Từ khóa là bắt buộc"
    if (!form.field) errors.field = "Lĩnh vực chính là bắt buộc"

    // Xác thực tác giả
    if (form.authors.length === 0) {
      errors.authors = "Cần ít nhất một tác giả"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id) return

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(formErrors)[0]
      const element = document.getElementById(firstError)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Chuẩn bị dữ liệu bài báo
      const keywordsArr = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)

      // 2. Xử lý thumbnail nếu có
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

      // 3. Cập nhật thông tin bài báo sử dụng store
      const data = {
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
      }
      await updateArticle(id, data)

      // 4. Xử lý tác giả
      // Xóa tác giả cũ nếu cần
      if (article?.authors && Array.isArray(article.authors)) {
        for (const author of article.authors) {
          if (typeof author === "object" && author._id) {
            // Kiểm tra xem tác giả này có còn trong danh sách mới không
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

      // Thêm hoặc cập nhật tác giả mới
      for (let i = 0; i < form.authors.length; i++) {
        const author = form.authors[i]

        if (author._id) {
          // Cập nhật tác giả hiện có
          await updateArticleAuthor(author._id, {
            ...author,
            order: i + 1,
          })
        } else {
          // Tạo tác giả mới
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

      // 5. Xử lý tệp đính kèm mới nếu có
      if (newFiles.length > 0) {
        setUploadingFiles(true)
        try {
          // Nếu có file cũ, xóa trước
          if (article?.articleFile) {
            await deleteArticleFile(article.articleFile._id)
          }

          // Upload file mới lên Cloudinary
          for (const file of newFiles) {
            try {
              const cloudinaryData = await uploadArticleFileToCloudinary(file);

              // Tạo bản ghi file trên server
              const fileResponse = await apiService.post(`/files/${id}`, {
                articleId: id,
                fileCategory: "manuscript",
                round: 1,
                fileName: cloudinaryData.fileName || file.name,
                originalName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: cloudinaryData.fileUrl,
                filePath: cloudinaryData.fileUrl
              });

              // Cập nhật article với file reference
              await apiService.put(`/articles/${id}/update`, {
                articleFile: (fileResponse.data as { _id: string })._id
              });
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
        }
      }

      // 6. Tải lại thông tin bài báo để cập nhật UI
      await fetchArticleById(id)

      showSuccessToast("Cập nhật bài báo thành công")
      // 7. Chuyển hướng đến trang chi tiết bài báo
      navigate(`/post-article/${id}`)
    } catch (error) {
      console.error("Error updating article:", error)
      showErrorToast("Lỗi khi cập nhật bài báo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || uploadingThumbnail || uploadingFiles || loading.updateArticle

  if (loading.article && !isLoaded)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(`/post-article/${id}`)} className="flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Chỉnh sửa bài báo</CardTitle>
          <div className="text-gray-500">Cập nhật thông tin bài báo</div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="authors">Tác giả</TabsTrigger>
              <TabsTrigger value="files">Tệp đính kèm</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="mt-6">
              <TabsContent value="basic">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className={formErrors.title ? "text-red-500" : ""}>
                      Tiêu đề *
                    </Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className={formErrors.title ? "border-red-500" : ""}
                    />
                    {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="titlePrefix">Tiền tố tiêu đề</Label>
                    <Input
                      id="titlePrefix"
                      value={form.titlePrefix}
                      onChange={(e) => setForm((f) => ({ ...f, titlePrefix: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Tiêu đề phụ</Label>
                    <Input
                      id="subtitle"
                      value={form.subtitle}
                      onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="abstract" className={formErrors.abstract ? "text-red-500" : ""}>
                      Tóm tắt *
                    </Label>
                    <Textarea
                      id="abstract"
                      value={form.abstract}
                      onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
                      className={formErrors.abstract ? "border-red-500" : ""}
                      rows={5}
                    />
                    {formErrors.abstract && <p className="text-red-500 text-sm mt-1">{formErrors.abstract}</p>}
                  </div>

                  <div>
                    <Label htmlFor="keywords" className={formErrors.keywords ? "text-red-500" : ""}>
                      Từ khóa (phân cách bởi dấu phẩy) *
                    </Label>
                    <Input
                      id="keywords"
                      value={form.keywords}
                      onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                      className={formErrors.keywords ? "border-red-500" : ""}
                      placeholder="Ví dụ: khoa học, công nghệ, giáo dục"
                    />
                    {formErrors.keywords && <p className="text-red-500 text-sm mt-1">{formErrors.keywords}</p>}
                  </div>

                  <div>
                    <Label htmlFor="articleLanguage">Ngôn ngữ</Label>
                    <Select
                      value={form.articleLanguage}
                      onValueChange={(v) => setForm((f) => ({ ...f, articleLanguage: v }))}
                    >
                      <SelectTrigger id="articleLanguage">
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">Tiếng Anh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="field" className={formErrors.field ? "text-red-500" : ""}>
                      Lĩnh vực chính *
                    </Label>
                    <Select value={form.field} onValueChange={handleFieldChange}>
                      <SelectTrigger id="field" className={formErrors.field ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn lĩnh vực chính" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields &&
                          fields.length > 0 &&
                          fields.map((field: Field) => (
                            <SelectItem key={field._id} value={field._id}>
                              {field.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {formErrors.field && <p className="text-red-500 text-sm mt-1">{formErrors.field}</p>}
                  </div>

                  <div>
                    <Label>Lĩnh vực phụ (chọn nhiều)</Label>
                    <div className="flex flex-wrap gap-2 mt-2 border rounded-md p-2 min-h-[42px]">
                      {fields &&
                        fields
                          .filter((f: Field) => f._id !== form.field)
                          .map((field: Field) => (
                            <Badge
                              key={field._id}
                              variant={form.secondaryFields.includes(field._id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleSecondaryFieldChange(field._id)}
                            >
                              {field.name}
                            </Badge>
                          ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="submitterNote">Ghi chú</Label>
                    <Textarea
                      id="submitterNote"
                      value={form.submitterNote}
                      onChange={(e) => setForm((f) => ({ ...f, submitterNote: e.target.value }))}
                      placeholder="Ghi chú thêm về bài báo (nếu có)"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="thumbnail" className={formErrors.thumbnail ? "text-red-500" : ""}>
                      Ảnh thu nhỏ
                    </Label>
                    <div className="mt-2 flex items-start gap-4">
                      <div className="flex-1">
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className={formErrors.thumbnail ? "border-red-500" : ""}
                        />
                        {formErrors.thumbnail && <p className="text-red-500 text-sm mt-1">{formErrors.thumbnail}</p>}
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (tối đa 2MB)</p>
                      </div>

                      {thumbnailPreview && (
                        <div className="w-24 h-24 relative">
                          <img
                            src={thumbnailPreview || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnail(null)
                              setThumbnailPreview("")
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="button" variant="outline" onClick={() => setTab("authors")}>
                    Tiếp tục
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="authors">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className={formErrors.authors ? "text-red-500" : ""}>Danh sách tác giả *</Label>
                    {formErrors.authors && <p className="text-red-500 text-sm">{formErrors.authors}</p>}
                  </div>

                  {form.authors.length === 0 ? (
                    <div className="text-gray-400 mb-4">Chưa có tác giả nào</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {form.authors.map((author, idx) => (
                        <div key={idx} className="border rounded-md p-3 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthor(idx)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="font-medium">
                            {author.fullName}
                            {author.isCorresponding && <Badge className="ml-2 bg-blue-500">Tác giả liên hệ</Badge>}
                          </div>
                          <div className="text-sm text-gray-600">{author.email}</div>
                          {author.institution && <div className="text-sm text-gray-600">{author.institution}</div>}
                          {author.country && <div className="text-sm text-gray-600">{author.country}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="font-medium mb-4">Thêm tác giả mới</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="authorName" className={formErrors.authorName ? "text-red-500" : ""}>
                          Họ tên *
                        </Label>
                        <Input
                          id="authorName"
                          value={authorInput.fullName}
                          onChange={(e) => setAuthorInput((a) => ({ ...a, fullName: e.target.value }))}
                          className={formErrors.authorName ? "border-red-500" : ""}
                        />
                        {formErrors.authorName && <p className="text-red-500 text-sm mt-1">{formErrors.authorName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="authorEmail" className={formErrors.authorEmail ? "text-red-500" : ""}>
                          Email *
                        </Label>
                        <Input
                          id="authorEmail"
                          type="email"
                          value={authorInput.email}
                          onChange={(e) => setAuthorInput((a) => ({ ...a, email: e.target.value }))}
                          className={formErrors.authorEmail ? "border-red-500" : ""}
                        />
                        {formErrors.authorEmail && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.authorEmail}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="authorInstitution">Tổ chức</Label>
                        <Input
                          id="authorInstitution"
                          value={authorInput.institution}
                          onChange={(e) => setAuthorInput((a) => ({ ...a, institution: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="authorCountry">Quốc gia</Label>
                        <Input
                          id="authorCountry"
                          value={authorInput.country}
                          onChange={(e) => setAuthorInput((a) => ({ ...a, country: e.target.value }))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isCorresponding"
                            checked={authorInput.isCorresponding}
                            onCheckedChange={(checked) =>
                              setAuthorInput((a) => ({ ...a, isCorresponding: checked === true }))
                            }
                          />
                          <Label htmlFor="isCorresponding">Đây là tác giả liên hệ</Label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button type="button" onClick={handleAddAuthor} className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" /> Thêm tác giả
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => setTab("basic")}>
                      Quay lại
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setTab("files")}>
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className={formErrors.files ? "text-red-500" : ""}>Tệp đính kèm hiện tại</Label>
                    {formErrors.files && <p className="text-red-500 text-sm">{formErrors.files}</p>}
                  </div>

                  {article?.articleFile ? (
                    <div className="space-y-2 mb-6">
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
                          <Button variant="ghost" size="sm" asChild>
                            <a href={article.articleFile.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" /> Xem
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={article.articleFile.fileUrl} download>
                              Download
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa tệp này? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExistingFile(article.articleFile._id)}>
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <Label>Tải lên tệp mới</Label>
                      <Input
                        id="files"
                        type="file"
                        accept=".pdf,.doc,.docx,.zip"
                        multiple={false}
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX, ZIP (tối đa 10MB mỗi tệp)</p>
                      {newFiles.length > 0 && (
                        <div className="space-y-2 mt-2 mb-4">
                          {newFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                                <div>
                                  <div className="font-medium">{file.name}</div>
                                  <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveNewFile(idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <AlertDialog>
                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={() => setTab("authors")}>
                        Quay lại
                      </Button>

                      <AlertDialogTrigger asChild>
                        <Button type="button" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Lưu thay đổi
                        </Button>
                      </AlertDialogTrigger>
                    </div>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận cập nhật</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn cập nhật bài báo này? Hãy kiểm tra lại thông tin trước khi xác nhận.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Xác nhận</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}