import api from "./axiosClient";

export const registerWithEmail = (payload) => api.post("/api/auth/register", payload);

export const loginWithEmail = (payload) => api.post("/api/auth/login", payload);
