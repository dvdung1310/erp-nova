import axiosInstance from "../config/axios";

export const saveWorkSchedule = async (scheduleData) => {
    try {
        const response = await axiosInstance.post('/workschedule', { schedule: scheduleData });
        return response.data;
    } catch (error) {
        console.error('Error saving work schedule:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const fullWorkSchedule = async (month) => {
    const response = await axiosInstance.get(`/getWorkSchedulesByMonth/${month}`);
    return response;
  };
