import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});


axiosInstance.interceptors.response.use(
    response => {
        return response.data ? response.data : response
    },

    error => {
        const {response} = error

        if (response.status === 401) {
            // resfresh token o day
        }

        return Promise.reject(error)
    }
)
export default axiosInstance;
