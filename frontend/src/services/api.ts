import axios from "axios";

const api = axios.create({
  baseURL: "https://pharmablaze-fullstack.onrender.com/api",
});

/**
 * Attach the saved JWT token to protected API requests.
 *
 * We intentionally do NOT set a global Content-Type header here.
 *
 * JSON requests will be handled normally by Axios.
 * Multipart/form-data requests will be handled by Axios/browser.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pharmablaze_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
