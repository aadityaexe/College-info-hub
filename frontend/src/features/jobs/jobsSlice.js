import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/jobs/');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.detail || 'Failed to fetch jobs');
  }
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData, { rejectWithValue }) => {
  try {
    const response = await API.post('/jobs/', jobData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.detail || 'Failed to create job');
  }
});

export const fetchJobById = createAsyncThunk('jobs/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/jobs/${id}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data.detail || 'Failed to fetch job');
  }
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (jobId, { rejectWithValue }) => {
  try {
    await API.delete(`/jobs/${jobId}`);
    return jobId;
  } catch (err) {
    return rejectWithValue(err.response.data.detail || 'Failed to delete job');
  }
});

const initialState = {
  jobs: [],
  currentJob: null, 
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobById.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.currentJob = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
          state.loading = false;
          state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
      });
  },
});

export default jobsSlice.reducer;
