import { create } from "zustand";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  isVerified: boolean;
  avatarUrl?: string;
  role?: string;
  link?: string;
  national?: string;
}

interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;
  signup: (
    name: string,
    username: string,
    email: string,
    password: string,
    link?: string,
    national?: string,
    avatarUrl?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<{ message: string }>;
  resendVerification: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  updateProfile: (
    name: string,
    username: string,
    link: string,
    national: string,
    avatarFile: File | null
  ) => Promise<void>;
  fetchUsers: () => Promise<void>;
  getUserByEmail: (email: string) => Promise<User | null>;
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  users: [],
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (name, username, email, password, link, national, avatarUrl) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User }>(`${API_URL}/signup`, {
        name,
        username,
        email,
        password,
        link,
        national,
        avatarUrl
      });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({ error: axiosError.response?.data?.message || "Error signing up", isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User }>(`${API_URL}/login`, { email, password });
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
        isCheckingAuth: false,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({ error: axiosError.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null, 
        isLoading: false 
      });
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User; message: string }>(`${API_URL}/verify-email`, { code });
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false,
        isCheckingAuth: false,
      });
      return { message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({ error: axiosError.response?.data?.message || "Error verifying email", isLoading: false });
      throw error;
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ message: string }>(`${API_URL}/resend-verification`, { email });
      set({ 
        message: response.data.message, 
        isLoading: false 
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Error resending verification email",
      });
      throw error;
    }
  },
  
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get<{ user: User }>(`${API_URL}/check`);
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isCheckingAuth: false 
      });
    } catch (error) {
      set({ 
        error: null, 
        isCheckingAuth: false, 
        isAuthenticated: false 
      });
    }
  },

  checkEmailExists: async (email) => {
    try {
      const response = await axios.post<{ success: boolean; exists: boolean }>(`${API_URL}/check-email`, { email });
      return response.data.exists;
    } catch (error) {
      // Handle error silently and return false (email doesn't exist)
      return false;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ message: string }>(`${API_URL}/forgot-password`, { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async (token, password, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ message: string }>(`${API_URL}/reset-password/${token}`, {
        password,
        confirmPassword
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Error resetting password",
      });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put<{ message: string }>(`${API_URL}/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Error changing password",
      });
      throw error;
    }
  },

  updateProfile: async (name, username, link, national, avatarUrl) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put<{ success: boolean; user: User; message: string }>(`http://localhost:5000/api/profile/update-profile`, 
        {
          name,
          username,
          link,
          national,
          avatarUrl
        }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && response.data.user) {
        set({
          user: response.data.user,
          isLoading: false,
          message: response.data.message || "Profile updated successfully"
        });
      } else {
        set({
          error: "Failed to update profile",
          isLoading: false
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        error: axiosError.response?.data?.message || "Error updating profile",
        isLoading: false
      });
      throw error;
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Thêm kiểu response và lấy data từ thuộc tính 'data' của response
      const response = await axios.get<{ data: User[] }>(`${API_URL}/users`);
      set({ users: response.data.data, isLoading: false }); // Sửa thành response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({ 
        error: axiosError.response?.data?.message || "Error fetching users", 
        isLoading: false 
      });
      throw error;
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const response = await axios.post<{ success: boolean; user: User }>(`${API_URL}/user-by-email`, { email });
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  updateUserRole: async (userId, newRole) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put<{ success: boolean; user: User; message: string }>(
        `${API_URL}/update-role`,
        { userId, newRole }
      );

      if (response.data.success) {
        // Update the user in the users list if it exists
        set((state) => ({
          users: state.users.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          ),
          isLoading: false,
          message: response.data.message
        }));
      } else {
        set({
          error: "Failed to update user role",
          isLoading: false
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        error: axiosError.response?.data?.message || "Error updating user role",
        isLoading: false
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/delete-user`, { data: { userId } });
      set((state) => ({
        users: state.users.filter(user => user._id !== userId),
        isLoading: false
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({ 
        error: axiosError.response?.data?.message || "Error deleting user", 
        isLoading: false 
      });
      throw error;
    }
  },

  clearMessage: () => set({ message: null, error: null }),
}));

export default useAuthStore;