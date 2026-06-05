import createAxiosInstance from "./axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const baseUrlInitial = isLocal ? "http://localhost:3000/api" : "https://api.ventryx.fun";

export const axiosInitial = createAxiosInstance(baseUrlInitial);
