import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const storeBooking = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storeBooking`,  formData , {
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

export const updateBooking = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updateBooking`,  formData , {
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


export const ListBooking = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexBooking`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Booking:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeleteBooking = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deleteBooking/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Booking:', error.response ? error.response.data : error.message);
        throw error;
    }
};


