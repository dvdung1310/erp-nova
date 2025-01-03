import { getToken } from '../../utility/localStorageControl';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import { createAxios } from '../../utility/createAxios';
import axios from 'axios';
const instanceAxios = createAxios();
const token = getToken();
export const allSuppliers = async (data) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/all_suppliers`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const storeSuppliers = async (data) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_suppliers`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const updateSuppliers = async (data, id) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/update_suppliers/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const allProduct = async (data) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/all_product`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const storeProduct = async (data) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_product`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const updateProduct = async (data, id) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/update_product/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const allAgency = async (data) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/all_agency`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const storeAgency = async (data) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_agency`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const updateAgency = async (data, id) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/update_agency/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
// export const allOrder = async (data) => {
//   const response = await axios.get(`${LARAVEL_SERVER}/api/all_order`, {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };
export const allOrder = async (data) => {
  try {
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/all_order`, {
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
export const createOrder = async (data) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/create_bill`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const storeOrderRetail = async (payload) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_order_retail`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const storeOrderHandmade = async (formData) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_order_handmade`, formData, {
    headers: {
     'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
   
  });
  return response.data;
};
export const storeOrderAgency = async (payload) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_order_agency`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const allPaymentSlip = async () => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/all_payment_slip`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const storePaymentSlip = async (data) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/store_payment_slip`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
// export const reportProfit = async () => {
//   const response = await axios.get(`${LARAVEL_SERVER}/api/revenue`, {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };
export const reportRevenue = async () => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/report_revenue`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const OrderDetail = async (order_id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/order_detail/${order_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const deleteOrder = async (order_id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/delete_order/${order_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const deleteCost = async (cost_id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/delete_payment_slip/${cost_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const updateCost = async (data, cost_id) => {
  const response = await axios.post(`${LARAVEL_SERVER}/api/update_payment_slip/${cost_id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const checkRoleUser = async (data) => {
  try {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/check_role_food`, {
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
export const resultPayment = async (orderCode) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/result_payment_success/${orderCode}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const confirmPayment = async (order_id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/confirm_payment/${order_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const confirmPaymentChange = async (order_id) => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/confirm_payment_change/${order_id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
// export const filterRevenueFood = async (data) => {
//   const response = await axios.get(`${LARAVEL_SERVER}/api/filter_revenue_food`, {
//     params: data, // Dữ liệu được gửi qua query string
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };
export const filterRevenueFood = async (data) => {
  try {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/filter_revenue_food`, {
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
export const filterProfitFood = async (data) => {
  try {
    const token = getToken();
    const response = await instanceAxios.get(`${LARAVEL_SERVER}/api/filter_profit_food`, {
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
export const reportProfit = async () => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/report_profit`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const orderDeliveryStatus = async (order_id, newStatus) => {
  try {
    // Gửi yêu cầu POST với order_id và trạng thái mới
    const response = await axios.post(
      `${LARAVEL_SERVER}/api/order_delivery_status`,
      {
        order_id: order_id,
        shipping_status: newStatus, // Gửi trạng thái mới
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Đảm bảo token hợp lệ
        },
      },
    );
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error(error);
    throw error; // Ném lỗi nếu có
  }
};
export const createHandmadeSales = async () => {
  const response = await axios.get(`${LARAVEL_SERVER}/api/all_payment_slip`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
