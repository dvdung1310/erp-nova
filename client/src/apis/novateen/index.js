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
