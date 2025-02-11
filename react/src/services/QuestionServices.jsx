import axiosInstance from "../configs/axios";

const StoreQuestion = async (data) => {
    console.log('data:',data);
    const response = await axiosInstance.post('questions-store', data);
    console.log(response)
    return response;
};


// const getNameExam = async (id) => {
//     const response = await axiosInstance.get(`getNameExam/${id}`);
//     return response;    
// };

export { StoreQuestion };
