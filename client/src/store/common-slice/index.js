import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { apiUrl } from "../../lib/api";

const initialState = {
    isLoading: false,
    featureImageList: [],
};

export const getFeatureImages = createAsyncThunk(
    "/order/getFeatureImages",
    async() => {
        const response = await axios.get(
            apiUrl(`/api/common/feature/get`)
        );

        return response.data;
    }
);

export const deleteFeatureImage = createAsyncThunk(
    "common/deleteFeatureImage",
    async(imageId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(apiUrl(`/api/common/feature/delete/${imageId}`));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const addFeatureImage = createAsyncThunk(
    "/order/addFeatureImage",
    async(image) => {
        const response = await axios.post(
            apiUrl(`/api/common/feature/add`), { image }
        );

        return response.data;
    }
);

const commonSlice = createSlice({
    name: "commonSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getFeatureImages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getFeatureImages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.featureImageList = action.payload.data;
            })
            .addCase(getFeatureImages.rejected, (state) => {
                state.isLoading = false;
                state.featureImageList = [];
            })
            .addCase(deleteFeatureImage.fulfilled, (state, action) => {
                state.featureImageList = state.featureImageList.filter(
                    (img) => img._id !== action.payload.imageId
                );
            });
    },
});

export default commonSlice.reducer;