import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);
