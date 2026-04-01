import api from "./axiosClient";

const BASE_URL = "/api/resources";

export const getAllResources = () => api.get(BASE_URL);

export const getResourceById = (id) => api.get(`${BASE_URL}/${id}`);

export const createResource = (resource) => api.post(BASE_URL, resource);

export const updateResource = (id, resource) => api.put(`${BASE_URL}/${id}`, resource);

export const deleteResource = (id) => api.delete(`${BASE_URL}/${id}`);

export const searchResources = (params) => api.get(`${BASE_URL}/search`, { params });
