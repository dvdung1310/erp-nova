import { getToken } from "../../utility/localStorageControl";
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import { createAxios } from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();

export const storeQuestion = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/store-question`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Error saving question:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const listQuestionAnswer = async (id) => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/list-question-answer/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export const destroy = async (id) => {
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/delete-question-answer/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export const updateQuestion = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/update-question-answer`, formData ,{
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
