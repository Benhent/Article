import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
import { ArrowLeft, FileText, Loader2, Plus, Trash2, X } from "lucide-react"
import { useArticleStore, useFieldStore, useUIStore } from "../../../../../store/rootStore"
import { uploadArticleThumbnailToCloudinary, uploadArticleFileToCloudinary } from "../../../../../config/cloudinary"
import type { ArticleAuthor, ArticleFile, Article } from "../../../../../types/article"
import apiService from "../../../../../services/api"

export default function MyArticleCreate() {
  const navigate = useNavigate()
  const { createArticle, loading } = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
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
  const [manuscript, setManuscript] = useState<File | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingManuscript, setUploadingManuscript] = useState(false)

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

  // Thay đổi phần useEffect để kiểm tra và xử lý dữ liệu fields
  useEffect(() => {
    fetchFields({ isActive: true })
  }, [fetchFields])

  // Handle thumbnail preview
  useEffect(() => {
    if (thumbnail) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(thumbnail)
    } else {
      setThumbnailPreview("")
    }
  }, [thumbnail])

  // Field selection handlers
  const handleMainFieldChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      field: value,
      // Remove the main field from secondary fields if it's there
      secondaryFields: prev.secondaryFields.filter((id) => id !== value),
    }))

    if (formErrors.field) {
      setFormErrors((prev) => ({ ...prev, field: "" }))
    }
  }

  const handleSecondaryFieldChange = (value: string) => {
    if (!form.secondaryFields.includes(value) && value !== form.field) {
      setForm((prev) => ({
        ...prev,
        secondaryFields: [...prev.secondaryFields, value],
      }))
    }
  }

  const handleRemoveSecondaryField = (fieldId: string) => {
    setForm((prev) => ({
      ...prev,
      secondaryFields: prev.secondaryFields.filter((id) => id !== fieldId),
    }))
  }

  // Thay đổi hàm getFieldNameById để xử lý cấu trúc dữ liệu mới
  const getFieldNameById = (fieldId: string): string => {
    if (!fields || !Array.isArray(fields)) return ""
    const field = fields.find((f: any) => f._id === fieldId || f.id === fieldId)
    return field ? field.name : ""
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

  const handleManuscriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      const allowedTypes = [".pdf", ".doc", ".docx"]
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        setFormErrors((prev) => ({ ...prev, manuscript: "Chỉ chấp nhận file PDF hoặc DOC/DOCX" }))
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, manuscript: "Kích thước file không được vượt quá 10MB" }))
        return
      }

      setManuscript(file)

      // Clear manuscript error if exists
      if (formErrors.manuscript) {
        setFormErrors((prev) => ({ ...prev, manuscript: "" }))
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

    // Required fields
    if (!form.title) errors.title = "Tiêu đề là bắt buộc"
    if (!form.abstract) errors.abstract = "Tóm tắt là bắt buộc"
    if (!form.keywords) errors.keywords = "Từ khóa là bắt buộc"
    if (!form.field) errors.field = "Lĩnh vực chính là bắt buộc"
    if (!manuscript) errors.manuscript = "Bản thảo bài viết là bắt buộc"

    // Validate authors
    if (form.authors.length === 0) {
      errors.authors = "Cần ít nhất một tác giả"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        showErrorToast("Vui lòng kiểm tra lại thông tin bắt buộc!");
        return;
      }

      setIsSubmitting(true);

      // 1. Upload thumbnail if exists
      let thumbnailUrl = "";
      if (thumbnail) {
        setUploadingThumbnail(true);
        try {
          thumbnailUrl = await uploadArticleThumbnailToCloudinary(thumbnail);
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          showErrorToast("Lỗi khi tải lên ảnh thu nhỏ");
          return;
        } finally {
          setUploadingThumbnail(false);
        }
      }

      // 2. Create article first
      const keywordsArr = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const articleData = {
        ...form,
        keywords: keywordsArr,
        thumbnail: thumbnailUrl,
        status: "submitted", // Set default status to submitted
      };

      let newArticleId;
      try {
        newArticleId = await createArticle(articleData);
      } catch (error: any) {
        showErrorToast(error.message || "Lỗi khi tạo bài báo");
        return;
      }
      
      if (!newArticleId) {
        showErrorToast("Lỗi khi tạo bài báo");
        return;
      }

      // 3. Upload manuscript if exists
      if (manuscript) {
        setUploadingManuscript(true);
        try {
          const cloudinaryData = await uploadArticleFileToCloudinary(manuscript);
          
          // Create article file record
          const fileResponse = await apiService.post<ArticleFile>(`/files/${newArticleId}`, {
            articleId: newArticleId,
            fileCategory: "manuscript",
            round: 1,
            fileName: cloudinaryData.fileName || manuscript.name,
            originalName: manuscript.name,
            fileType: manuscript.type,
            fileSize: manuscript.size,
            fileUrl: cloudinaryData.fileUrl,
            filePath: cloudinaryData.fileUrl
          });

          // Update article with file reference
          await apiService.put<Article>(`/articles/${newArticleId}/update`, {
            articleFile: fileResponse.data._id
          });

        } catch (error) {
          console.error("Error uploading manuscript:", error);
          showErrorToast("Lỗi khi tải lên bản thảo");
          return;
        } finally {
          setUploadingManuscript(false);
        }
      }

      showSuccessToast("Tạo bài báo thành công");
      navigate("/post-article");
    } catch (error) {
      console.error("Error creating article:", error);
      showErrorToast("Lỗi khi tạo bài báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCreate = async () => {
    await handleSubmit();
  };

  const isLoading = isSubmitting || uploadingThumbnail || uploadingManuscript || loading.createArticle;

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate("/post-article")} className="flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Tạo bài báo mới</CardTitle>
          <div className="text-gray-500">Điền thông tin để tạo bài báo mới</div>
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

                  {/* Main Field Dropdown */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mainField" className={`text-right ${formErrors.field ? "text-red-500" : ""}`}>
                      Lĩnh vực chính *
                    </Label>
                    <div className="col-span-3">
                      <Select value={form.field} onValueChange={handleMainFieldChange}>
                        <SelectTrigger id="mainField" className={formErrors.field ? "border-red-500" : ""}>
                          <SelectValue placeholder="Chọn lĩnh vực chính" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(fields) && fields.length > 0 ? (
                            fields.map((field: any) => (
                              <SelectItem key={field._id || field.id} value={field._id || field.id}>
                                {field.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Không có dữ liệu lĩnh vực
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {formErrors.field && <p className="text-red-500 text-sm mt-1">{formErrors.field}</p>}
                    </div>
                  </div>

                  {/* Secondary Fields */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="secondaryFields" className="text-right">
                      Lĩnh vực phụ
                    </Label>
                    <div className="col-span-3">
                      <Select onValueChange={handleSecondaryFieldChange}>
                        <SelectTrigger id="secondaryFields">
                          <SelectValue placeholder="Chọn lĩnh vực phụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(fields) && fields.length > 0 ? (
                            fields
                              .filter((field: any) => {
                                const fieldId = field._id || field.id
                                return fieldId !== form.field && !form.secondaryFields.includes(fieldId)
                              })
                              .map((field: any) => (
                                <SelectItem key={field._id || field.id} value={field._id || field.id}>
                                  {field.name}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Không có dữ liệu lĩnh vực
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.secondaryFields.map((fieldId) => (
                          <div
                            key={fieldId}
                            className="flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-sm"
                          >
                            {getFieldNameById(fieldId)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleRemoveSecondaryField(fieldId)}
                            >
                              <span className="sr-only">Remove field</span>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
                  <div className="mb-6">
                    <Label htmlFor="manuscript" className={formErrors.manuscript ? "text-red-500" : ""}>
                      Bản thảo bài viết *
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="manuscript"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleManuscriptChange}
                        className={formErrors.manuscript ? "border-red-500" : ""}
                      />
                      {formErrors.manuscript && <p className="text-red-500 text-sm mt-1">{formErrors.manuscript}</p>}
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX (tối đa 10MB)</p>
                    </div>

                    {manuscript && (
                      <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-gray-500" />
                          <div>
                            <div className="font-medium">{manuscript.name}</div>
                            <div className="text-xs text-gray-500">{(manuscript.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setManuscript(null)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <AlertDialog>
                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={() => setTab("authors")}>
                        Quay lại
                      </Button>

                      <AlertDialogTrigger asChild>
                        <Button type="button" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Tạo bài báo
                        </Button>
                      </AlertDialogTrigger>
                    </div>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận tạo bài báo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn tạo bài báo này? Hãy kiểm tra lại thông tin trước khi xác nhận.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmCreate}>Xác nhận</AlertDialogAction>
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