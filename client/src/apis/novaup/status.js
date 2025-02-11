import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storeStatus = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storeStatus`,  formData , {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  status:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateStatus = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updateStatus`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  status:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const ListStatus = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexStatus`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  status:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeleteStatus = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deleteStatus/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  status:', error.response ? error.response.data : error.message);
        throw error;
    }
};


