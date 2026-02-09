import axios from 'axios';
import { DashboardData, User, Table, Referral } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor для добавления Telegram init data
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const initData = (window as any).Telegram?.WebApp?.initData;
    if (initData) {
      config.headers['X-Telegram-Init-Data'] = initData;
    }
  }
  return config;
});

export const apiClient = {
  // User
  async getUser(telegramId: string): Promise<User> {
    const { data } = await api.get(`/api/user/${telegramId}`);
    return data;
  },

  async getDashboard(userId: number): Promise<DashboardData> {
    const { data } = await api.get(`/api/dashboard/${userId}`);
    return data;
  },

  // Tables
  async getTables(userId: number): Promise<Table[]> {
    const { data } = await api.get(`/api/tables/${userId}`);
    return data;
  },

  async activateTable(userId: number, tableNumber: number): Promise<{ paymentUrl: string }> {
    const { data } = await api.post('/api/tables/activate', { userId, tableNumber });
    return data;
  },

  // Referrals
  async getReferrals(userId: number): Promise<Referral[]> {
    const { data } = await api.get(`/api/referrals/${userId}`);
    return data;
  }
};

export default api;
