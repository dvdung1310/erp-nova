import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storeRoom = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storeRoom`,  formData , {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Room:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateRoom = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updateRoom`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Room:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const ListRoom = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexRoom`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Room:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeleteRoom = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deleteRoom/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Room:', error.response ? error.response.data : error.message);
        throw error;
    }
};


