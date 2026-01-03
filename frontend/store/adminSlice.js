import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/adminService';

export const fetchStats = createAsyncThunk(
  'admin/fetchStats',
  async () => {
    const response = await adminService.getStats();
    return response.stats;
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => {
    const response = await adminService.getUsers();
    return response.users;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: {},
    users: [],
    loading: false,
    error: null
  },
  reducers: {
    clearAdminData: (state) => {
      state.stats = {};
      state.users = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;
