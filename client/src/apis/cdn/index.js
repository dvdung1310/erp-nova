import {getToken} from "../../utility/localStorageControl";
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {createAxios} from "../../utility/createAxios";
import axios from 'axios';
const instanceAxios = createAxios();
const token = getToken();
export const allDocument = async (data) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/all-document`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const storeFolder = async (data) => {
    try {
        const response = await instanceAxios.post(
            `${LARAVEL_SERVER}/api/store-folder`,data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const storeFile = async (data) => {
    try {
        const response = await instanceAxios.post(
            `${LARAVEL_SERVER}/api/store-file`,data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const renameFolder = async (folderName, id) => {
    try {
        const response = await instanceAxios.post(
            `${LARAVEL_SERVER}/api/rename-folder/${id}`,
            { file_name: folderName }, // Truyền dưới dạng object
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const deleteFile = async (id) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/delete-file/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const showFolder = async (id) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/show-folder/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const storeFolderChild = async (data) => {
    try {
        const response = await instanceAxios.post(
            `${LARAVEL_SERVER}/api/store-folder-child/${data.id}`, 
            data, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Error Customer:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const storeFolderFile = async (formData, config, id) => {
    try {
        const response = await instanceAxios.post(
            `${LARAVEL_SERVER}/api/store-folder-file/${id}`, // Use id in the URL
            formData,
            {
                ...config, // Include the upload progress configuration
                headers: {
                    'Content-Type': 'multipart/form-data', // Required for file uploads
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Error uploading files:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const checkDownloadFile = async (id) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/check-download-file/${id}`, 
          
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Error uploading files:', error.response ? error.response.data : error.message);
        throw error;
    }
};