import {getToken} from "../../utility/localStorageControl";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
const instanceAxios = createAxios();
const token = getToken();
export const saveWorkSchedule = async (scheduleData, token) => {
    try {
        const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/workschedule`, { schedule: scheduleData }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving work schedule:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const fullWorkSchedule = async (month) => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/getWorkSchedulesByMonth/${month}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export const getWorkScheduleForWeekByUserId = async () => {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/getWorkScheduleForWeekByUserId`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};
