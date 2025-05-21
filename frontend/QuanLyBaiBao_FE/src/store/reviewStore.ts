import { create } from "zustand"
import apiService from "../services/api"
import useUIStore from "./uiStore"
import type { Review } from "../types/review"

interface ReviewState {
  reviews: Review[]
  review: Review | null
  currentReview: Review | null
  loading: boolean
}

interface ReviewStore extends ReviewState {
  fetchReviews: (params?: { articleId?: string; reviewerId?: string; status?: string }) => Promise<void>
  fetchReviewById: (id: string) => Promise<void>
  createReview: (data: Partial<Review>) => Promise<void>
  createMultipleReviews: (
    articleId: string,
    reviewers: { reviewerId: string; responseDeadline: string; reviewDeadline: string }[],
  ) => Promise<void>
  updateReview: (id: string, data: Partial<Review>) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  acceptReview: (id: string) => Promise<void>
  declineReview: (id: string, declineReason: string) => Promise<void>
  completeReview: (
    id: string,
    data: { 
      recommendation: string; 
      comments: {
        forAuthor: string;
        forEditor?: string;
      }
    },
  ) => Promise<void>
  sendReminder: (id: string) => Promise<void>
  resetReview: () => void
}

const useReviewStore = create<ReviewStore>((set, get) => ({
  // Initial state
  reviews: [],
  review: null,
  currentReview: null,
  loading: false,

  // Review operations
  fetchReviews: async (params = {}) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("reviews", true)
      setError("reviews", null)

      const response = await apiService.get<Review[]>("/reviews", params)

      set({
        reviews: response.data,
      })
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setError("reviews", "Failed to load reviews")
      showErrorToast("Failed to load reviews")
    } finally {
      setLoading("reviews", false)
    }
  },

  fetchReviewById: async (id: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("review", true)
      setError("review", null)

      const response = await apiService.get<Review>(`/reviews/${id}`)

      set({
        currentReview: response.data,
      })
    } catch (error) {
      console.error("Error fetching review:", error)
      setError("review", "Failed to load review details")
      showErrorToast("Failed to load review details")
    } finally {
      setLoading("review", false)
    }
  },

  createReview: async (data: Partial<Review>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createReview", true)
      setError("createReview", null)

      const response = await apiService.post<Review>("/reviews", data)

      set((state) => ({
        reviews: [...state.reviews, response.data]
      }))

      showSuccessToast("Review invitation sent successfully")
    } catch (error) {
      console.error("Error creating review:", error)
      setError("createReview", "Failed to send review invitation")
      showErrorToast("Failed to send review invitation")
    } finally {
      setLoading("createReview", false)
    }
  },

  createMultipleReviews: async (
    articleId: string,
    reviewers: { reviewerId: string; responseDeadline: string; reviewDeadline: string }[],
  ) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createMultipleReviews", true)
      setError("createMultipleReviews", null)

      const response = await apiService.post<Review[]>("/reviews/multiple", { articleId, reviewers })

      set((state) => ({
        reviews: [...state.reviews, ...response.data]
      }))

      showSuccessToast(`${response.data.length} review invitations sent successfully`)
    } catch (error) {
      console.error("Error creating multiple reviews:", error)
      setError("createMultipleReviews", "Failed to send review invitations")
      showErrorToast("Failed to send review invitations")
    } finally {
      setLoading("createMultipleReviews", false)
    }
  },

  updateReview: async (id: string, data: Partial<Review>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("updateReview", true)
      setError("updateReview", null)

      await apiService.put<Review>(`/reviews/${id}`, data)

      get().fetchReviews()

      if (get().currentReview?._id === id) {
        get().fetchReviewById(id)
      }

      showSuccessToast("Review updated successfully")
    } catch (error) {
      console.error("Error updating review:", error)
      setError("updateReview", "Failed to update review")
      showErrorToast("Failed to update review")
    } finally {
      setLoading("updateReview", false)
    }
  },

  deleteReview: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("deleteReview", true)
      setError("deleteReview", null)

      await apiService.delete(`/reviews/${id}`)

      get().fetchReviews()

      showSuccessToast("Review deleted successfully")
    } catch (error) {
      console.error("Error deleting review:", error)
      setError("deleteReview", "Failed to delete review")
      showErrorToast("Failed to delete review")
    } finally {
      setLoading("deleteReview", false)
    }
  },

  acceptReview: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("acceptReview", true)
      setError("acceptReview", null)

      const response = await apiService.post<Review>(`/reviews/${id}/accept`, {})

      set((state) => ({
        reviews: state.reviews.map((review) => (review._id === id ? response.data : review)),
        review: state.review?._id === id ? response.data : state.review,
      }))

      showSuccessToast("Review accepted successfully")
    } catch (error) {
      console.error("Error accepting review:", error)
      setError("acceptReview", "Failed to accept review")
      showErrorToast("Failed to accept review")
    } finally {
      setLoading("acceptReview", false)
    }
  },

  declineReview: async (id: string, declineReason: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("declineReview", true)
      setError("declineReview", null)

      const response = await apiService.post<Review>(`/reviews/${id}/decline`, { declineReason })

      set((state) => ({
        reviews: state.reviews.map((review) => (review._id === id ? response.data : review)),
        review: state.review?._id === id ? response.data : state.review,
      }))

      showSuccessToast("Review declined successfully")
    } catch (error) {
      console.error("Error declining review:", error)
      setError("declineReview", "Failed to decline review")
      showErrorToast("Failed to decline review")
    } finally {
      setLoading("declineReview", false)
    }
  },

  completeReview: async (
    id: string,
    data: { 
      recommendation: string; 
      comments: {
        forAuthor: string;
        forEditor?: string;
      }
    },
  ) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("completeReview", true)
      setError("completeReview", null)

      const response = await apiService.post<Review>(`/reviews/${id}/complete`, data)

      set((state) => ({
        reviews: state.reviews.map((review) => (review._id === id ? response.data : review)),
        review: state.review?._id === id ? response.data : state.review,
      }))

      showSuccessToast("Review completed successfully")
    } catch (error) {
      console.error("Error completing review:", error)
      setError("completeReview", "Failed to complete review")
      showErrorToast("Failed to complete review")
    } finally {
      setLoading("completeReview", false)
    }
  },

  sendReminder: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("sendReminder", true)
      setError("sendReminder", null)

      const response = await apiService.post<Review>(`/reviews/${id}/reminder`, {})

      set((state) => ({
        reviews: state.reviews.map((review) => (review._id === id ? response.data : review)),
        review: state.review?._id === id ? response.data : state.review,
      }))

      showSuccessToast("Reminder sent successfully")
    } catch (error) {
      console.error("Error sending reminder:", error)
      setError("sendReminder", "Failed to send reminder")
      showErrorToast("Failed to send reminder")
    } finally {
      setLoading("sendReminder", false)
    }
  },

  resetReview: () => {
    set({ review: null, currentReview: null })
  },
}))

export default useReviewStore