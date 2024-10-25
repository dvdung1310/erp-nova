import axiosInstance from "../../config/axios";

export const storeExam = async (formData) => {
    try {
        // Không bao formData bên trong một đối tượng
        const response = await axiosInstance.post('/store-exams', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', 
            },
        });
        return response;
    } catch (error) {
        console.error('Error saving exam:', error.response ? error.response.data : error.message);
        throw error;
    }
};

