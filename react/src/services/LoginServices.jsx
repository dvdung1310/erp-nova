import axiosInstance from "../configs/axios";

const LoginServices = async (data) => {
    try {
        const response = await axiosInstance.post('auth/login', data);
        return response;
    } catch (error) {
        return false;
    }
};

export { LoginServices };
