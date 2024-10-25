import {getToken} from "../../utility/localStorageControl";
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
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

