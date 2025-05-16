import { create } from "zustand"
import { toast } from "react-hot-toast"

interface LoadingState {
  [key: string]: boolean
}

interface ErrorState {
  [key: string]: string | null
}

interface UIStore {
  // Loading states
  loading: LoadingState
  setLoading: (key: string, isLoading: boolean) => void

  // Error states
  errors: ErrorState
  setError: (key: string, error: string | null) => void
  clearError: (key: string) => void
  clearAllErrors: () => void

  // Toast notifications
  showSuccessToast: (message: string) => void
  showErrorToast: (message: string) => void
  showInfoToast: (message: string) => void
}

const useUIStore = create<UIStore>((set) => ({
  // Loading states
  loading: {},
  setLoading: (key, isLoading) =>
    set((state) => ({
      loading: { ...state.loading, [key]: isLoading },
    })),

  // Error states
  errors: {},
  setError: (key, error) =>
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    })),
  clearError: (key) =>
    set((state) => ({
      errors: { ...state.errors, [key]: null },
    })),
  clearAllErrors: () => set({ errors: {} }),

  // Toast notifications
  showSuccessToast: (message) => {
    toast.success(message)
  },
  showErrorToast: (message) => {
    toast.error(message)
  },
  showInfoToast: (message) => {
    toast(message)
  },
}))

export default useUIStore