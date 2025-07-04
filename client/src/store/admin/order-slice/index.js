// Existing imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { apiUrl } from "../../../lib/api";

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
        const token = localStorage.getItem("token");
        const header = `Bearer ${token}`
        console.log(header);
        console.log("This is token in token getUnassignedOrders", token);
        try {
            const response = await axios.get(apiUrl("/api/admin/orders/unassigned"), {
                withCredentials: true
            });
            console.log("✅ DATA from /unassigned-orders:", response.data); // Is this [] or real?
            return response.data;
        } catch (err) {
            console.log("❌ ERROR fetching unassigned:", err);
            // console.error("❌ AXIOS ERROR FETCHING UNASSIGNED:");
            console.log("Status:", err.response.status);
            console.log("Data:", err.response.data);
            console.log("Full Error:", err);

            return thunkAPI.rejectWithValue(err.response.data.message);
        }
    }
);


// ✅ Thunk: Accept an order
export const acceptOrder = createAsyncThunk(
    "/order/acceptOrder",
    async({ id }) => {
        console.log("acCEOPToRDER tRIGGERED");
        const token = localStorage.getItem("token");
        const res = await axios.put(
            apiUrl(`/api/admin/orders/accept/${id}`), {}, // <- PUT request body (empty in this case)
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true
            }
        );

        console.log("✅ DATA from accept", res.data);
        return res.data;
    }
);


// ✅ Thunk: Get orders accepted by admin
// export const getAcceptedOrdersByAdmin = createAsyncThunk(
//     "/order/getAcceptedOrdersByAdmin",
//     async() => {
//         const res = await axios.get(`http://localhost:5000/api/admin/orders/accepted`);
//         return res.data;
//     }
// );

export const getAcceptedOrdersByAdmin = createAsyncThunk(
    "/order/getAcceptedOrdersByAdmin",
    async() => {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl(`/api/admin/orders/accepted`), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
        });
        return res.data;
    }
);

// ✅ Thunk: Mark order as delivered
export const markOrderAsDelivered = createAsyncThunk(
    "/order/markOrderAsDelivered",
    async(orderId) => {
        const token = localStorage.getItem("token");
        const res = await axios.put(apiUrl(`/api/admin/orders/delivered/${orderId}`), {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    }
);


// ✅ Thunk: Get all orders (already there)
export const getAllOrdersForAdmin = createAsyncThunk(
    "/order/getAllOrdersForAdmin",
    async() => {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl(`/api/admin/orders/get`), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    }
);

// ✅ Thunk: Get order details
export const getOrderDetailsForAdmin = createAsyncThunk(
    "/order/getOrderDetailsForAdmin",
    async(id) => {
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl(`/api/admin/orders/details/${id}`), {
            withCredentials: true
        });
        return res.data;
    }
);

// ✅ Thunk: Update order status
export const updateOrderStatus = createAsyncThunk(
    "/order/updateOrderStatus",
    async({ orderId, status }) => {
        const token = localStorage.getItem("token");
        const res = await axios.put(apiUrl(`/api/admin/orders/update/${orderId}`), { status }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    }
);


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