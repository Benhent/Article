import axios, { type AxiosInstance, type AxiosResponse } from "axios"
import { toast } from "react-hot-toast"

// Define API response interface
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  pagination?: Pagination
  count?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface FetchParams {
  page?: number
  limit?: number
  status?: string
  field?: string
  submitterId?: string
  editorId?: string
  search?: string
  hasAccount?: boolean
  isCorresponding?: boolean
  isPublished?: boolean
  [key: string]: any
}

class ApiService {
  private client: AxiosInstance
  private static instance: ApiService

  private constructor() {
    this.client = axios.create({
      baseURL: "/api",
      timeout: 30000,
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.")
          localStorage.removeItem("token")
          window.location.href = "/login"
        }

        // Handle server errors
        if (error.response?.status >= 500) {
          toast.error("Server error. Please try again later.")
        }

        return Promise.reject(error)
      },
    )
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params })
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching data")
      throw error
    }
  }

  public async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data)
      return response.data
    } catch (error) {
      this.handleError(error, "Error creating data")
      throw error
    }
  }

  public async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data)
      return response.data
    } catch (error) {
      this.handleError(error, "Error updating data")
      throw error
    }
  }

  public async patch<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data)
      return response.data
    } catch (error) {
      this.handleError(error, "Error updating data")
      throw error
    }
  }

  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url)
      return response.data
    } catch (error) {
      this.handleError(error, "Error deleting data")
      throw error
    }
  }

  private handleError(error: any, defaultMessage: string): void {
    console.error(defaultMessage, error)
    // const errorMessage = error.response?.data?.message || defaultMessage
    // We don't show toast here to avoid duplicate toasts
    // The store layer will handle showing toasts
  }
}

export default ApiService.getInstance()