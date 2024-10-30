const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import axios from 'axios';

export const getEmployees = async (data) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployee`);
  return response.data;
};
export const createEmployees = async (data) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployee/create`);
  return response.data;
};
export const storeEmployees = async (data) => {
  console.log(data);
  const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployee`, data,{
    headers: {
      'Content-Type': 'application/json',
  }
  });
  return response.data;
};
export const deleteEmployees = async (id) => {
  const response = await axios.delete(`${LARAVEL_SERVER}/api/nvemployee/${id}`);
  return response.data;
};
export const updateEmployees = async (data, id) => {
  const response = await axios.put(`${LARAVEL_SERVER}/api/nvemployee/${id}`, data);
  return response.data;
};

// ----------------------Hồ sơ nhân sự----------------------------------
export const getEmployeesFile = async (id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/showEmployeeFile/${id}`);
  return response.data;
};

export const createEmployeesFile = async () => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployeefile/create`);
  return response.data;
};
// export const storeEmployeesFile = async (data) => {
//     const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployeefile`,data);
//     return response.data;
// };
// export const updateEmployeesFile = async (data,id) => {
//     const response = await axios.put(`${LARAVEL_SERVER}/api/nvemployeefile/${id}`,data);
//     return response.data;
// };
export const storeEmployeesFile = async (formData) => {
  try {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployeefile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lưu hồ sơ:', error);
    throw new Error(error.response?.data?.message || 'Lưu hồ sơ thất bại');
  }
};

export const updateEmployeesFile = async (formData, id) => {
  try {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployeefile/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    throw new Error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
  }
};
export const editEmployeesFile = async (id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployeefile/${id}`);
  return response.data;
};

export const deleteEmployeesFile = async (id) => {
  const response = await axios.delete(`${LARAVEL_SERVER}/api/nvemployeefile/${id}`);
  return response.data;
};