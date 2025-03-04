const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import {getToken} from "../../utility/localStorageControl";
import axios from 'axios';
import {createAxios} from "../../utility/createAxios";

const instanceAxios = createAxios();
export const getEmployees = async (data) => {
    const token = getToken();
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployee`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
export const createEmployees = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployee/create`);
    return response.data;
};
export const storeEmployees = async (data) => {
    console.log(data);
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployee`, data, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
};
export const deleteEmployees = async (id) => {
    try {
        const response = await axios.get(`${LARAVEL_SERVER}/api/delete_employee/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi xóa nhân sự.');
    }
};
export const updateEmployees = async (data, id) => {
    const response = await axios.put(`${LARAVEL_SERVER}/api/nvemployee/${id}`, data);
    return response.data;
};
export const showEmployees = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployee/${id}`);
    return response.data;
};
// ----------------------Hồ sơ nhân sự----------------------------------
export const getEmployeesFile = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/showEmployeeFile/${id}`);
    return response.data;
};

export const createEmployeesFile = async () => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployeefile/create`);
    return response.data;
};
// export const storeEmployeesFile = async (data) => {
//     const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployeefile`,data);
//     return response.data;
// };
// export const updateEmployeesFile = async (data,id) => {
//     const response = await axios.put(`${LARAVEL_SERVER}/api/nvemployeefile/${id}`,data);
//     return response.data;
// };
export const storeEmployeesFile = async (formData) => {
    try {
        const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployeefile`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lưu hồ sơ:', error);
        throw new Error(error.response?.data?.message || 'Lưu hồ sơ thất bại');
    }
};

export const updateEmployeesFile = async (formData, id) => {
    try {
        const response = await axios.post(`${LARAVEL_SERVER}/api/nvemployeefile/${id}?_method=PUT`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        throw new Error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
};
export const editEmployeesFile = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvemployeefile/${id}`);
    return response.data;
};

export const deleteEmployeesFile = async (id) => {
    const response = await axios.delete(`${LARAVEL_SERVER}/api/nvemployeefile/${id}`);
    return response.data;
};
//xin nghỉ phép
export const getemployeedayoff = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/getemployeedayoff`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
export const getAllUsers = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/auth/get-all`, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
export const saveemployeedayoff = async (data) => {
    const token = getToken();
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/storeemployeedayoff`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
export const getdayoffdetail = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/getdayoffdetail/${id}`);
    return response.data;
};

export const updatestatusdayoff = async (id, status) => {
    const token = getToken();
    const response = await instanceAxios.put(`${LARAVEL_SERVER}/api/updatestatusdayoff/${id}/${status}`, {}, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
export const listdayoff = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/listdayoff/${id}`);
    return response.data;
};
//Phòng ban
export const getdepartmentteam = async (id) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/getdepartmentteam/${id}`);
    return response.data;
};
export const storeDepartmentTeam = async (data) => {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvdepartmentteam`, data);
    return response.data;
};
export const updateDepartmentTeam = async (data, id) => {
    const response = await axios.put(`${LARAVEL_SERVER}/api/nvdepartmentteam/${id}`, data);
    return response.data;
};
export const getDepartment = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/nvdepartment`);
    return response.data;
};
export const storeDepartment = async (data) => {
    const response = await axios.post(`${LARAVEL_SERVER}/api/nvdepartment`, data);
    return response.data;
};
export const updateDepartment = async (data, id) => {
    const response = await axios.put(`${LARAVEL_SERVER}/api/nvdepartment/${id}`, data);
    return response.data;
};
export const employeeLogin = async () => {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/employeeLogin`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
}
export const updatEployeeLogin = async (formData) => {
    const token = getToken();
    const response = await axios.put(`${LARAVEL_SERVER}/api/update-employee-login`, formData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
export const updateEmployeeAvatar = async (formData) => {
    try {
        const token = getToken();
        const response = await axios.post(`${LARAVEL_SERVER}/api/updateEmployeeAvatar`, formData, {
            headers: {'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        throw new Error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
};
export const updateRoleUser = async (data) => {
    const response = await axios.post(`${LARAVEL_SERVER}/api/update_role_user`, data);
    return response.data;
};
export const getDepartEmployee = async (department_id) => {
    const token = getToken();
    const response = await axios.get(`${LARAVEL_SERVER}/api/list_employee_department/${department_id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
export const searchEmployee = async (data) => {
    const response = await axios.get(`${LARAVEL_SERVER}/api/search_employee`, data);
    return response.data;
};