import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Popconfirm, message, Drawer, Form, DatePicker } from 'antd';
import { allOrder, deleteOrder } from '../../../apis/aaifood/index';
import moment from 'moment';
const list_order_agency = () => {
  const { path } = useRouteMatch();
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataAgency, setFilteredDataAgency] = useState([]);
  const [orderRetail, setOrderRetail] = useState([]);
  const [orderAgency, setOrderAgency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSideBarRetail, setOpenSideBarRetail] = useState(false);
  const [openSideBarAgency, setOpenSideBarAgency] = useState(false);
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

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      const response = await deleteOrder(record.order_id);
      if (response.success) {
        message.success('Xóa phiếu thu thành công');
        setLoading(false);
        fetchDocument();
      } else {
        message.error('Xóa phiếu thu thất bại');
      }
    } catch (error) {
      message.error('Xóa phiếu thu thất bại');
      setLoading(false);
    }
  };

  const showDrawer = () => {
    setOpenSideBarRetail(true);
  };
  const showDrawerAgency = () => {
    setOpenSideBarAgency(true);
  };

  const onClose = () => {
    setOpenSideBarRetail(false);
    setOpenSideBarAgency(false);
  };
  const onFilter = (values) => {
    const { startDate, endDate } = values;
    let filtered = orderRetail;

    if (startDate && endDate) {
      filtered = orderRetail.filter((order) => moment(order.order_date).isBetween(startDate, endDate, 'day', '[]'));
    } else if (startDate) {
      filtered = orderRetail.filter((order) => moment(order.order_date).isSame(startDate, 'day'));
    }
    if (filtered.length === 0) {
      message.warning('Không tìm thấy kết quả');
  }

    setFilteredData(filtered);
    setOpenSideBarRetail(false);
  };
  const onFilterAgency = (values) => {
    const { startDate, endDate } = values;
    let filtered = [];

    // Lọc dữ liệu theo khoảng thời gian
    if (startDate && endDate) {
        filtered = orderAgency.filter((order) =>
            moment(order.order_date, 'YYYY-MM-DD').isBetween(
                moment(startDate).startOf('day'),
                moment(endDate).endOf('day'),
                'day',
                '[]'
            )
        );
    } else if (startDate) {
        filtered = orderAgency.filter((order) =>
            moment(order.order_date, 'YYYY-MM-DD').isSame(moment(startDate).startOf('day'), 'day')
        );
    }

    // Hiển thị thông báo nếu không có kết quả
    if (filtered.length === 0) {
        message.warning('Không tìm thấy kết quả');
    }

    // Cập nhật state với dữ liệu đã lọc
    setFilteredDataAgency(filtered);
    setOpenSideBarAgency(false);
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
          <Button type="danger">Xóa</Button>
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
              children: (
                <div>
                  <Button type="primary" onClick={showDrawer} style={{ marginBottom: '20px' }}>
                    Tùy chọn
                  </Button>
                  <Drawer title="Lọc phiếu bán hàng" onClose={onClose} open={openSideBarRetail}>
                    <Form
                      layout="vertical"
                      onFinish={onFilter}
                      onReset={() => setFilteredData(orderRetail)} // Xử lý khi nhấn Reset
                    >
                      {/* Ngày bắt đầu */}
                      <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                      >
                        <DatePicker style={{ width: '100%', height: '45px', padding: '10px' }} />
                      </Form.Item>

                      {/* Ngày kết thúc */}
                      <Form.Item label="Ngày kết thúc" name="endDate">
                        <DatePicker style={{ width: '100%', height: '45px', padding: '10px' }} />
                      </Form.Item>

                      {/* Nút lọc và Reset */}
                      <Form.Item>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Button type="primary" htmlType="submit" style={{ flex: 1, height: '45px' }}>
                            Lọc
                          </Button>
                          <Button type="default" htmlType="reset" style={{ flex: 1, height: '45px' }}>
                            Reset
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  </Drawer>
                  <Table
                    columns={columns_orderRetail}
                    dataSource={filteredData.length > 0 ? filteredData : orderRetail}
                    rowKey="id"
                  />
                </div>
              ),
            },
            {
              label: 'Phiếu đại lý',
              key: '2',
              children: (
                <div>
                  <Button type="primary" onClick={showDrawerAgency} style={{ marginBottom: '20px' }}>
                    Tùy chọn
                  </Button>
                  <Drawer title="Lọc phiếu bán hàng" onClose={onClose} open={openSideBarAgency}>
                    <Form
                      layout="vertical"
                      onFinish={onFilterAgency}
                      onReset={() => setFilteredDataAgency(orderAgency)} // Xử lý khi nhấn Reset
                    >
                      {/* Ngày bắt đầu */}
                      <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                      >
                        <DatePicker style={{ width: '100%', height: '45px', padding:'10px'}} />
                      </Form.Item>

                      {/* Ngày kết thúc */}
                      <Form.Item label="Ngày kết thúc" name="endDate">
                        <DatePicker style={{ width: '100%', height: '45px' , padding:'10px'}} />
                      </Form.Item>

                      {/* Nút lọc và Reset */}
                      <Form.Item>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Button type="primary" htmlType="submit" style={{ flex: 1, height: '45px' }}>
                            Lọc
                          </Button>
                          <Button type="default" htmlType="reset" style={{ flex: 1, height: '45px' }}>
                            Reset
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  </Drawer>
                  <Table
                    columns={columns_orderAgency}
                    dataSource={filteredDataAgency.length > 0 ? filteredDataAgency : orderAgency}
                    rowKey="id"
                  />
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default list_order_agency;
