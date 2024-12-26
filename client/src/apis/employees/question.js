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

export const questionOrDocument = async (id) => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/question-or-document/${id}`, {
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

export const updateQuestionDocument = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/update-question-document`, formData ,{
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

export const questionName = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/questionName`, formData, {
            method: "POST",
            mode: "cors",
            headers: {
            "Content-Type": "application/json",
             },
          body: JSON.stringify(formData),
        });
        return response;
    } catch (error) {
        console.error('Error saving question:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const storeQuestionDocument = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/document-store`, formData, {
            'Content-Type': 'application/json',
        });
        return response;
    } catch (error) {
        console.error('Error saving question:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAllQuestion = async (examID) => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/get-all-question/${examID}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export const storeQuestionExamDocument = async (examId, selectedQuestionIds) => {
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/store-question-exam-document`, {
        exam_id: examId,
        question_ids: selectedQuestionIds, 
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

