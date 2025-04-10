// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // Async thunk to create Razorpay order
// export const createRazorpayOrder = createAsyncThunk(
//     "order/createRazorpayOrder",
//     async(amount, { rejectWithValue }) => {
//         try {
//             const { data } = await axios.post("/api/create-razorpay-order", { amount });
//             return data.order;
//         } catch (err) {
//             return rejectWithValue(err.response ? .data ? .message || "Failed to create Razorpay order");
//         }
//     }
// );

// const orderSlice = createSlice({
//     name: "order",
//     initialState: {
//         razorpayOrder: null,
//         isCreatingRazorpayOrder: false,
//         razorpayError: null,
//     },
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(createRazorpayOrder.pending, (state) => {
//                 state.isCreatingRazorpayOrder = true;
//                 state.razorpayError = null;
//             })
//             .addCase(createRazorpayOrder.fulfilled, (state, action) => {
//                 state.isCreatingRazorpayOrder = false;
//                 state.razorpayOrder = action.payload;
//             })
//             .addCase(createRazorpayOrder.rejected, (state, action) => {
//                 state.isCreatingRazorpayOrder = false;
//                 state.razorpayError = action.payload;
//             });
//     },
// });

// export default orderSlice.reducer;