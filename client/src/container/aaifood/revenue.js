import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Row, Col, Drawer, Form, DatePicker, message, Select } from 'antd';
import { reportRevenue, filterRevenueFood, checkRoleUser } from '../../apis/aaifood/index';
import moment from 'moment';
const { Option } = Select;
import * as XLSX from 'xlsx';
const list_order_agency = () => {
  const [revenueToday, setProfitToday] = useState(null);
  const [revenueWeek, setRevenueWeek] = useState(null);
  const [revenueMonth, setRevenueMonth] = useState(null);
  const [revenueAll, setRevenueAll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [form] = Form.useForm();
  const [orderAgency, setOrderAgency] = useState([]);
  const [orderRetail, setOrderRetail] = useState([]);
  const [listSales, setListSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await reportRevenue();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setProfitToday(response.revenue_today);
      setRevenueWeek(response.revenue_week);
      setRevenueMonth(response.revenue_month);
      setRevenueAll(response.revenue_all_time);
      setListSales(response.list_sales);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };
  const fetchRole = async () => {
    try {
      setLoading(true);
      const response = await checkRoleUser();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setRoleUser(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDocument();
    fetchRole();
  }, []);
  const showDrawerAgency = () => {
    setOpenSideBar(true);
  };
  const onClose = () => {
    setOpenSideBar(false);
  };
  const handleFilter = async (values) => {
    try {
      // Lấy giá trị từ form
      const { startDate, endDate, sale_id } = values;

      // Tạo biến data chứa thông tin cần gửi
      const data = {
        startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
        endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
        sale_id,
      };

      // Gửi request đến API backend
      const response = await filterRevenueFood(data);

      // Kiểm tra và gán giá trị nếu có dữ liệu trả về
      if (response.data.success) {
        // Kiểm tra các giá trị có tồn tại trong response
        console.log('====================================');
        console.log('lọc', response);
        console.log('====================================');
        setOrderRetail(response.data.all_order_retail || []); // Mặc định là mảng rỗng nếu không có dữ liệu
        setOrderAgency(response.data.all_order_agency || []); // Mặc định là mảng rỗng nếu không có dữ liệu
        setTotalRevenue(response.data.total_revenue || 0); // Mặc định là 0 nếu không có dữ liệu
        setIsSearched(true);
        message.success('Tìm kiếm thành công!');
        setOpenSideBar(false);
      } else {
        // Nếu response không có dữ liệu, thông báo lỗi
        message.error('Không có dữ liệu trả về từ API!');
      }
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
  const exportToExcel = () => {
    if (orderRetail.length > 0 || orderAgency.length > 0) {
      const workbook = XLSX.utils.book_new();
  
      // Đổi tên cột và thêm sheet cho dữ liệu bán lẻ nếu có
      if (orderRetail.length > 0) {
        const retailData = orderRetail.map(item => ({
          'ID': item.id,
          'Khách hàng': item.customer_name,
          'SĐT': item.customer_phone,
          'Địa chỉ': item.customer_address,
          'Tổng tiền': item.order_total,
          'Ngày thanh toán': item.order_date,
          'Sale': item.name,
        }));
        const worksheetRetail = XLSX.utils.json_to_sheet(retailData);
        XLSX.utils.book_append_sheet(workbook, worksheetRetail, 'Phiếu Bán Lẻ');
      }
  
      // Đổi tên cột và thêm sheet cho dữ liệu đại lý nếu có
      if (orderAgency.length > 0) {
        const agencyData = orderAgency.map(item => ({
          'Mã Đại Lý': item.agency_id,
          'Tên Đại Lý': item.agency_name,
          'SĐT': item.agency_phone,
          'Tổng tiền': item.order_total,
          'Ngày thanh toán': item.order_date,
          'Sale': item.name,
        }));
        const worksheetAgency = XLSX.utils.json_to_sheet(agencyData);
        XLSX.utils.book_append_sheet(workbook, worksheetAgency, 'Phiếu Đại Lý');
      }
  
      // Lưu file Excel
      XLSX.writeFile(
        workbook,
        `DoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } else {
      alert('Không có dữ liệu để xuất Excel!');
    }
  };
  
  
  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
        <h3 style={{ marginBottom: '0' }}>Doanh thu</h3>
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
              <Form.Item label="Ngày bắt đầu" name="startDate">
                <DatePicker style={{ width: '100%', height: '45px', padding: '10px' }} />
              </Form.Item>

              {/* Ngày kết thúc (chỉ hiển thị nếu department_id === 1 hoặc 8) */}
              <Form.Item label="Ngày kết thúc" name="endDate">
                <DatePicker style={{ width: '100%', height: '45px', padding: '10px' }} />
              </Form.Item>

              {/* Danh sách Sale (chỉ hiển thị nếu department_id === 1 hoặc 8) */}
              {roleUser && (roleUser.role_id === 1 || roleUser.department_id === 8) ? (
                <Form.Item label="Danh sách Sale" name="sale_id">
                  <Select
                    placeholder="Chọn Sale"
                    style={{ width: '100%', height: '45px' }}
                    options={listSales.map((sale) => ({
                      label: sale.name,
                      value: sale.id,
                    }))}
                  />
                </Form.Item>
              ) : null}

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
              <Col className="gutter-row" xs={24} sm={12} md={6}>
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
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueToday)}
                  </h4>
                </div>
              </Col>
              <Col className="gutter-row" xs={24} sm={12} md={6}>
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
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueWeek)}
                  </h4>
                </div>
              </Col>
              <Col className="gutter-row" xs={24} sm={12} md={6}>
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
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueMonth)}
                  </h4>
                </div>
              </Col>
              <Col className="gutter-row" xs={24} sm={12} md={6}>
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
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueAll)}
                  </h4>
                </div>
              </Col>
            </Row>
          </div>
          {/* kết quả lọc */}
          {orderRetail.length > 0 || orderAgency.length > 0 ? (
            <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#6c2c91' }}>
                  Tổng doanh thu:{' '}
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                </h2>
                <button
                  type="button"
                  onClick={exportToExcel}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c2c91',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Xuất file Excel
                </button>
              </div>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                {orderRetail.length > 0 && (
                  <Col className="gutter-row" span={24}>
                    <div style={{ marginTop: '30px' }}>
                      <h3 style={{ textAlign: 'center', color: '#ff9b29' }}>Phiếu bán lẻ</h3>
                      <Table
                        className="table-responsive"
                        pagination={false}
                        dataSource={orderRetail}
                        columns={columns_orderRetail}
                        rowKey="suppliers_id"
                        scroll={{ x: 1000 }}
                      />
                    </div>
                  </Col>
                )}
                {orderAgency.length > 0 && (
                  <Col className="gutter-row" span={24}>
                    <div style={{ marginTop: '30px' }}>
                      <h3 style={{ textAlign: 'center', color: '#ff9b29' }}>Phiếu đại lý</h3>
                      <Table
                        className="table-responsive"
                        pagination={false}
                        dataSource={orderAgency}
                        columns={columns_orderAgency}
                        rowKey="suppliers_id"
                        scroll={{ x: 1000 }}
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          ) : isSearched ? (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ textAlign: 'center' }}>Không có dữ liệu nào phù hợp với tiêu chí lọc.</h3>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default list_order_agency;
