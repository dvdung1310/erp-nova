import {getToken} from "../../utility/localStorageControl";
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
import axios from 'axios';
const instanceAxios = createAxios();
const token = getToken();
export const ListCustomer = async () => {
    try {
        const response = await axios.get(`${LARAVEL_SERVER}/api/nvtcustomer`);
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const storeCustomer = async (data) => {
    try {
        const token = getToken();
        const response = await instanceAxios.post(
            `${LARAVEL_SERVER}/api/storestudent`,data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const showCustomer = async (id) => {
    try {
        const response = await axios.get(`${LARAVEL_SERVER}/api/nvtcustomer/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const updateCustomer = async (id, data) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/update_parent/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
export const getStudentTrial = async (id) => {
    try {
        const response = await axios.get(`${LARAVEL_SERVER}/api/student_trial_class/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const storeStudentTrial = async (data) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/store_trial_class`,data);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
export const updateStudentTrial = async (data,trialId) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/update_trial_class/${trialId}`,data);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
export const updateCommentParent = async (data,student_id) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/update_comment_parient/${student_id}`,data);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
export const getCommentParent = async (student_id) => {
    try {
       
      const response = await axios.get(`${LARAVEL_SERVER}/api/get_comment_parent/${student_id}`);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
//Nguồn khách Hàng
export const getDataSourceNovaTeen = async () => {
  try {
    const response = await axios.get(`${LARAVEL_SERVER}/api/data_source_novateen`);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const storeDataSourceNovaTeen = async (data) => {
  try {
    const response = await axios.post(`${LARAVEL_SERVER}/api/store_source_novateen`,data);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const updateDataSourceNovaTeen = async (data) => {
  try {
    const response = await axios.post(`${LARAVEL_SERVER}/api/update_source_novateen`,data);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
//daonh thu
export const getPayment = async (data) => {
  try {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvt_payment`);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const getCustomerNovateen = async (data) => {
  try {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvt_customer`);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const storePayment = async (data) => {
  try {
    const token = getToken();
    const response = await instanceAxios.post(
      `${LARAVEL_SERVER}/api/nvt_store_payment`, data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data; 
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const updatePayment = async (data,id) => {
  try {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvt_update_payment/${id}`,data);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const deletePayment = async (id) => {
  try {
    const response = await axios.get(`${LARAVEL_SERVER}/api/delete_payment/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error Customer:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const updateStatus = async (id, status) => {
  try {
    const response = await axios.put(`${LARAVEL_SERVER}/api/update_status_payment/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);  // Log lỗi chi tiết
    throw new Error('Lỗi khi cập nhật trạng thái');
  }
};