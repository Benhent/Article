import { create } from "zustand"
import apiService from "../services/api"
import useUIStore from "./uiStore"
import type { Article, ArticleFile } from "../types/article"
import type { Pagination, FetchParams } from "../services/api"

interface ArticleState {
  articles: Article[]
  article: Article | null
  pagination: Pagination
  stats: Record<string, number>
  loading: Record<string, boolean>
  error: Record<string, string | null>
}

interface ArticleStore extends ArticleState {
  // Article CRUD operations
  fetchArticles: (params?: FetchParams) => Promise<void>
  fetchArticleById: (id: string) => Promise<void>
  fetchArticleStats: () => Promise<void>
  createArticle: (data: Partial<Article>) => Promise<string | undefined>
  updateArticle: (id: string, data: Partial<Article>) => Promise<void>
  deleteArticle: (id: string) => Promise<void>

  // Article status operations
  changeArticleStatus: (id: string, status: string, reason: string) => Promise<void>
  assignEditor: (id: string, editorId: string) => Promise<void>
  publishArticle: (
    id: string,
    data: { doi?: string; issueId?: string; pageStart?: number; pageEnd?: number },
  ) => Promise<void>

  // File operations
  uploadFile: (file: File, articleId: string) => Promise<void>

  // Utility functions
  resetArticle: () => void
}

const useArticleStore = create<ArticleStore>((set) => ({
  // Initial state
  articles: [],
  article: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  stats: {},
  loading: {},
  error: {},

  // Article CRUD operations
  fetchArticles: async (params = {}) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()
    try {
      setLoading("articles", true)
      setError("articles", null)

      const response = await apiService.get<Article[]>("/articles", params)

      set({
        articles: response.data,
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      })
    } catch (error) {
      console.error("Error fetching articles:", error)
      setError("articles", "Failed to load articles")
      showErrorToast("Failed to load articles")
    } finally {
      setLoading("articles", false)
    }
  },

  fetchArticleById: async (id: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("article", true)
      setError("article", null)

      const response = await apiService.get<Article>(`/articles/${id}`)

      set({
        article: response.data,
      })
    } catch (error) {
      console.error("Error fetching article:", error)
      setError("article", "Failed to load article details")
      showErrorToast("Failed to load article details")
    } finally {
      setLoading("article", false)
    }
  },

  fetchArticleStats: async () => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("articleStats", true)
      setError("articleStats", null)

      const response = await apiService.get<Record<string, number>>("/articles/stats")

      set({
        stats: response.data,
      })
    } catch (error) {
      console.error("Error fetching article stats:", error)
      setError("articleStats", "Failed to load article statistics")
      showErrorToast("Failed to load article statistics")
    } finally {
      setLoading("articleStats", false)
    }
  },

  createArticle: async (data: Partial<Article>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createArticle", true)
      setError("createArticle", null)
      
      const response = await apiService.post<Article>("/articles", data)
      
      if (response.data && response.data._id) {
        return response.data._id
      }
      
      throw new Error("Không nhận được ID bài báo từ server")
    } catch (error: any) {
      console.error("Error creating article:", error)
      
      // Xử lý lỗi cụ thể
      if (error.response) {
        const errorMessage = error.response.data?.message || "Lỗi khi tạo bài báo"
        setError("createArticle", errorMessage)
        throw new Error(errorMessage)
      }
      
      setError("createArticle", "Failed to create article")
      throw error
    } finally {
      setLoading("createArticle", false)
    }
  },

  updateArticle: async (id: string, data: Partial<Article>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("updateArticle", true)
      setError("updateArticle", null)

      const response = await apiService.put<Article>(`/articles/${id}/update`, data)

      set((state) => ({
        articles: state.articles.map((article) => (article._id === id ? response.data : article)),
        article: state.article?._id === id ? response.data : state.article,
      }))

      showSuccessToast("Article updated successfully")
    } catch (error) {
      console.error("Error updating article:", error)
      setError("updateArticle", "Failed to update article")
      showErrorToast("Failed to update article")
    } finally {
      setLoading("updateArticle", false)
    }
  },

  deleteArticle: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("deleteArticle", true)
      setError("deleteArticle", null)

      await apiService.delete(`/articles/${id}`)

      set((state) => ({
        articles: state.articles.filter((article) => article._id !== id),
        article: state.article?._id === id ? null : state.article,
      }))

      showSuccessToast("Article deleted successfully")
    } catch (error) {
      console.error("Error deleting article:", error)
      setError("deleteArticle", "Failed to delete article")
      showErrorToast("Failed to delete article")
    } finally {
      setLoading("deleteArticle", false)
    }
  },

  changeArticleStatus: async (id: string, status: string, reason: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("changeStatus", true)
      setError("changeStatus", null)

      const response = await apiService.patch<Article>(`/articles/${id}/status`, { status, reason })

      set((state) => ({
        articles: state.articles.map((article) => (article._id === id ? response.data : article)),
        article: state.article?._id === id ? response.data : state.article,
      }))

      showSuccessToast(`Article status changed to ${status}`)
    } catch (error) {
      console.error("Error changing article status:", error)
      setError("changeStatus", "Failed to change article status")
      showErrorToast("Failed to change article status")
    } finally {
      setLoading("changeStatus", false)
    }
  },

  assignEditor: async (id: string, editorId: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("assignEditor", true)
      setError("assignEditor", null)

      const response = await apiService.put<Article>(`/articles/${id}/assign-editor`, { editorId })

      set((state) => ({
        articles: state.articles.map((article) => (article._id === id ? response.data : article)),
        article: state.article?._id === id ? response.data : state.article,
      }))

      showSuccessToast("Editor assigned successfully")
    } catch (error) {
      console.error("Error assigning editor:", error)
      setError("assignEditor", "Failed to assign editor")
      showErrorToast("Failed to assign editor")
    } finally {
      setLoading("assignEditor", false)
    }
  },

  publishArticle: async (
    id: string,
    data: { doi?: string; issueId?: string; pageStart?: number; pageEnd?: number },
  ) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("publishArticle", true)
      setError("publishArticle", null)

      const response = await apiService.put<Article>(`/articles/${id}/publish`, data)

      set((state) => ({
        articles: state.articles.map((article) => (article._id === id ? response.data : article)),
        article: state.article?._id === id ? response.data : state.article,
      }))

      showSuccessToast("Article published successfully")
    } catch (error) {
      console.error("Error publishing article:", error)
      setError("publishArticle", "Failed to publish article")
      showErrorToast("Failed to publish article")
    } finally {
      setLoading("publishArticle", false)
    }
  },

  // File operations
  uploadFile: async (file: File, articleId: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("uploadFile", true)
      setError("uploadFile", null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await apiService.post<ArticleFile>(`/articles/${articleId}/files`, formData)

      set((state) => ({
        article: state.article?._id === articleId 
          ? { ...state.article, articleFile: response.data }
          : state.article
      }))

      showSuccessToast("File uploaded successfully")
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("uploadFile", "Failed to upload file")
      showErrorToast("Failed to upload file")
    } finally {
      setLoading("uploadFile", false)
    }
  },

  // Utility functions
  resetArticle: () => {
    set({ article: null })
  },
}))

export default useArticleStore