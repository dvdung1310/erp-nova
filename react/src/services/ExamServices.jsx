import axiosInstance from "../configs/axios";

const ExamServices = async (data) => {
    const response = await axiosInstance.post('exams', data);
    return response;
};

const getAllExams = async () => {
    const response = await axiosInstance.get('exams-index');
    return response;
};

const deleteExam = async (id) => {
    const response = await axiosInstance.delete(`exams/${id}`);
    return response;    
};

const getNameExam = async (id) => {
    const response = await axiosInstance.get(`getNameExam/${id}`);
    return response;    
};

export { ExamServices , getAllExams , deleteExam , getNameExam };
