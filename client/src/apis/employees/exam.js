import { getToken } from "../../utility/localStorageControl";
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import { createAxios } from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();

export const storeExam = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/store-exams`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Error saving exam:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const ListExam = async () => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/exams-index`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export const destroy = async (id) => {
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/destroy-exams/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export const update = async (formData,id) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/update-exams/${id}`, formData ,{
            headers: {
               'Content-Type': 'multipart/form-data',
               'Authorization': `Bearer ${token}`
            },
        });
        return response;
    } catch (error) {
        console.error('Error saving exam:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const storeExamUser = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/store-result-user`, formData, {
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`
            },
        });
        return response;
    } catch (error) {
        console.error('Error saving exam:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const getExamUser = async (id) => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/get-exam-user/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

