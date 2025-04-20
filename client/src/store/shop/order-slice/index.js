import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    isLoading: false,
    orderId: null,
    razorpayOrderId: null,
    razorpayAmount: null,
    razorpayCurrency: null,
    razorpayKeyId: null,
    orderList: [],
    orderDetails: null,
};

export const createNewOrder = createAsyncThunk(
    "/order/createNewOrder",
    async(orderData) => {
        const response = await axios.post(
            "http://localhost:5000/api/shop/order/create",
            orderData
        );

        return response.data;
    }
);

export const capturePayment = createAsyncThunk(
    "/order/capturePayment",
    async({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }) => {
        const response = await axios.post(
            "http://localhost:5000/api/shop/order/capture", {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                orderId,
            }
        );

        return response.data;
    }
);

export const getAllOrdersByUserId = createAsyncThunk(
    "/order/getAllOrdersByUserId",
    async(userId) => {
        const response = await axios.get(
            `http://localhost:5000/api/shop/order/list/${userId}`
        );

        return response.data;
    }
);

export const getOrderDetails = createAsyncThunk(
    "/order/getOrderDetails",
    async(id) => {
        const response = await axios.get(
            `http://localhost:5000/api/shop/order/details/${id}`
        );

        return response.data;
    }
);

export const getAcceptedOrdersByAdmin = createAsyncThunk(
    "order/getAcceptedOrdersByAdmin",
    async(adminId) => {
        const response = await axios.get(`/api/order/accepted-orders?adminId=${adminId}`);
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
            .addCase(createNewOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createNewOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderId = action.payload.orderId;
                state.razorpayOrderId = action.payload.razorpayOrderId;
                state.razorpayAmount = action.payload.amount;
                state.razorpayCurrency = action.payload.currency;
                state.razorpayKeyId = action.payload.razorpayKeyId;
                sessionStorage.setItem(
                    "currentOrderId",
                    JSON.stringify(action.payload.orderId)
                );
            })
            .addCase(createNewOrder.rejected, (state) => {
                state.isLoading = false;
                state.orderId = null;
                state.razorpayOrderId = null;
                state.razorpayAmount = null;
                state.razorpayCurrency = null;
                state.razorpayKeyId = null;
            })
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
            .addCase(getOrderDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orderDetails = action.payload.data;
            })
            .addCase(getAcceptedOrdersByAdmin.fulfilled, (state, action) => {
                state.acceptedOrders = action.payload;
            })
            .addCase(getOrderDetails.rejected, (state) => {
                state.isLoading = false;
                state.orderDetails = null;
            });
    },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;