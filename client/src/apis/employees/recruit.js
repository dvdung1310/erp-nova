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

//Tin tuyển dụng
export const getRecruitNews = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruitnews`);
    return response.data;
};
export const createRecruitNews = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruitnews/create`);
    return response.data;
};
export const storeRecruitNews = async (data) => {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvrecruitnews`,data);
    return response.data;
};
export const updateRecruitNews = async (data,id) => {
    const response = await axios.put(`${LARAVEL_SERVER}/api/nvrecruitnews/${id}`,data);
    return response.data;
};
export const showRecruitNews = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruitnews/${id}`);
    return response.data;
};
export const deleteRecruitNews = async (id) => {
    const response = await axios.delete(`${LARAVEL_SERVER}/api/nvrecruitnews/${id}`);
    return response.data;
};
//ứng viên 
export const getRecruitCandidates = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruitcandidates`);
    return response.data;
};
export const createRecruitCandidates = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruitcandidates/create`);
    return response.data;
};
export const storeRecruitCandidates = async (formData) => {
    try {
      const response = await axios.post(
        `${LARAVEL_SERVER}/api/nvrecruitcandidates`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lưu ứng viên:', error);
      throw new Error(error.response?.data?.message || 'Lưu ứng viên thất bại');
    }
  };
  
  export const updateRecruitCandidates = async (formData, id) => {
    try {
      const response = await axios.post(
        `${LARAVEL_SERVER}/api/nvrecruitcandidates/${id}?_method=PUT`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật ứng viên:', error);
      throw new Error(error.response?.data?.message || 'Cập nhật ứng viên thất bại');
    }
  };
export const showRecruitCandidates = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvrecruitcandidates/${id}`);
    return response.data;
};
export const deleteRecruitCandidates = async (id) => {
    const response = await axios.delete(`${LARAVEL_SERVER}/api/nvrecruitcandidates/${id}`);
    return response.data;
};