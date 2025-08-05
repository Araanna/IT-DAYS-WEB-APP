import { reactive } from 'vue';
import type { User, AuthState, AuthResponse } from '../types/auth';
import { apiService } from '../services/api';

const state = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  error: null,
  token: localStorage.getItem('token') || null,
});

export const useAuthStore = () => {
  const setUser = (user: User) => {
    state.user = user;
    state.isAuthenticated = true;
  };

  const setToken = (token: string) => {
    state.token = token;
    localStorage.setItem('token', token);
  };

  const clearAuth = () => {
    state.user = null;
    state.isAuthenticated = false;
    state.token = null;
    localStorage.removeItem('token');
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data: AuthResponse = await apiService.login(credentials);

      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'message'>) => {
    try {
      // Create clean payload with only necessary fields
      const payload = {
        full_name: userData.full_name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        course: userData.course,
        gender: userData.gender,
        year_level_id: userData.year_level_id,
        role: userData.role,
        position: userData.role === 'SBO' ? userData.position : undefined,
      };

      const data = await apiService.register(payload);

      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const fetchUser = async () => {
    try {
      if (!state.token) return;

      const data: User = await apiService.getProfile(state.token);
      setUser(data);
    } catch (error) {
      console.error('Fetch user error:', error);
      clearAuth();
    }
  };

  const logout = () => {
    clearAuth();
  };

  return {
    state,
    login,
    register,
    logout,
    fetchUser,
  };
};