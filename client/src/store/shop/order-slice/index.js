import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    approvalURL: null,
    isLoading: false,
    orderId: null,
    orderList: [],
    orderDetails: null,
    acceptedOrders: [],
};

// ✅ Create Order
export const createNewOrder = createAsyncThunk(
    "/order/createNewOrder",
    async(orderData) => {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/shop/order/create`,
            orderData, { withCredentials: true } // ⬅️ Important
        );
        return response.data;
    }
);

// ✅ Capture Payment
export const capturePayment = createAsyncThunk(
    "/order/capturePayment",
    async({ paymentId, payerId, orderId }) => {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/shop/order/capture`, { paymentId, payerId, orderId }, { withCredentials: true }
        );
        return response.data;
    }
);

// ✅ User: Get All Orders
export const getAllOrdersByUserId = createAsyncThunk(
    "/order/getAllOrdersByUserId",
    async(userId) => {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/shop/order/list/${userId}`, { withCredentials: true }
        );
        return response.data;
    }
);

// ✅ User/Admin: Get Order Details
export const getOrderDetails = createAsyncThunk(
    "/order/getOrderDetails",
    async(id) => {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/shop/order/details/${id}`, { withCredentials: true }
        );
        return response.data;
    }
);

// ✅ Admin: Get Accepted Orders
export const getAcceptedOrdersByAdmin = createAsyncThunk(
    "order/getAcceptedOrdersByAdmin",
    async(adminId) => {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/order/accepted-orders?adminId=${adminId}`, { withCredentials: true }
        );
        return response.data.data;
    }
);

const shoppingOrderSlice = createSlice({
    name: "shoppingOrderSlice",
    initialState,
    reducers: {
        resetOrderDetails: (state) => {
            state.orderDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // ➤ Create Order
            .addCase(createNewOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createNewOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.approvalURL = action.payload.approvalURL;
                state.orderId = action.payload.orderId;

                sessionStorage.setItem(
                    "currentOrderId",
                    JSON.stringify(action.payload.orderId)
                );
            })
            .addCase(createNewOrder.rejected, (state) => {
                state.isLoading = false;
                state.approvalURL = null;
                state.orderId = null;
            })

        // ➤ Get All Orders
        .addCase(getAllOrdersByUserId.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderList = action.payload.data;
            })
            .addCase(getAllOrdersByUserId.rejected, (state) => {
                state.isLoading = false;
                state.orderList = [];
            })

        // ➤ Get Order Details
        .addCase(getOrderDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderDetails = action.payload.data;
            })
            .addCase(getOrderDetails.rejected, (state) => {
                state.isLoading = false;
                state.orderDetails = null;
            })

        // ➤ Get Accepted Orders (Admin)
        .addCase(getAcceptedOrdersByAdmin.fulfilled, (state, action) => {
            state.acceptedOrders = action.payload;
        });
    },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;