import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
import axios from "axios";

const instanceAxios = createAxios();
export const getAllUsers = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/auth/get-all`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export const registerDevice = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/devices/create`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const getNotifications = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/notifications/get-notification-by-user-id`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const getNotificationWarning = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/notifications/get-notification-warning-by-user-id`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const getNotificationPagination = async (url) => {
    const token = getToken();
    const response = await instanceAxios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updateStatusNotification = async (id, data) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/notifications/update-status/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const getProfile = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/auth/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updateProfile = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/auth/update-profile`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const changePassword = async (data) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/auth/change-password`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const forgotPassword = async (data) => {
    const response = await axios.post(`${LARAVEL_SERVER}/api/forgot-password`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
}