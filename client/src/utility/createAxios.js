import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {getToken, setItem} from "./localStorageControl";

const LARAVEL_SERVER = process.env.LARAVEL_SERVER;
const refreshToken = async () => {
    try {
        const res = await axios.post(`${LARAVEL_SERVER}api/auth/refresh`, {}, {
            withCredentials: true,
        });
        return res.data.accessToken;
    } catch (err) {
        console.log(err);
    }
};
export const createAxios = () => {
    const newInstance = axios.create({
        baseURL: `${LARAVEL_SERVER}`
    });
    newInstance.interceptors.request.use(
        async (config) => {
            const date = new Date();
            const accessToken = getToken();
            const decodedToken = jwtDecode(accessToken);
            if (decodedToken.exp < date.getTime() / 1000) {
                const dataRefresh = await refreshToken();
                setItem("accessToken", dataRefresh.accessToken)
                config.headers.Authorization = `Bearer ${dataRefresh?.accessToken}`;
            }
            return config;
        },
        (err) => {
            return Promise.reject(err);
        }
    );
    return newInstance;
};