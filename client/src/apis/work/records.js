import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
export const getRecordsByUserId = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/records/get-record-by-user-id`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const createRecord = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/records/create`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const deleteRecord = async (id) => {
    const token = getToken();
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/records/delete/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const getRecordById = async (id) => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/records/get-record-by-id/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateRecordUserConfirm = async (id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/records/update-record-user-confirm/${id}`, {}, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateRecordSenderConfirm = async (id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/records/update-record-sender-confirm/${id}`, {}, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}