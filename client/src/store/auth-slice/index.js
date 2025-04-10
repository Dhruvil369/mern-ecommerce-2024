import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Initial auth state
const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
};

// ✅ Register User
export const registerUser = createAsyncThunk(
    "/auth/register",
    async(formData) => {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/auth/register`,
            formData, {
                withCredentials: true,
            }
        );
        return response.data;
    }
);

// ✅ Login User
export const loginUser = createAsyncThunk(
    "/auth/login",
    async(formData) => {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
            formData, {
                withCredentials: true,
            }
        );

        console.log("✅ Login response:", response.data);
        return response.data;
    }
);

// ✅ Logout User
export const logoutUser = createAsyncThunk(
    "/auth/logout",
    async() => {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/auth/logout`, {}, {
                withCredentials: true,
            }
        );
        return response.data;
    }
);

// ✅ Check Auth Status
export const checkAuth = createAsyncThunk(
    "/auth/checkauth",
    async() => {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/auth/check-auth`, {
                withCredentials: true,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                },
            }
        );
        return response.data;
    }
);

// ✅ Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })

        // Login
        .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.success ? action.payload.user : null;
                state.isAuthenticated = action.payload.success;
            })
            .addCase(loginUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })

        // Check Auth
        .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.success ? action.payload.user : null;
                state.isAuthenticated = action.payload.success;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })

        // Logout
        .addCase(logoutUser.fulfilled, (state) => {
            state.isLoading = false;
            state.user = null;
            state.isAuthenticated = false;
        });
    },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;