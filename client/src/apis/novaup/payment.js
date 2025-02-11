import { getToken } from '../../utility/localStorageControl';

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import { createAxios } from '../../utility/createAxios';
const instanceAxios = createAxios();
const token = getToken();
export const storePayment = async (formData) => {
  try {
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/storePayment`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error Payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updatePayment = async (formData) => {
  try {
    const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/updatePayment`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error Payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const ListPayment = async () => {
  try {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/indexPayment`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error Payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const DeletePayment = async (id) => {
  try {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/deletePayment/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error Payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getBookingConnectCumstomer = async () => {
  try {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/getBookingConnectCumstomer`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error Payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const allReceiptsNovaup = async (data) => {
  try {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/all_recipts_novaup`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error checking download file:', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const storeReceiptsNovaUp = async (payload) => {
  const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/store_receipts_novaup`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const reportRevenue = async () => {
  const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/report_revenue_novaup`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const filterRevenueNovaup = async (data) => {
  try {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/novaup/filter_revenue_novaup`, {
      params: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error :', error.response ? error.response.data : error.message);
    throw error;
  }
};
export const storeOrderHandmade = async (formData) => {
  const response = await instanceAxios.post(`${LARAVEL_SERVER}/api/novaup/store_order_handmade_novaup`, formData, {
    headers: {
     'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
   
  });
  return response.data;
};
