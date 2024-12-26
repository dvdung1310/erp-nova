import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Table, Spin, Button } from 'antd';
import { allPaymentSlip } from '../../apis/aaifood/index';
import moment from 'moment';
const turnover = () => {
  const [dataSource, setDataSource] = useState([]);
  const [totalPaymentSlip, setTotalPaymentSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allPaymentSlip();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setDataSource(response.data);
      setTotalPaymentSlip(response.total_payment_slip);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);
  const handleDelete = (record) => {
    console.log('Xóa bản ghi:', record);
    // Thêm logic xóa ở đây, ví dụ: gọi API hoặc cập nhật danh sách
  };
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1, // Tính số thứ tự dựa trên index
    },
    { title: 'Tên chi phí', dataIndex: 'cost_name', key: 'cost_name' },
    { title: 'Số tiền', dataIndex: 'cost_total', key: 'cost_total', render: (text) => `${text.toLocaleString()}` },

    { title: 'Ghi chú', dataIndex: 'cost_description', key: 'cost_description' },
    { title: 'Ngày thanh toán', dataIndex: 'cost_date', key: 'cost_date' },
    {
      title: 'Ngày tạo phiếu',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => new Date(created_at).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="primary" style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button type="danger" onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '30px' }}>
        <h3 style={{marginBottom:'0'}}>Danh sách phiếu chi</h3>
        <h3 style={{marginBottom:'0'}}>Tổng chi: {totalPaymentSlip?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h3>
        <div style={{ display: 'flex', alignContent: 'center' }}>
          <NavLink
            to={`/admin/aaifood/tao-phieu-chi`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Button type="primary">Tạo phiếu chi</Button>
          </NavLink>
        </div>
      </div>
      <hr />
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <Table
          className="table-responsive"
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          rowKey="suppliers_id"
        />
      )}
    </div>
  );
};

export default turnover;
