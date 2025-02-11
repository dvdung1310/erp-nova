import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storeSource = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storeSource`,  formData , {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Source:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateSource = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updateSource`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Source:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const ListSource = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexSource`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Source:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeleteSource = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deleteSource/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Source:', error.response ? error.response.data : error.message);
        throw error;
    }
};


