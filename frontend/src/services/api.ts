import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

/*
 * Attach the saved JWT token to protected API requests.
 *
 * We intentionally do NOT set a global Content-Type header here.
 *
 * JSON requests will be handled normally by Axios.
 * FormData requests, such as prescription uploads,
 * need Axios/browser to automatically set:
 *
 * multipart/form-data; boundary=...
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pharmablaze_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
