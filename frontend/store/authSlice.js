import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    const response = await authService.login(credentials);
    if (response.ok) {
      storageService.setTokens(response.accessToken, response.refreshToken);
      storageService.setUser(response.user);
    }
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    storageService.clear();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storageService.getUser(),
    isAuthenticated: !!storageService.getAccessToken(),
    loading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.ok) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
