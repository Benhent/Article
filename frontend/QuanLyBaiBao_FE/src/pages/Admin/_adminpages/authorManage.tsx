import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Globe,
  Loader2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form"
import { Badge } from "../../../components/ui/badge"
import { Checkbox } from "../../../components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

import useAuthorStore from "../../../store/authorStore"
import useAuthStore from '../../../store/authStore'
import apiService from "../../../services/api"
import type { ArticleAuthor } from "../../../types/article"
import useArticleStore from '../../../store/articleStore'

interface AuthorFormData {
  fullName: string
  email: string
  institution: string
  country: string
  isCorresponding: boolean
  orcid?: string
  hasAccount: boolean
}

interface EmailCheckResponse {
  exists: boolean
}

const AuthorManage = () => {
  const { 
    authors, 
    loading,
    fetchAllAuthors, 
    createArticleAuthor, 
    updateArticleAuthor, 
    deleteArticleAuthor 
  } = useAuthorStore()

  const checkEmailExists = useAuthStore((state) => state.checkEmailExists)
  const { articles, fetchArticles } = useArticleStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<ArticleAuthor | null>(null)
  const [filter, setFilter] = useState<{ hasAccount?: boolean; isCorresponding?: boolean }>({})

  const addForm = useForm<AuthorFormData & { articleId: string }>({
    defaultValues: {
      articleId: '',
      fullName: "",
      email: "",
      institution: "",
      country: "",
      orcid: "",
      hasAccount: false,
      isCorresponding: false,
    }
  })
  const editForm = useForm<AuthorFormData & { articleId: string }>({
    defaultValues: {
      articleId: '',
      fullName: "",
      email: "",
      institution: "",
      country: "",
      orcid: "",
      hasAccount: false,
      isCorresponding: false,
    }
  })

  useEffect(() => {
    fetchAllAuthors(filter)
  }, [fetchAllAuthors, filter])

  useEffect(() => {
    if (selectedAuthor) {
      editForm.reset({
        articleId: selectedAuthor.articleId || '',
        fullName: selectedAuthor.fullName,
        email: selectedAuthor.email,
        institution: selectedAuthor.institution,
        country: selectedAuthor.country,
        orcid: selectedAuthor.orcid || "",
        hasAccount: selectedAuthor.hasAccount,
        isCorresponding: selectedAuthor.isCorresponding,
      })
    }
  }, [selectedAuthor, editForm])

  // Add effect to check if author has account when email changes
  useEffect(() => {
    const subscription = addForm.watch(async (value, { name }) => {
      if (name === "email" && value.email) {
        const exists = await checkEmailExists(value.email)
        addForm.setValue("hasAccount", !!exists)
      }
    })
    return () => subscription.unsubscribe()
  }, [addForm, checkEmailExists])

  // Add effect to check if author has account when email changes in edit form
  useEffect(() => {
    const subscription = editForm.watch(async (value, { name }) => {
      if (name === "email" && value.email) {
        const exists = await checkEmailExists(value.email)
        editForm.setValue("hasAccount", !!exists)
      }
    })
    return () => subscription.unsubscribe()
  }, [editForm, checkEmailExists])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Filter authors based on search query
  const filteredAuthors = authors.filter((author) =>
    author.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.institution.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddAuthor = async (data: AuthorFormData & { articleId: string }) => {
    try {
      await createArticleAuthor(data)
      setIsAddDialogOpen(false)
      addForm.reset()
    } catch (error) {
      console.error("Error adding author:", error)
    }
  }

  const handleEditAuthor = async (data: AuthorFormData & { articleId: string }) => {
    if (!selectedAuthor?._id) return
    try {
      await updateArticleAuthor(selectedAuthor._id, data)
      setIsEditDialogOpen(false)
      editForm.reset()
    } catch (error) {
      console.error("Error updating author:", error)
    }
  }

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor?._id) return
    try {
      await deleteArticleAuthor(selectedAuthor._id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting author:", error)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quản lý tác giả</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm tác giả
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm tác giả mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin tác giả vào form bên dưới
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddAuthor)}>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={addForm.control}
                        name="articleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bài báo</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Chọn bài báo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {articles.map((article) => (
                                    <SelectItem key={article._id} value={article._id}>{article.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên tác giả</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập tên tác giả" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cơ quan</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập tên cơ quan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quốc gia</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập quốc gia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="orcid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ORCID ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập ORCID ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="hasAccount"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={true}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Có tài khoản</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="isCorresponding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Tác giả liên hệ</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={loading.createAuthor}>
                        {loading.createAuthor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Thêm tác giả
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tác giả..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filter.hasAccount === undefined ? "all" : filter.hasAccount.toString()}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilter(prev => ({ ...prev, hasAccount: undefined }))
                  } else {
                    setFilter(prev => ({ ...prev, hasAccount: value === "true" }))
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tài khoản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Có tài khoản</SelectItem>
                  <SelectItem value="false">Không có tài khoản</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filter.isCorresponding === undefined ? "all" : filter.isCorresponding.toString()}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilter(prev => ({ ...prev, isCorresponding: undefined }))
                  } else {
                    setFilter(prev => ({ ...prev, isCorresponding: value === "true" }))
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Tác giả liên hệ</SelectItem>
                  <SelectItem value="false">Đồng tác giả</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên tác giả</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cơ quan</TableHead>
                    <TableHead>Quốc gia</TableHead>
                    <TableHead>ORCID</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.authors ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredAuthors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Không tìm thấy tác giả nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuthors.map((author) => (
                      <TableRow key={author._id}>
                        <TableCell className="font-medium">{author.fullName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {author.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {author.institution}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {author.country}
                          </div>
                        </TableCell>
                        <TableCell>{author.orcid || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={author.isCorresponding ? "default" : "secondary"}>
                            {author.isCorresponding ? "Tác giả liên hệ" : "Đồng tác giả"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedAuthor(author)
                                setIsEditDialogOpen(true)
                              }}
                              disabled={loading.updateAuthor}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedAuthor(author)
                                setIsDeleteDialogOpen(true)
                              }}
                              disabled={loading.deleteAuthor}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Author Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin tác giả</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tác giả trong form bên dưới
            </DialogDescription>
          </DialogHeader>
          {selectedAuthor && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditAuthor)}>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={editForm.control}
                    name="articleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bài báo</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn bài báo" />
                            </SelectTrigger>
                            <SelectContent>
                              {articles.map((article) => (
                                <SelectItem key={article._id} value={article._id}>{article.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên tác giả</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên tác giả" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cơ quan</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên cơ quan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quốc gia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập quốc gia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="orcid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ORCID ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập ORCID ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isCorresponding"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Tác giả liên hệ</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading.updateAuthor}>
                    {loading.updateAuthor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cập nhật
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tác giả này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAuthor}
              disabled={loading.deleteAuthor}
            >
              {loading.deleteAuthor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AuthorManage
