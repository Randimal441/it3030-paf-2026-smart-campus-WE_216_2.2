import api from "./axiosClient";

const BASE_URL = "/api/resource-bookings";

export const getAllBookings = () => api.get(BASE_URL);

export const getMyBookings = () => api.get(`${BASE_URL}/my-bookings`);

export const createBooking = (bookingData) => api.post(BASE_URL, bookingData);

export const updateBookingStatus = (id, status) => 
    api.patch(`${BASE_URL}/${id}/status`, null, { params: { status } });

export const deleteBooking = (id) => api.delete(`${BASE_URL}/${id}`);
