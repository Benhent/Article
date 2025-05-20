import { create } from "zustand"
import apiService from "../services/api"
import useUIStore from "./uiStore"
import type { Field } from "../types/field"

interface FieldState {
  fields: Field[]
  field: Field | null
}

interface FieldStore extends FieldState {
  fetchFields: (params?: { isActive?: boolean; level?: number; parent?: string }) => Promise<void>
  fetchFieldById: (id: string) => Promise<void>
  createField: (data: Partial<Field>) => Promise<string | undefined>
  updateField: (id: string, data: Partial<Field>) => Promise<void>
  deleteField: (id: string) => Promise<void>
  toggleFieldStatus: (id: string) => Promise<void>
  resetField: () => void
}

const useFieldStore = create<FieldStore>((set) => ({
  // Initial state
  fields: [],
  field: null,

  // Field operations
  fetchFields: async (params = {}) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("fields", true)
      setError("fields", null)

      const response = await apiService.get<Field[]>("/fields", params)

      set({
        fields: Array.isArray(response.data) ? response.data : [],
      })
    } catch (error) {
      console.error("Error fetching fields:", error)
      setError("fields", "Failed to load fields")
      showErrorToast("Failed to load fields")
    } finally {
      setLoading("fields", false)
    }
  },

  fetchFieldById: async (id: string) => {
    const { setLoading, setError, showErrorToast } = useUIStore.getState()

    try {
      setLoading("field", true)
      setError("field", null)

      const response = await apiService.get<Field>(`/fields/${id}`)

      set({
        field: response.data,
      })
    } catch (error) {
      console.error("Error fetching field:", error)
      setError("field", "Failed to load field details")
      showErrorToast("Failed to load field details")
    } finally {
      setLoading("field", false)
    }
  },

  createField: async (data: Partial<Field>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("createField", true)
      setError("createField", null)

      const response = await apiService.post<Field>("/fields", data)

      set((state) => ({
        fields: [...state.fields, response.data],
      }))

      showSuccessToast("Field created successfully")
      return response.data._id
    } catch (error) {
      console.error("Error creating field:", error)
      setError("createField", "Failed to create field")
      showErrorToast("Failed to create field")
      return undefined
    } finally {
      setLoading("createField", false)
    }
  },

  updateField: async (id: string, data: Partial<Field>) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("updateField", true)
      setError("updateField", null)

      const response = await apiService.put<Field>(`/fields/${id}`, data)

      set((state) => ({
        fields: state.fields.map((field) => (field._id === id ? response.data : field)),
        field: state.field?._id === id ? response.data : state.field,
      }))

      showSuccessToast("Field updated successfully")
    } catch (error) {
      console.error("Error updating field:", error)
      setError("updateField", "Failed to update field")
      showErrorToast("Failed to update field")
    } finally {
      setLoading("updateField", false)
    }
  },

  deleteField: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("deleteField", true)
      setError("deleteField", null)

      await apiService.delete(`/fields/${id}`)

      set((state) => ({
        fields: state.fields.filter((field) => field._id !== id),
        field: state.field?._id === id ? null : state.field,
      }))

      showSuccessToast("Field deleted successfully")
    } catch (error) {
      console.error("Error deleting field:", error)
      setError("deleteField", "Failed to delete field")
      showErrorToast("Failed to delete field")
    } finally {
      setLoading("deleteField", false)
    }
  },

  toggleFieldStatus: async (id: string) => {
    const { setLoading, setError, showSuccessToast, showErrorToast } = useUIStore.getState()

    try {
      setLoading("toggleFieldStatus", true)
      setError("toggleFieldStatus", null)

      const response = await apiService.patch<Field>(`/fields/${id}/toggle-status`, {})

      set((state) => ({
        fields: state.fields.map((field) => (field._id === id ? response.data : field)),
        field: state.field?._id === id ? response.data : state.field,
      }))

      showSuccessToast(`Field ${response.data.isActive ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Error toggling field status:", error)
      setError("toggleFieldStatus", "Failed to toggle field status")
      showErrorToast("Failed to toggle field status")
    } finally {
      setLoading("toggleFieldStatus", false)
    }
  },

  resetField: () => {
    set({ field: null })
  },
}))

export default useFieldStore