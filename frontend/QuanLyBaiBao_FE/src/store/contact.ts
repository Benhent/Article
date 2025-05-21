import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface ContactState {
  contacts: Contact[];
  contact: Contact | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Actions
  submitContact: (data: Omit<Contact, '_id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getAllContacts: (params?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<void>;
  getContactById: (id: string) => Promise<void>;
  updateContactStatus: (id: string, status: Contact['status']) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  contact: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  submitContact: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/contacts', data);
      toast.success('Gửi yêu cầu liên hệ thành công');
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Có lỗi xảy ra' });
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getAllContacts: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const { page = 1, limit = 10, status, search } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(search && { search }),
      });

      const response = await axios.get(`/api/contacts?${queryParams}`);
      const { contacts, pagination } = response.data.data;
      
      set({
        contacts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
        },
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Có lỗi xảy ra' });
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      set({ loading: false });
    }
  },

  getContactById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/api/contacts/${id}`);
      set({ contact: response.data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Có lỗi xảy ra' });
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      set({ loading: false });
    }
  },

  updateContactStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.patch(`/api/contacts/${id}/status`, { status });
      const updatedContact = response.data.data;
      
      // Update in contacts list if exists
      set((state) => ({
        contacts: state.contacts.map((contact) =>
          contact._id === id ? updatedContact : contact
        ),
        contact: state.contact?._id === id ? updatedContact : state.contact,
      }));
      
      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Có lỗi xảy ra' });
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      set({ loading: false });
    }
  },

  deleteContact: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/api/contacts/${id}`);
      
      // Remove from contacts list
      set((state) => ({
        contacts: state.contacts.filter((contact) => contact._id !== id),
        contact: state.contact?._id === id ? null : state.contact,
      }));
      
      toast.success('Xóa yêu cầu liên hệ thành công');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Có lỗi xảy ra' });
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      set({ loading: false });
    }
  },
}));

export default useContactStore;
