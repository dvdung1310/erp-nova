import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
const token = getToken();
export const storeProposal = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/proposal/store`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateProposal = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/proposal/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const ListProposal = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/proposal/index`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const DeleteProposal = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/proposal/delete/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const DetailProposal = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/proposal/detail/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const CheckProposalByListUser = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/proposal/list_employee`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateStatus = async (id, status) => {
    try {
        const token = getToken();
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/proposal/update_status/${id}/${status}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error  storeProposal:', error.response ? error.response.data : error.message);
        throw error;
    }
};
