import { create } from "zustand"
import apiService from "../services/api"
import useUIStore from "./uiStore"
import type { Discussion } from "../types/discussion"

interface DiscussionState {
  discussions: Discussion[]
  discussion: Discussion | null
}

interface DiscussionStore extends DiscussionState {
  fetchDiscussions: (articleId: string) => Promise<void>
  fetchDiscussionById: (id: string) => Promise<void>
  createDiscussion: (data: { 
    articleId: string; 
    subject: string; 
    type?: string;
    participants?: string[];
  }) => Promise<string | undefined>
  updateDiscussion: (id: string, data: { subject?: string; type?: string; isActive?: boolean }) => Promise<void>
  deleteDiscussion: (id: string) => Promise<void>
  addMessage: (discussionId: string, data: { content: string; attachments?: string[] }) => Promise<void>
  markMessagesAsRead: (discussionId: string) => Promise<void>
  addParticipant: (discussionId: string, userId: string) => Promise<void>
  removeParticipant: (discussionId: string, userId: string) => Promise<void>
  resetDiscussion: () => void
}

const useDiscussionStore = create<DiscussionStore>((set) => ({
  // Initial state
  discussions: [],
  discussion: null,

  // Discussion operations
  fetchDiscussions: async (articleId: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("discussions", true)
      setError("discussions", null)

      // If articleId is 'all', fetch all discussions
      const endpoint = articleId === 'all' ? '/discussions' : `/discussions/article/${articleId}`
      const response = await apiService.get<Discussion[]>(endpoint)

      set({
        discussions: response.data,
      })
    } catch (error) {
      console.error("Error fetching discussions:", error)
      setError("discussions", "Failed to load discussions")
      showErrorToast("Failed to load discussions")
    } finally {
      setLoading("discussions", false)
    }
  },

  fetchDiscussionById: async (id: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("discussion", true)
      setError("discussion", null)

      const response = await apiService.get<Discussion>(`/discussions/${id}`)

      set({
        discussion: response.data,
      })
    } catch (error) {
      console.error("Error fetching discussion:", error)
      setError("discussion", "Failed to load discussion details")
      showErrorToast("Failed to load discussion details")
    } finally {
      setLoading("discussion", false)
    }
  },

  createDiscussion: async (data: { 
    articleId: string; 
    subject: string; 
    type?: string;
    participants?: string[];
  }) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createDiscussion", true)
      setError("createDiscussion", null)

      const response = await apiService.post<Discussion>("/discussions", data)

      set((state) => ({
        discussions: [...state.discussions, response.data],
      }))

      showSuccessToast("Discussion created successfully")
      return response.data._id
    } catch (error) {
      console.error("Error creating discussion:", error)
      setError("createDiscussion", "Failed to create discussion")
      showErrorToast("Failed to create discussion")
      return undefined
    } finally {
      setLoading("createDiscussion", false)
    }
  },

  updateDiscussion: async (id: string, data: { subject?: string; type?: string; isActive?: boolean }) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("updateDiscussion", true)
      setError("updateDiscussion", null)

      const updateResponse = await apiService.put<Discussion>(`/discussions/${id}`, data)

      set((state) => ({
        discussions: state.discussions.map((discussion) => (discussion._id === id ? updateResponse.data : discussion)),
        discussion: state.discussion?._id === id ? updateResponse.data : state.discussion,
      }))

      showSuccessToast("Discussion updated successfully")
    } catch (error) {
      console.error("Error updating discussion:", error)
      setError("updateDiscussion", "Failed to update discussion")
      showErrorToast("Failed to update discussion")
    } finally {
      setLoading("updateDiscussion", false)
    }
  },

  deleteDiscussion: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("deleteDiscussion", true)
      setError("deleteDiscussion", null)

      await apiService.delete(`/discussions/${id}`)

      set((state) => ({
        discussions: state.discussions.filter((discussion) => discussion._id !== id),
        discussion: state.discussion?._id === id ? null : state.discussion,
      }))

      showSuccessToast("Discussion deleted successfully")
    } catch (error) {
      console.error("Error deleting discussion:", error)
      setError("deleteDiscussion", "Failed to delete discussion")
      showErrorToast("Failed to delete discussion")
    } finally {
      setLoading("deleteDiscussion", false)
    }
  },

  addMessage: async (discussionId: string, data: { content: string; attachments?: string[] }) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("addMessage", true)
      setError("addMessage", null)

      const response = await apiService.post<Discussion>(`/discussions/${discussionId}/messages`, data)

      set((state) => ({
        discussions: state.discussions.map((discussion) =>
          discussion._id === discussionId ? response.data : discussion,
        ),
        discussion: state.discussion?._id === discussionId ? response.data : state.discussion,
      }))

      showSuccessToast("Message added successfully")
    } catch (error) {
      console.error("Error adding message:", error)
      setError("addMessage", "Failed to add message")
      showErrorToast("Failed to add message")
    } finally {
      setLoading("addMessage", false)
    }
  },

  markMessagesAsRead: async (discussionId: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("markMessagesAsRead", true)
      setError("markMessagesAsRead", null)

      const response = await apiService.put<Discussion>(`/discussions/${discussionId}/mark-read`, {})

      set((state) => ({
        discussions: state.discussions.map((discussion) =>
          discussion._id === discussionId ? response.data : discussion,
        ),
        discussion: state.discussion?._id === discussionId ? response.data : state.discussion,
      }))
    } catch (error) {
      console.error("Error marking messages as read:", error)
      setError("markMessagesAsRead", "Failed to mark messages as read")
      showErrorToast("Failed to mark messages as read")
    } finally {
      setLoading("markMessagesAsRead", false)
    }
  },

  addParticipant: async (discussionId: string, userId: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("addParticipant", true)
      setError("addParticipant", null)

      const response = await apiService.put<Discussion>(`/discussions/${discussionId}/participants`, { userId })

      set((state) => ({
        discussions: state.discussions.map((discussion) =>
          discussion._id === discussionId ? response.data : discussion,
        ),
        discussion: state.discussion?._id === discussionId ? response.data : state.discussion,
      }))

      showSuccessToast("Participant added successfully")
    } catch (error) {
      console.error("Error adding participant:", error)
      setError("addParticipant", "Failed to add participant")
      showErrorToast("Failed to add participant")
    } finally {
      setLoading("addParticipant", false)
    }
  },

  removeParticipant: async (discussionId: string, userId: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("removeParticipant", true)
      setError("removeParticipant", null)

      const response = await apiService.delete<Discussion>(`/discussions/${discussionId}/participants/${userId}`)

      set((state) => ({
        discussions: state.discussions.map((discussion) =>
          discussion._id === discussionId ? response.data : discussion,
        ),
        discussion: state.discussion?._id === discussionId ? response.data : state.discussion,
      }))

      showSuccessToast("Participant removed successfully")
    } catch (error) {
      console.error("Error removing participant:", error)
      setError("removeParticipant", "Failed to remove participant")
      showErrorToast("Failed to remove participant")
    } finally {
      setLoading("removeParticipant", false)
    }
  },

  resetDiscussion: () => {
    set({ discussion: null })
  },
}))

export default useDiscussionStore