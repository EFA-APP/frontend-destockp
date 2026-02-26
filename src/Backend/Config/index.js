import createAxiosInstance from "./axios";

const baseUrlInitial = "http://localhost:3000/api"

export const axiosInitial = createAxiosInstance(baseUrlInitial);
