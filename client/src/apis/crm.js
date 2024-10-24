// src/config/apiConfig.js
const API_BASE_URL = 'http://localhost:8000/api';

const API_ENDPOINTS = {
    departments: `${API_BASE_URL}/nvdepartment`, 
    departmentTeam: `${API_BASE_URL}/nvdepartmentteam`, 
    employee: `${API_BASE_URL}/nvemployee`, 
};

export default API_ENDPOINTS;
