import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Table, Spin, Button } from 'antd';
import { allOrder } from '../../../apis/aaifood/index';
import moment from 'moment';
const list_order_agency = () => {
  const [orderRetail, setOrderRetail] = useState([]);
  const [orderAgency, setOrderAgency] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allOrder();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setOrderRetail(response.order_retail);
      setOrderAgency(response.order_agency);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);
  const columns_orderRetail = [
    {
      title: 'ID',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'SĐT',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'customer_address',
      key: 'customer_address',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'order_total',
      key: 'order_total',
      render: (text) => `${text.toLocaleString()}`,
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'order_date',
      key: 'order_date',
    },
    {
      title: 'Ngày lập phiếu',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD'), // Định dạng ngày/tháng/năm
    },
  ];
  const columns_orderAgency = [
    {
      title: 'ID',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'agency_name',
      key: 'agency_name',
    },
    {
      title: 'SĐT',
      dataIndex: 'agency_phone',
      key: 'agency_phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'agency_address',
      key: 'agency_address',
    },
    {
      title: 'Cấp đại lý',
      dataIndex: 'agency_level',
      key: 'agency_level',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'order_total',
      key: 'order_total',
      render: (text) => `${text.toLocaleString()}`,
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'order_date',
      key: 'order_date',
    },
    {
      title: 'Ngày lập phiếu',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD'), // Định dạng ngày/tháng/năm
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex',justifyContent: 'space-between',alignContent: 'center', marginBottom: '30px' }}>
        <h3>Danh sách phiếu bán hàng</h3>
        <div style={{ display: 'flex',alignContent: 'center' }}>
          <NavLink
            to={`/admin/aaifood/tao-phieu-ban-le`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              marginRight: '15px'
            }}
          >
            <Button type="primary">Tạo phiếu bán lẻ</Button>
          </NavLink>
          <NavLink
            to={`/admin/aaifood/tao-phieu-ban-dai-ly`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Button type="primary">Tạo phiếu bán đại lý</Button>
          </NavLink>
        </div>
      </div>
      <Tabs
        defaultActiveKey="1"
        centered
        items={[
          {
            label: 'Phiếu bán lẻ',
            key: '1',
            children: <Table columns={columns_orderRetail} dataSource={orderRetail} rowKey="id" />,
          },
          {
            label: 'Phiếu đại lý',
            key: '2',
            children: <Table columns={columns_orderAgency} dataSource={orderAgency} rowKey="id" />,
          },
        ]}
      />
    </div>
  );
};

export default list_order_agency;
