import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storeCustomer = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storeCustomer`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateCustomer = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updateCustomer`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const ListCustomer = async (params) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexCustomer${params}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeleteCustomer = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deleteCustomer/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};


