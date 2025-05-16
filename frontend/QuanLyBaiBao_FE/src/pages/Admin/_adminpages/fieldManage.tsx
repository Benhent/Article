import { useEffect, useState } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import {
  Card, CardContent, CardHeader, CardTitle
} from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../../../components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "../../../components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "../../../components/ui/form"
import { Badge } from "../../../components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Loader2, Plus, Pencil, Trash2, CheckCircle2, Ban, ChevronLeft, ChevronRight } from "lucide-react"
import useFieldStore from "../../../store/fieldStore"
import type { Field } from "../../../types/article"

interface FieldFormData {
  name: string
  code: string
  parent?: string
  level: number
  isActive: boolean
}

const FieldManage = () => {
  const { fields, fetchFields, createField, updateField, deleteField, toggleFieldStatus } = useFieldStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState<'name' | 'level'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredFields = fields.filter((field) => {
    const matchSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' ? true : (statusFilter === 'active' ? field.isActive : !field.isActive)
    return matchSearch && matchStatus
  })

  const sortedFields = [...filteredFields].sort((a, b) => {
    let aValue: any = a[sortBy]
    let bValue: any = b[sortBy]
    if (sortBy === 'name') {
      aValue = aValue?.toLowerCase?.() || ''
      bValue = bValue?.toLowerCase?.() || ''
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const total = sortedFields.length
  const totalPages = Math.ceil(total / limit) || 1
  const canPrev = page > 1
  const canNext = page < totalPages
  const pagedFields = sortedFields.slice((page - 1) * limit, page * limit)

  const addForm = useForm<FieldFormData>({
    defaultValues: {
      name: "",
      code: "",
      parent: "",
      level: 1,
      isActive: true,
    }
  })
  const editForm = useForm<FieldFormData>({
    defaultValues: {
      name: "",
      code: "",
      parent: "",
      level: 1,
      isActive: true,
    }
  })

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (selectedField) {
      editForm.reset({
        name: selectedField.name,
        code: selectedField.code,
        parent: typeof selectedField.parent === "string" ? selectedField.parent : selectedField.parent?._id || "",
        level: selectedField.level,
        isActive: selectedField.isActive,
      })
    }
  }, [selectedField, editForm])

  const handleAddField = async (data: FieldFormData) => {
    await createField(data)
    setIsAddDialogOpen(false)
    addForm.reset()
  }

  const handleEditField = async (data: FieldFormData) => {
    if (!selectedField?._id) return
    const submitData = { ...data }
    if (!submitData.parent) delete submitData.parent
    await updateField(selectedField._id, submitData)
    setIsEditDialogOpen(false)
    editForm.reset()
  }

  const handleDeleteField = async () => {
    if (!selectedField?._id) return
    await deleteField(selectedField._id)
    setIsDeleteDialogOpen(false)
  }

  const handleToggleStatus = async (id: string) => {
    await toggleFieldStatus(id)
  }

  const handleParentChange = (form: UseFormReturn<FieldFormData>, parentId: string) => {
    if (!parentId || parentId === "none" || parentId === "") {
      form.setValue("level", 1)
      form.setValue("parent", "")
    } else {
      const parentField = fields.find(f => f._id === parentId)
      form.setValue("level", (parentField?.level || 1) + 1)
      form.setValue("parent", parentId)
    }
  }

  return (
    <div className="w-full p-4 md:p-6 pt-20">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-center w-full">Quản lý lĩnh vực</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Thêm lĩnh vực
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm lĩnh vực mới</DialogTitle>
                <DialogDescription>Điền thông tin lĩnh vực vào form bên dưới</DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddField)}>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên lĩnh vực</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tên lĩnh vực" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã lĩnh vực</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã lĩnh vực" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="parent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lĩnh vực cha</FormLabel>
                          <FormControl>
                            <Select value={field.value || 'none'} onValueChange={val => handleParentChange(addForm, val)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn lĩnh vực cha (nếu có)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Không có</SelectItem>
                                {fields.filter(f => f._id !== undefined).map((f) => (
                                  <SelectItem key={f._id} value={f._id!}>{f.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      Thêm lĩnh vực
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
              <Input
                placeholder="Tìm kiếm lĩnh vực..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={val => setStatusFilter(val as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead
                    className="w-1/4 cursor-pointer select-none"
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      else {
                        setSortBy('name')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    Tên lĩnh vực {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableHead>
                  <TableHead className="w-1/6">Mã</TableHead>
                  <TableHead className="w-1/4">Lĩnh vực cha</TableHead>
                  <TableHead
                    className="w-1/12 text-center cursor-pointer select-none"
                    onClick={() => {
                      if (sortBy === 'level') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      else {
                        setSortBy('level')
                        setSortOrder('asc')
                      }
                    }}
                  >
                    Cấp {sortBy === 'level' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableHead>
                  <TableHead className="w-1/6 text-center">Trạng thái</TableHead>
                  <TableHead className="w-1/12 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedFields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Không tìm thấy lĩnh vực nào
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedFields.map((field) => (
                    <TableRow key={field._id} className="hover:bg-accent/40 transition-colors">
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>{field.code}</TableCell>
                      <TableCell>{typeof field.parent === "string" ? fields.find(f => f._id === field.parent)?.name : field.parent?.name || "-"}</TableCell>
                      <TableCell className="text-center">{field.level}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={field.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => handleToggleStatus(field._id!)}>
                          {field.isActive ? <><CheckCircle2 className="inline h-4 w-4 mr-1 text-green-500" /> Hoạt động</> : <><Ban className="inline h-4 w-4 mr-1 text-red-500" /> Không hoạt động</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedField(field)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedField(field)
                              setIsDeleteDialogOpen(true)
                            }}
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
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button variant="outline" size="icon" disabled={!canPrev} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="mx-2">Trang {page} / {totalPages}</span>
            <Button variant="outline" size="icon" disabled={!canNext} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Field Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lĩnh vực</DialogTitle>
            <DialogDescription>Cập nhật thông tin lĩnh vực</DialogDescription>
          </DialogHeader>
          {selectedField && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditField)}>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên lĩnh vực</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên lĩnh vực" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã lĩnh vực</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập mã lĩnh vực" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="parent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lĩnh vực cha</FormLabel>
                        <FormControl>
                          <Select value={field.value || 'none'} onValueChange={val => handleParentChange(editForm, val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn lĩnh vực cha (nếu có)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Không có</SelectItem>
                              {fields.filter(f => f._id !== selectedField._id).map((f) => (
                                <SelectItem key={f._id} value={f._id!}>{f.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
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
              Bạn có chắc chắn muốn xóa lĩnh vực này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteField}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FieldManage
