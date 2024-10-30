import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();

export const getTasks = async (project_id) => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/tasks/get-task-by-project-id/${project_id}`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const createTask = async (task) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/tasks/create`, task, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateNameTask = async (data, id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/tasks/update-name/${id}`, data, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateStatusTask = async (data, id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/tasks/update-status/${id}`, data, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateStartDateTask = async (data, id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/tasks/update-start-date/${id}`, data, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateEndDateTask = async (data, id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/tasks/update-end-date/${id}`, data, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const updateMemberTask = async (data, id) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/tasks/update-members/${id}`, data, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const deleteTask = async (id) => {
    const token = getToken();
    const response = await instanceAxios.delete(`${LARAVEL_SERVER}/api/tasks/delete/${id}`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const getTaskUnfinishedByUserId = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/tasks/get-task-unfinished-by-user-id`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const getCommentByTask = async (id) => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/tasks/get-message-by-task/${id}`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    })
    return response.data
}
export const createComment = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/tasks/create-message`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    return response.data
}
export const createCommentFile = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/tasks/create-message`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        }
    )
    return response.data
}

