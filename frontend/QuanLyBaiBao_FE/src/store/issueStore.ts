import { create } from "zustand"
import apiService from "../services/api"
import useUIStore from "./uiStore"
import type { Issue } from "../types/issue"
import type { FetchParams } from "../services/api"

interface IssueState {
  issues: Issue[]
  issue: Issue | null
}

interface IssueStore extends IssueState {
  fetchIssues: (params?: FetchParams) => Promise<void>
  fetchIssueById: (id: string) => Promise<void>
  createIssue: (data: Partial<Issue>) => Promise<string | undefined>
  updateIssue: (id: string, data: Partial<Issue>) => Promise<void>
  deleteIssue: (id: string) => Promise<void>
  publishIssue: (id: string) => Promise<void>
  addArticleToIssue: (issueId: string, articleId: string) => Promise<void>
  removeArticleFromIssue: (issueId: string, articleId: string) => Promise<void>
  resetIssue: () => void
}

const useIssueStore = create<IssueStore>((set) => ({
  // Initial state
  issues: [],
  issue: null,

  // Issue operations
  fetchIssues: async (params = {}) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("issues", true)
      setError("issues", null)

      const response = await apiService.get<Issue[]>("/issues", params)

      set({
        issues: response.data,
      })
    } catch (error) {
      console.error("Error fetching issues:", error)
      setError("issues", "Failed to load issues")
      showErrorToast("Failed to load issues")
    } finally {
      setLoading("issues", false)
    }
  },

  fetchIssueById: async (id: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("issue", true)
      setError("issue", null)

      const response = await apiService.get<Issue>(`/issues/${id}`)

      set({
        issue: response.data,
      })
    } catch (error) {
      console.error("Error fetching issue:", error)
      setError("issue", "Failed to load issue details")
      showErrorToast("Failed to load issue details")
    } finally {
      setLoading("issue", false)
    }
  },

  createIssue: async (data: Partial<Issue>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createIssue", true)
      setError("createIssue", null)

      const response = await apiService.post<Issue>("/issues", data)

      set((state) => ({
        issues: [...state.issues, response.data],
      }))

      showSuccessToast("Issue created successfully")
      return response.data._id
    } catch (error) {
      console.error("Error creating issue:", error)
      setError("createIssue", "Failed to create issue")
      showErrorToast("Failed to create issue")
      return undefined
    } finally {
      setLoading("createIssue", false)
    }
  },

  updateIssue: async (id: string, data: Partial<Issue>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("updateIssue", true)
      setError("updateIssue", null)

      const response = await apiService.put<Issue>(`/issues/${id}`, data)

      set((state) => ({
        issues: state.issues.map((issue) => (issue._id === id ? response.data : issue)),
        issue: state.issue?._id === id ? response.data : state.issue,
      }))

      showSuccessToast("Issue updated successfully")
    } catch (error) {
      console.error("Error updating issue:", error)
      setError("updateIssue", "Failed to update issue")
      showErrorToast("Failed to update issue")
    } finally {
      setLoading("updateIssue", false)
    }
  },

  deleteIssue: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("deleteIssue", true)
      setError("deleteIssue", null)

      // Check if issue exists and is published
      const issue = useIssueStore.getState().issues.find(i => i._id === id)
      if (issue?.isPublished) {
        showErrorToast("Cannot delete a published issue")
        return
      }

      await apiService.delete(`/issues/${id}`)

      set((state) => ({
        issues: state.issues.filter((issue) => issue._id !== id),
        issue: state.issue?._id === id ? null : state.issue,
      }))

      showSuccessToast("Issue deleted successfully")
    } catch (error: any) {
      console.error("Error deleting issue:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete issue"
      setError("deleteIssue", errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setLoading("deleteIssue", false)
    }
  },

  publishIssue: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("publishIssue", true)
      setError("publishIssue", null)

      const response = await apiService.put<Issue>(`/issues/${id}/publish`, {})

      set((state) => ({
        issues: state.issues.map((issue) => (issue._id === id ? response.data : issue)),
        issue: state.issue?._id === id ? response.data : state.issue,
      }))

      showSuccessToast("Issue published successfully")
    } catch (error) {
      console.error("Error publishing issue:", error)
      setError("publishIssue", "Failed to publish issue")
      showErrorToast("Failed to publish issue")
    } finally {
      setLoading("publishIssue", false)
    }
  },

  addArticleToIssue: async (issueId: string, articleId: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("addArticleToIssue", true)
      setError("addArticleToIssue", null)

      const response = await apiService.put<Issue>(`/issues/${issueId}/add-article`, { articleId })

      set((state) => ({
        issues: state.issues.map((issue) => (issue._id === issueId ? response.data : issue)),
        issue: state.issue?._id === issueId ? response.data : state.issue,
      }))

      showSuccessToast("Article added to issue successfully")
    } catch (error) {
      console.error("Error adding article to issue:", error)
      setError("addArticleToIssue", "Failed to add article to issue")
      showErrorToast("Failed to add article to issue")
    } finally {
      setLoading("addArticleToIssue", false)
    }
  },

  removeArticleFromIssue: async (issueId: string, articleId: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("removeArticleFromIssue", true)
      setError("removeArticleFromIssue", null)

      const response = await apiService.put<Issue>(`/issues/${issueId}/remove-article`, { articleId })

      set((state) => ({
        issues: state.issues.map((issue) => (issue._id === issueId ? response.data : issue)),
        issue: state.issue?._id === issueId ? response.data : state.issue,
      }))

      showSuccessToast("Article removed from issue successfully")
    } catch (error) {
      console.error("Error removing article from issue:", error)
      setError("removeArticleFromIssue", "Failed to remove article from issue")
      showErrorToast("Failed to remove article from issue")
    } finally {
      setLoading("removeArticleFromIssue", false)
    }
  },

  resetIssue: () => {
    set({ issue: null })
  },
}))

export default useIssueStore