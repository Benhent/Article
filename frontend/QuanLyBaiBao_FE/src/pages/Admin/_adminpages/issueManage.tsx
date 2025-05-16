import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useIssueStore } from "../../../store/rootStore"
import type { Issue } from "../../../types/article"
import { toast } from "react-hot-toast"

import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Checkbox } from "../../../components/ui/checkbox"

const IssueManage = () => {
  const { issues, fetchIssues, createIssue, updateIssue, deleteIssue } = useIssueStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [formData, setFormData] = useState<Partial<Issue>>({
    title: "",
    volumeNumber: 1,
    issueNumber: 1,
    publicationDate: new Date().toISOString().split("T")[0],
    isPublished: false,
  })

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const handleOpenDialog = (issue?: Issue) => {
    if (issue) {
      setSelectedIssue(issue)
      setFormData({
        title: issue.title,
        volumeNumber: issue.volumeNumber,
        issueNumber: issue.issueNumber,
        publicationDate: issue.publicationDate.split("T")[0],
        isPublished: issue.isPublished,
      })
    } else {
      setSelectedIssue(null)
      setFormData({
        title: "",
        volumeNumber: 1,
        issueNumber: 1,
        publicationDate: new Date().toISOString().split("T")[0],
        isPublished: false,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedIssue(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedIssue) {
        await updateIssue(selectedIssue._id, formData)
        toast.success("Issue updated successfully")
      } else {
        await createIssue(formData)
        toast.success("Issue created successfully")
      }
      handleCloseDialog()
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async () => {
    if (!selectedIssue) return
    try {
      await deleteIssue(selectedIssue._id)
      toast.success("Issue deleted successfully")
      setOpenDeleteDialog(false)
    } catch (error) {
      toast.error("An error occurred while deleting the issue")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Issue Management</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Issue
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Volume</th>
                <th className="text-left py-3 px-4">Issue</th>
                <th className="text-left py-3 px-4">Publication Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id} className="border-b">
                  <td className="py-3 px-4">{issue.title}</td>
                  <td className="py-3 px-4">{issue.volumeNumber}</td>
                  <td className="py-3 px-4">{issue.issueNumber}</td>
                  <td className="py-3 px-4">
                    {new Date(issue.publicationDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {issue.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(issue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedIssue(issue)
                          setOpenDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIssue ? "Edit Issue" : "Create New Issue"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volumeNumber">Volume Number</Label>
                <Input
                  id="volumeNumber"
                  name="volumeNumber"
                  type="number"
                  value={formData.volumeNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueNumber">Issue Number</Label>
                <Input
                  id="issueNumber"
                  name="issueNumber"
                  type="number"
                  value={formData.issueNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicationDate">Publication Date</Label>
              <Input
                id="publicationDate"
                name="publicationDate"
                type="date"
                value={formData.publicationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublished: checked as boolean }))
                }
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedIssue ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the issue
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default IssueManage
