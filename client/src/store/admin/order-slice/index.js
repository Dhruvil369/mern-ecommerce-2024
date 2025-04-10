// Existing imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Initial state
const initialState = {
    orderList: [],
    orderDetails: null,
    acceptedOrders: [],
    unassignedOrders: [],
};

// ✅ Thunk: Get unassigned orders
export const getUnassignedOrders = createAsyncThunk(
    "adminOrder/getUnassignedOrders",
    async(_, thunkAPI) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/orders/unassigned`, {
                withCredentials: true,
            });
            return response.data;
        } catch (err) {
            console.error("❌ ERROR fetching unassigned:", err);
            return thunkAPI.rejectWithValue(err.response.data.message);
        }
    }
);

// ✅ Thunk: Accept an order
export const acceptOrder = createAsyncThunk(
    "/order/acceptOrder",
    async({ id }) => {
        const res = await axios.put(
            `${import.meta.env.VITE_BASE_URL}/api/admin/orders/accept/${id}`, {}, {
                withCredentials: true,
            }
        );
        return res.data;
    }
);

// ✅ Thunk: Get orders accepted by admin
export const getAcceptedOrdersByAdmin = createAsyncThunk(
    "/order/getAcceptedOrdersByAdmin",
    async() => {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/orders/accepted`, {
            withCredentials: true,
        });
        return res.data;
    }
);

// ✅ Thunk: Mark order as delivered
export const markOrderAsDelivered = createAsyncThunk(
    "/order/markOrderAsDelivered",
    async(orderId) => {
        const res = await axios.put(
            `${import.meta.env.VITE_BASE_URL}/api/admin/orders/delivered/${orderId}`, {}, {
                withCredentials: true,
            }
        );
        return res.data;
    }
);

// ✅ Thunk: Get all orders (already there)
export const getAllOrdersForAdmin = createAsyncThunk(
    "/order/getAllOrdersForAdmin",
    async() => {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/orders/get`, {
            withCredentials: true,
        });
        return res.data;
    }
);

// ✅ Thunk: Get order details
export const getOrderDetailsForAdmin = createAsyncThunk(
    "/order/getOrderDetailsForAdmin",
    async(id) => {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/orders/details/${id}`, {
            withCredentials: true,
        });
        return res.data;
    }
);

// ✅ Thunk: Update order status
export const updateOrderStatus = createAsyncThunk(
    "/order/updateOrderStatus",
    async({ orderId, status }) => {
        const res = await axios.put(
            `${import.meta.env.VITE_BASE_URL}/api/admin/orders/update/${orderId}`, { status }, {
                withCredentials: true,
            }
        );
        return res.data;
    }
);

// ✅ Slice
const adminOrderSlice = createSlice({
    name: "adminOrderSlice",
    initialState,
    reducers: {
        resetOrderDetails: (state) => {
            state.orderDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // All Orders
            .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
                state.orderList = action.payload.data;
            })
            // Order Details
            .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
                state.orderDetails = action.payload.data;
            })
            // Unassigned Orders
            .addCase(getUnassignedOrders.fulfilled, (state, action) => {
                state.unassignedOrders = action.payload.data;
            })
            // Accepted Orders
            .addCase(getAcceptedOrdersByAdmin.fulfilled, (state, action) => {
                state.acceptedOrders = action.payload.data;
            })
            // Accept Order
            .addCase(acceptOrder.fulfilled, (state, action) => {
                const acceptedOrder = action.payload.data;

                // Remove from unassignedOrders
                state.unassignedOrders = state.unassignedOrders.filter(
                    (order) => order._id !== acceptedOrder._id
                );

                // Add to acceptedOrders
                state.acceptedOrders = [acceptedOrder, ...state.acceptedOrders];
            })
            // Mark as Delivered
            .addCase(markOrderAsDelivered.fulfilled, (state, action) => {
                // Optional: update status in acceptedOrders or orderList
            });
    },
});

export const { resetOrderDetails } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;