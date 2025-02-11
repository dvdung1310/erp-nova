import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
export const createPost = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/socials/posts/create`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
}
export const getAllPosts = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/socials/posts/get-all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
}
export const createOrUpdateReaction = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/socials/posts/reactions/create`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
}
export const deletePost = async (id) => {
    const token = getToken();
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/socials/posts/delete/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data;
}