import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const token = getToken();
const instanceAxios = createAxios();
export const createProject = async (data) => {
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/projects/create`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateNameProject = async (data, id) => {
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/projects/update-name/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updateStartDateProject = async (data, id) => {
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/projects/update-start-date/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updateEndDateProject = async (data, id) => {
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/projects/update-end-date/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updateStatusProject = async (data, id) => {
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/projects/update-status/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const deleteProject = async (id) => {
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/projects/delete/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updateMemberProject = async (data, id) => {
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/projects/update-members/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const joinProject = async (data, id) => {
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/projects/member-join-project/${id}`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }}
    );
    return response.data;
}
export const getProjectByUserId = async () => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/projects/get-project-by-user-id`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }}
    );
    return response.data;
}