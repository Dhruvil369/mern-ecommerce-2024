import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    isLoading: false,
    productList: [],
    productDetails: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
    "/products/fetchAllProducts",
    async({ filterParams, sortParams }) => {
        console.log(fetchAllFilteredProducts, "fetchAllFilteredProducts");

        const query = new URLSearchParams({
            ...filterParams,
            sortBy: sortParams,
        });

        const result = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/shop/products/get?${query}`
        );

        console.log(result);

        if (result.data) {
            return result.data;
        } else {
            return null;
        }
    }
);

export const fetchProductDetails = createAsyncThunk(
    "/products/fetchProductDetails",
    async(id) => {
        const result = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/shop/products/get/${id}`
        );
        // AAIYA RESULT?.DATA; AAVE BUT UTO SAVE NO ISSUE SOLVE
        if (result.data) {
            return result.data;
        } else {
            return null;
        }
    }
);

const shoppingProductSlice = createSlice({
    name: "shoppingProducts",
    initialState,
    reducers: {
        setProductDetails: (state) => {
            state.productDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllFilteredProducts.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.productList = action.payload.data;
            })
            .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.productList = [];
            })
            .addCase(fetchProductDetails.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(fetchProductDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.productDetails = action.payload.data;
            })
            .addCase(fetchProductDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.productDetails = null;
            });
    },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;