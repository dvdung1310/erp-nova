import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
const token = getToken();
export const getAllUsers = async () => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/auth/get-all`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}