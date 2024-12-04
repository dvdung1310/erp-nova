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
                    'Content-Type': 'multipart/form-data',
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
                ...config,
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
export const showFileShare = async (id) => {
    try {
      const response = await axios.get(`${LARAVEL_SERVER}/api/show-file-share/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
export const shareFile = async (id, data) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/share-file/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  export const showFolderShare = async (id) => {
    try {
      const response = await axios.get(`${LARAVEL_SERVER}/api/show-folder-share/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
};
export const shareFolder = async (id, data) => {
    try {
      const response = await axios.post(`${LARAVEL_SERVER}/api/share-folder/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error Customer:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  export const myDocument = async (data) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/my-document`,
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
export const myDocumentShare = async (data) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/document-share-me`,
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
export const trashDocument = async (data) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/document-trash`,
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
export const reStoreFile = async (id) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/re-store/${id}`, 
          
            {
                headers: {
                    'Content-Type': 'application/json',
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
export const removeFile = async (id) => {
    try {
        const response = await instanceAxios.get(
            `${LARAVEL_SERVER}/api/remove-file/${id}`, 
          
            {
                headers: {
                    'Content-Type': 'application/json',
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