import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
const token = getToken();
export const storeWorkConfimation = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/work-confirmations/store`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const storeWorkConfimationManager = async (data) => {
    console.log(data);
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/work-confirmations/manager-store`, {confirmations: data}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const listWorkConfimationUser = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/listbyuser`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const detailWorkConfimation = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/detail/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const deleteDetailWorkConfimation = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/delete_detail/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteWorkConfimation = async (id) => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/delete_workconfirmation/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateDetailWorkConfimation = async (formData) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/work-confirmations/update_detail/`, {detailconfirmations: formData}, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};


export const listEmployee = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/list_employee`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const listWorkConfimationStatus1 = async () => {
    try {
        const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/work-confirmations/danh-sach-cong-da-duyet`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateStatus = async (id, status) => {
    const token = getToken();
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/work-confirmations/update_status/${id}/${status}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateStatusDetail = async (id, status) => {
    const token = getToken();
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/work-confirmations/update_status_detail/${id}/${status}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work storeWorkConfimation:', error.response ? error.response.data : error.message);
        throw error;
    }
};