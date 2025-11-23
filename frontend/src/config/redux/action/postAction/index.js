import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "/post/getAllPosts",
  async (_, thunkApi) => {
    try {
      const response = await clientServer.get("/get_all_posts");
      return thunkApi.fulfillWithValue(response.data);
    } catch (err) {
      console.error("Error While Fteching the posts ", err);
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "/user/aboutUser",
  async (user, thunkApi) => {
    try {
      const AboutUser = await clientServer.get("get_user_and_profile", {
        params: {
          token: user.token,
        },
      });

      return thunkApi.fulfillWithValue(AboutUser.data);
    } catch (err) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "/users/getAllUsers",
  async (_, thunkApi) => {
    try {
      const response = await clientServer.get("/users/get_all_users");
      return thunkApi.fulfillWithValue(response.data);
    } catch (err) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  "/posts/createPost",
  async (userData, thunkApi) => {
    const { media, body } = userData;
    try {
      const formData = new FormData();
      formData.append("token", localStorage.getItem("token"));
      formData.append("body", body);
      formData.append("media", media);

      const response = await clientServer.post("/create_post", formData);

      if (response.status == 201) {
        return thunkApi.fulfillWithValue("Post Uplod Sucessfully");
      } else {
        return thunkApi.rejectWithValue("Post Uploading Failed");
      }
    } catch (err) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const deletePost = createAsyncThunk(
  "/post/deletePost",
  async (post_id, thunkApi) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          postId: post_id.post_id,
        },
      });

      return thunkApi.fulfillWithValue(response.data);
    } catch (err) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const incrementLike = createAsyncThunk(
  "/post/incrementLike",
  async (post, thunkApi) => {
    try {
      const response = await clientServer.post("/like_post", {
        postId: post.post_id,
      });
      console.log(response.dt);

      return thunkApi.fulfillWithValue(response.data);
    } catch (err) {
      return thunkApi.rejectWithValue(err.response.data);
    }
  }
);

export const getAllComents = createAsyncThunk(
  "/post/getAllComments",
  async (postData, thunkApi) => {
    try {
      const response = await clientServer.get("/comments_on_post", {
        params: {
          postId: postData.post_id,
        },
      });

      return thunkApi.fulfillWithValue({
        comments: response.data,
        postId: postData.post_id,
      });
    } catch (err) {
      return thunkApi.rejectWithValue(err.data.response);
    }
  }
);

export const postOnComment = createAsyncThunk(
  "/post/PostOnComment",
  async (postData, thunkApi) => {
    console.log(postData);
    try {
      const response = await clientServer.post("/comment_on_post", {
        token: localStorage.getItem("token"),
        postId: postData.post_id,
        commentBody: postData.body,
      });

      return thunkApi.fulfillWithValue(response.data);
    } catch (err) {
      return thunkApi.rejectWithValue(err.data.response);
    }
  }
);
