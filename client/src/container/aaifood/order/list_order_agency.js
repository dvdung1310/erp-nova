import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Popconfirm,message } from 'antd';
import { allOrder,deleteOrder } from '../../../apis/aaifood/index';
import moment from 'moment';
const list_order_agency = () => {
  const { path } = useRouteMatch();
  const [orderRetail, setOrderRetail] = useState([]);
  const [orderAgency, setOrderAgency] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allOrder();
      console.log('====================================');
      console.log(path);
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

  const handleDelete = async(record) => {
    try {
      setLoading(true);
      const response = await deleteOrder(record.order_id);
      if(response.success){
        message.success('Xóa phiếu thu thành công');
        setLoading(false);
        fetchDocument();
      }
      else{
        message.error('Xóa phiếu thu thất bại');
      }
    } catch (error) {
      message.error('Xóa phiếu thu thất bại');
      setLoading(false);
    }
  };
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
      render: (text) => moment(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (text, record) => (
        <NavLink to={`/admin/aaifood/chi-tiet-phieu-thu/${record.order_id}`} activeClassName="active-link">
          <Button type="primary">Chi tiết</Button>
        </NavLink>
        //  <NavLink to={`${path}/chi-tiet/${record.order_id}`}>Chi tiết</NavLink>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa bản ghi này?"
          onConfirm={() => handleDelete(record)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="danger" >
            Xóa
          </Button>
        </Popconfirm>
      ),
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
    {
      title: 'Chi tiết',
      key: 'details',
      render: (text, record) => (
        <NavLink to={`/admin/aaifood/chi-tiet-phieu-thu/${record.order_id}`} activeClassName="active-link">
          <Button type="primary">Chi tiết</Button>
        </NavLink>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '30px' }}>
        <h3>Danh sách phiếu bán hàng</h3>
        <div style={{ display: 'flex', alignContent: 'center' }}>
          <NavLink
            to={`/admin/aaifood/tao-phieu-ban-le`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              marginRight: '15px',
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
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default list_order_agency;
