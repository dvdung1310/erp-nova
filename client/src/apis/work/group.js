import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
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