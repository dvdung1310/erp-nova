// import {createAxios} from "../utility/createAxios";
// const axiosInstance = createAxios();
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import axios from "axios";

export const login = async (data) => {
    console.log(LARAVEL_SERVER)
    const response = await axios.post(`${LARAVEL_SERVER}/api/auth/login`, data);
    return response.data;
};