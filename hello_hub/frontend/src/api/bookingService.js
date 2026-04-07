import api from "./axiosClient";

export const submitStudentBooking = (bookingRequest) => {
  return api.post("/api/student/bookings", bookingRequest);
};
