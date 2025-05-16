import { create } from "zustand"
import apiService from "../services/api"
import useUIStore from "./uiStore"
import type { ArticleAuthor } from "../types/article"

interface AuthorState {
  authors: ArticleAuthor[]
  loading: {
    authors: boolean
    createAuthor: boolean
    updateAuthor: boolean
    deleteAuthor: boolean
  }
  error: {
    authors: string | null
    createAuthor: string | null
    updateAuthor: string | null
    deleteAuthor: string | null
  }
}

interface AuthorStore extends AuthorState {
  fetchArticleAuthors: (articleId: string) => Promise<void>
  fetchAllAuthors: (params?: { hasAccount?: boolean; isCorresponding?: boolean }) => Promise<void>
  fetchAuthorById: (id: string) => Promise<ArticleAuthor | null>
  createArticleAuthor: (data: Partial<ArticleAuthor>) => Promise<void>
  updateArticleAuthor: (id: string, data: Partial<ArticleAuthor>) => Promise<void>
  deleteArticleAuthor: (id: string) => Promise<void>
  resetState: () => void
}

const initialState: AuthorState = {
  authors: [],
  loading: {
    authors: false,
    createAuthor: false,
    updateAuthor: false,
    deleteAuthor: false,
  },
  error: {
    authors: null,
    createAuthor: null,
    updateAuthor: null,
    deleteAuthor: null,
  },
}

const useAuthorStore = create<AuthorStore>((set, get) => ({
  ...initialState,

  fetchArticleAuthors: async (articleId: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("authors", true)
      setError("authors", null)

      const response = await apiService.get<ArticleAuthor[]>(`/article-authors/${articleId}/authors`)

      set({
        authors: response.data,
      })
    } catch (error) {
      console.error("Error fetching article authors:", error)
      setError("authors", "Failed to load article authors")
      showErrorToast("Failed to load article authors")
    } finally {
      setLoading("authors", false)
    }
  },

  fetchAllAuthors: async (params?: { hasAccount?: boolean; isCorresponding?: boolean }) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("authors", true)
      setError("authors", null)

      const response = await apiService.get<ArticleAuthor[]>("/article-authors", params)

      set({
        authors: response.data,
      })
    } catch (error) {
      console.error("Error fetching all authors:", error)
      setError("authors", "Failed to load authors")
      showErrorToast("Failed to load authors")
    } finally {
      setLoading("authors", false)
    }
  },

  fetchAuthorById: async (id: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("authors", true)
      setError("authors", null)

      const response = await apiService.get<ArticleAuthor>(`/article-authors/${id}`)

      return response.data
    } catch (error) {
      console.error("Error fetching author:", error)
      setError("authors", "Failed to load author")
      showErrorToast("Failed to load author")
      return null
    } finally {
      setLoading("authors", false)
    }
  },

  createArticleAuthor: async (data: Partial<ArticleAuthor>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createAuthor", true)
      setError("createAuthor", null)

      const response = await apiService.post<ArticleAuthor>("/article-authors", data)

      set((state) => ({
        authors: [...state.authors, response.data],
      }))

      showSuccessToast("Author added successfully")
    } catch (error) {
      console.error("Error creating article author:", error)
      setError("createAuthor", "Failed to add author")
      showErrorToast("Failed to add author")
    } finally {
      setLoading("createAuthor", false)
    }
  },

  updateArticleAuthor: async (id: string, data: Partial<ArticleAuthor>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("updateAuthor", true)
      setError("updateAuthor", null)

      const response = await apiService.put<ArticleAuthor>(`/article-authors/${id}`, data)

      set((state) => ({
        authors: state.authors.map((author) => (author._id === id ? response.data : author)),
      }))

      showSuccessToast("Author updated successfully")
    } catch (error) {
      console.error("Error updating article author:", error)
      setError("updateAuthor", "Failed to update author")
      showErrorToast("Failed to update author")
    } finally {
      setLoading("updateAuthor", false)
    }
  },

  deleteArticleAuthor: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("deleteAuthor", true)
      setError("deleteAuthor", null)

      await apiService.delete(`/article-authors/${id}`)

      set((state) => ({
        authors: state.authors.filter((author) => author._id !== id),
      }))

      showSuccessToast("Author removed successfully")
    } catch (error) {
      console.error("Error deleting article author:", error)
      setError("deleteAuthor", "Failed to remove author")
      showErrorToast("Failed to remove author")
    } finally {
      setLoading("deleteAuthor", false)
    }
  },

  resetState: () => {
    set(initialState)
  },
}))

export default useAuthorStore