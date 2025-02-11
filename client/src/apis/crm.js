// src/config/apiConfig.js
const API_BASE_URL = process.env.REACT_APP_LARAVEL_SERVER;
// const API_BASE_URL = 'http://localhost:8000/api';

const API_ENDPOINTS = {
    departments: `${API_BASE_URL}/api/nvdepartment`, 
    departmentTeam: `${API_BASE_URL}/api/nvdepartmentteam`, 
};
export default API_ENDPOINTS;

