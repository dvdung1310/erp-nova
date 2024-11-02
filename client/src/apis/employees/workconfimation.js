import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storeWorkConfimation = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/work-confirmations/store`, { confirmations: formData }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const detailWorkConfimation = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/detail/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const deleteDetailWorkConfimation = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/delete_detail/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};
