import {createAxios} from "../utility/createAxios";

import {getToken} from "../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import axios from "axios";

const instanceAxios = createAxios();


export const login = async (data) => {
    const token = getToken();
    const response = await axios.post(`${LARAVEL_SERVER}/api/auth/login`, data);
    return response.data;
};
export const logout = async () => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/auth/logout`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}