import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Row, Col, Drawer, Form, DatePicker, message } from 'antd';
import { reportProfit, filterProfitFood } from '../../apis/aaifood/index';
import moment from 'moment';
const list_order_agency = () => {
  const [profitToday, setProfitToday] = useState(null);
  const [profitWeek, setProfitWeek] = useState(null);
  const [profitMonth, setProfitMonth] = useState(null);
  const [profitAll, setProfitAll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [form] = Form.useForm();
  const [orderAgency, setOrderAgency] = useState([]);
  const [orderRetail, setOrderRetail] = useState([]);
  const [paymentSlip, setPaymentSlip] = useState([]);
  const [profit, setProfit] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await reportProfit();
      setProfitToday(response.profit_today);
      setProfitWeek(response.profit_this_week);
      setProfitMonth(response.profit_this_month);
      setProfitAll(response.profit_all);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);
  const showDrawerAgency = () => {
    setOpenSideBar(true);
  };
  const onClose = () => {
    setOpenSideBar(false);
  };
  const handleFilter = async (values) => {
    try {
      // Lấy giá trị ngày bắt đầu và ngày kết thúc từ form
      const { startDate, endDate } = values;
      // Tạo biến data chứa thông tin cần gửi
      const data = {
        startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
        endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
      };
      // Gửi request đến API backend
      const response = await filterProfitFood(data);
      setOrderRetail(response.data.all_order_retail);
      setOrderAgency(response.data.all_order_agency);
      setProfit(response.data.total_profit_all);
      setPaymentSlip(response.data.all_payment_slip);
      setIsSearched(true); // Đánh dấu là đã tìm kiếm
      setOpenSideBar(false);
      message.success('Tìm kiếm thành công!');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Đã xảy ra lỗi khi tìm kiếm!');
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
      render: (text) => {
        // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
        return text
          ? parseFloat(text).toLocaleString('en-US', {
              style: 'decimal',
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
          : '';
      },
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
      title: 'Người lập',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Thành tiền',
      dataIndex: 'order_total',
      key: 'order_total',
      render: (text) => {
        // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
        return text
          ? parseFloat(text).toLocaleString('en-US', {
              style: 'decimal',
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
          : '';
      },
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
      title: 'Người lập',
      dataIndex: 'name',
      key: 'name',
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

  const columns_payment_slip = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    { title: 'Tên chi phí', dataIndex: 'cost_name', key: 'cost_name' },
    {
      title: 'Số tiền',
      dataIndex: 'cost_total',
      key: 'cost_total',
      render: (text) => {
        // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
        return text
          ? parseFloat(text).toLocaleString('en-US', {
              style: 'decimal',
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
          : '';
      },
    },
    { title: 'Ghi chú', dataIndex: 'cost_description', key: 'cost_description' },
    { title: 'Ngày thanh toán', dataIndex: 'cost_date', key: 'cost_date' },
    {
      title: 'Ngày tạo phiếu',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => new Date(created_at).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
        <h3 style={{ marginBottom: '0' }}>Lợi nhuận</h3>
        <div>
          <Button type="primary" onClick={showDrawerAgency} style={{ marginBottom: '20px' }}>
            Tùy chọn
          </Button>
          <Drawer title="Lọc phiếu bán hàng" onClose={onClose} open={openSideBar}>
            <Form
              layout="vertical"
              form={form}
              onFinish={handleFilter} // Gọi hàm khi submit form
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

              {/* Nút Lọc và Reset */}
              <Form.Item>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button type="primary" htmlType="submit" style={{ flex: 1, height: '45px' }}>
                    Lọc
                  </Button>
                  <Button
                    type="default"
                    style={{ flex: 1, height: '45px' }}
                    onClick={() => form.resetFields()} // Reset form
                  >
                    Reset
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Drawer>
        </div>
        <div style={{ display: 'flex', alignContent: 'center' }}>
          <NavLink
            to={`/admin/aaifood/phieu-chi`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Button type="primary">Phiếu chi</Button>
          </NavLink>
        </div>
      </div>
      <hr />
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <div>
          <div>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row" span={6}>
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Hôm nay</h5>
                  <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitToday)}
                  </h4>
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Tuần này</h5>
                  <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitWeek)}
                  </h4>
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Tháng này</h5>
                  <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitMonth)}
                  </h4>
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Tất cả</h5>
                  <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitAll)}
                  </h4>
                </div>
              </Col>
            </Row>
          </div>
          {/* kết quả lọc */}
          {orderRetail.length > 0 || orderAgency.length > 0 || paymentSlip.length > 0 ? (
            <div style={{marginTop:'30px'}}>
              <h2 style={{color:'#6c2c91'}}>
                Tổng lợi nhuận: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profit)}
              </h2>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                {orderRetail.length > 0 && (
                  <Col className="gutter-row" span={24}>
                    <div  style={{ marginTop: '30px' }}>
                      <h3 style={{textAlign:'center', color:'#ff9b29'}}>Phiếu bán lẻ</h3>
                      <Table
                        className="table-responsive"
                        pagination={false}
                        dataSource={orderRetail}
                        columns={columns_orderRetail}
                        rowKey="suppliers_id"
                      />
                    </div>
                  </Col>
                )}
                {orderAgency.length > 0 && (
                  <Col className="gutter-row" span={24}>
                    <div style={{ marginTop: '30px' }}>
                      <h3 style={{textAlign:'center', color:'#ff9b29'}}>Phiếu đại lý</h3>
                      <Table
                        className="table-responsive"
                        pagination={false}
                        dataSource={orderAgency}
                        columns={columns_orderAgency}
                        rowKey="suppliers_id"
                      />
                    </div>
                  </Col>
                )}
                {paymentSlip.length > 0 && (
                  <Col className="gutter-row" span={24}>
                    <div style={{ marginTop: '30px' }}>
                      <h3 style={{textAlign:'center', color:'#ff9b29'}}>Phiếu chi</h3>
                      <Table
                        className="table-responsive"
                        pagination={false}
                        dataSource={paymentSlip}
                        columns={columns_payment_slip}
                        rowKey="suppliers_id"
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          ) : isSearched ? (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{textAlign:'center'}}>Không có dữ liệu nào phù hợp với tiêu chí lọc.</h3>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default list_order_agency;
