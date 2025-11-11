import { createSlice } from "@reduxjs/toolkit";
import {
  getAboutUser,
  getAllComents,
  getAllPosts,
} from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  isLoading: false,
  loggedIn: false,
  postsFetched: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.message = "Getting All posts...";
        state.isLoading = true;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isError = false;
        (state.isLoading = false), (state.postsFetched = true);
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(getAllComents.fulfilled, (state, action) => {
        state.postId = action.payload.postId;
        state.isError = false;
        state.isLoading = false;
        state.comments = action.payload.comments.comments.reverse() || [];
        console.log(state.comments);
      });
  },
});
export const { resetPostId } = postSlice.actions;
export default postSlice.reducer;
