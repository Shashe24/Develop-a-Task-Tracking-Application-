import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async ({ token, filters = {} }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters.assignedToMe) params.append('assignedToMe', 'true');
            if (filters.status) params.append('status', filters.status);

            const response = await axios.get(`/api/tasks?${params.toString()}`, {
                headers: { Authorization: token },
            });
            return response.data.tasks;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to fetch tasks');
        }
    }
);

export const createTask = createAsyncThunk(
    'tasks/createTask',
    async ({ token, taskData }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/tasks', taskData, {
                headers: { Authorization: token },
            });
            return response.data.task;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to create task');
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ token, taskId, updates }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/api/tasks/${taskId}`, updates, {
                headers: { Authorization: token },
            });
            return response.data.task;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to update task');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async ({ token, taskId }, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`, {
                headers: { Authorization: token },
            });
            return taskId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to delete task');
        }
    }
);

const initialState = {
    tasks: [],
    loading: false,
    error: null,
    currentFilter: 'all', // 'all', 'assignedToMe', 'completed'
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.currentFilter = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch tasks
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create task
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks.push(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update task
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.tasks.findIndex(task => task._id === action.payload._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete task
            .addCase(deleteTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = state.tasks.filter(task => task._id !== action.payload);
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilter, clearError } = tasksSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectCurrentFilter = (state) => state.tasks.currentFilter;

export const selectFilteredTasks = (state) => {
    const { tasks, currentFilter } = state.tasks;
    const userId = state.auth.user?._id;

    switch (currentFilter) {
        case 'assignedToMe':
            return tasks.filter(task => task.assigneeId?._id === userId);
        case 'completed':
            return tasks.filter(task => task.status === 'done');
        case 'all':
        default:
            return tasks;
    }
};

export default tasksSlice.reducer;
