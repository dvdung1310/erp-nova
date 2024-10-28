import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios =  createAxios();
const token = getToken();
export const getGroupByUserId = async () => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/groups/get-by-user-id`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const getGroupByParentId = async (id) => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/groups/get-group-by-parent-group-id/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const createGroup = async (data) => {
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/groups/create`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateGroup = async (data, id) => {
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/groups/update/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const deleteGroup = async (id) => {
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/groups/delete/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const getGroupByCeo = async () => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/groups/get-by-ceo`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}