import { getToken } from '../../utility/localStorageControl';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import { createAxios } from '../../utility/createAxios';
import axios from 'axios';
const instanceAxios = createAxios();
const token = getToken();
export const InstructionalDocument = async (data) => {
    try {
        const token = getToken();
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/instructional_document`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error :', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const SaveInstructionalDocument = async (data) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/save_instructional_document`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Nếu bạn cần token, nếu không có thể bỏ qua
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  export const detailInstructionalDocument = async (id) => {
    try {
      const response = await axios.get(`${LARAVEL_SERVER}/api/detail_instructional_document/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Nếu bạn cần token, nếu không có thể bỏ qua
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  export const deleteInstructionalDocument = async (id) => {
    try {
      const response = await axios.get(`${LARAVEL_SERVER}/api/delete_instructional_document/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Nếu bạn cần token, nếu không có thể bỏ qua
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  export const updateInstructionalDocument = async (data,id) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/update_instructional_document/${id}`,data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Nếu bạn cần token, nếu không có thể bỏ qua
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
  };