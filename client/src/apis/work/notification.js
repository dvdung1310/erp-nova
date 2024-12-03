import {createAxios} from "../../utility/createAxios";
import {getToken} from "../../utility/localStorageControl";

const instanceAxios = createAxios();
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;


export const createNotification = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/notifications/create`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;

}
export const getNotificationById = async (id) => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/notifications/get-notification-by-id/${id}`, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}