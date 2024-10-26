const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import axios from "axios";

export const getRecruitTarget = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruittarget`);
    return response.data;
};
export const createRecruitTarget = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruittarget/create`);
    return response.data;
};
export const storeRecruitTarget = async (data) => {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvrecruittarget`,data);
    return response.data;
};
export const updateRecruitTarget = async (data,id) => {
    const response = await axios.put(`${LARAVEL_SERVER}/api/nvrecruittarget/${id}`,data);
    return response.data;
};
export const showRecruitTarget = async (id) => {
    const response = await axios.put(`${LARAVEL_SERVER}/api/nvrecruittarget/${id}`);
    return response.data;
};
export const deleteRecruitTarget = async (id) => {
    const response = await axios.delete(`${LARAVEL_SERVER}/api/nvrecruittarget/${id}`);
    return response.data;
};