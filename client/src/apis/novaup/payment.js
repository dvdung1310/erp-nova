import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storePayment = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storePayment`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Payment:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updatePayment = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updatePayment`,  formData , {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Payment:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const ListPayment = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexPayment`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Payment:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeletePayment = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deletePayment/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Payment:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getBookingConnectCumstomer = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/getBookingConnectCumstomer`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Payment:', error.response ? error.response.data : error.message);
        throw error;
    }
};


