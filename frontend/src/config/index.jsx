import axios from "axios";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://proconnect-1-8mwt.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
