// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Cards } from '../../../components/cards/frame/cards-frame';
// import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select } from 'antd';
// import { OrderDetail, storeAgency, updateAgency } from '../../../apis/aaifood/index';
// const order_detail = () => {
//   const { order_id } = useParams();
//   const [dataSource, setDataSource] = useState([]);
//     const [loading, setLoading] = useState(true);

//    const fetchDocument = async () => {
//       try {
//         setLoading(true);
//         const response = await OrderDetail(order_id);
//         console.log('====================================');
//         console.log(response);
//         console.log('====================================');
//         setDataSource(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching ListSource:', error);
//         setLoading(false);
//       }
//     };

//     useEffect(() => {
//       fetchDocument();
//     }, []);

//     const columns = [
//         { title: 'Sản phẩm', dataIndex: 'product_name', key: 'product_name' },
//         { title: 'Số lượng', dataIndex: 'product_quantity', key: 'product_quantity' },
//         {
//           title: 'Giá bán',
//           dataIndex: 'product_price_output',
//           key: 'product_price_output',
//           render: (text) => {
//             // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
//             return text ? parseFloat(text).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '';
//           },
//         },
//         { title: 'Hạn sử dụng', dataIndex: 'product_shelf_life', key: 'product_shelf_life' },
//       ];
//   return (
//     <div>
//         <Row gutter={15}>
//         <Col xs={24}>
//           <Cards title="Chi tiết phiếu thu">
//             {loading ? (
//               <div className="spin">
//                 <Spin />
//               </div>
//             ) : (
//               <Table
//                 className="table-responsive"
//                 pagination={false}
//                 dataSource={dataSource}
//                 columns={columns}
//                 rowKey="order_id"
//               />
//             )}
//           </Cards>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default order_detail;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Divider, Row, Spin } from 'antd';
import { resultPayment } from '../../../apis/aaifood/index';
import './style.css';
const PaymentResult = () => {
  const { orderCode } = useParams(); // Lấy orderCode từ URL segment
  const [bill, setBill] = useState([]);
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await resultPayment(orderCode);
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setCustomer(response.customer);
      setBill(response.order_detail);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [orderCode]);
  return (
    <div style={{ padding: '30px', background: '#fff' }}>
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{ display: 'flex', justifyContent: 'center' }}>
          <Col className="gutter-row" span={8}>
            <div className="box_info_customer">
              <h1>Thông tin khách hàng</h1>
              <div>
                <ul>
                  <li>Khách hàng : {customer.customer_name}</li>
                  <li>Số điện thoại : {customer.customer_phone}</li>
                  <li>Địa chỉ : {customer.customer_address}</li>
                  <li>
                    Trạng thái thanh toán:
                    {customer.payos_status === 0 ? (
                      <span style={{ color: '#DB3C29' }}>Chưa thanh toán</span>
                    ) : customer.payos_status === 1 ? (
                      <span style={{ color: '#3868DC' }}>Đã thanh toán</span>
                    ) : customer.payos_status === 2 ? (
                      <span style={{ color: '#16DB45' }}>Đã xác nhận</span>
                    ) : (
                      'Không xác định'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </Col>
          <Col className="gutter-row" span={16}>
            <div className="box_bill_payment">
              <h3>Đơn hàng của {customer.customer_name}</h3>
              <table className="bill-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>SẢN PHẨM</th>
                    <th style={{ textAlign: 'right' }}>TẠM TÍNH</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'left' }}>
                        {item.product_name} <b>× {item.product_quantity}</b>
                      </td>
                      <td style={{ textAlign: 'right', color: '#ff8800' }}>
                        <b>{parseFloat(item.product_output_price).toLocaleString()} VND</b>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ textAlign: 'left' }}>
                      <b>Giao hàng</b>
                    </td>
                    <td style={{ textAlign: 'right' }}>Free shipping</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}>
                      <b>Tổng tiền</b>
                    </td>
                    <td style={{ textAlign: 'right', color: '#ff8800' }}>
                      <b> {parseFloat(customer.order_total).toLocaleString()} VND</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PaymentResult;
