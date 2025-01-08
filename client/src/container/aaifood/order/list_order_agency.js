import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Popconfirm, message, Drawer, Form, DatePicker ,Modal} from 'antd';
import {
  allOrder,
  deleteOrder,
  confirmPayment,
  confirmPaymentChange,
  checkRoleUser,
  orderDeliveryStatus,
} from '../../../apis/aaifood/index';
import moment from 'moment';
import { FaEye } from 'react-icons/fa';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const list_order_agency = () => {
  const { path } = useRouteMatch();
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataAgency, setFilteredDataAgency] = useState([]);
  const [orderRetail, setOrderRetail] = useState([]);
  const [orderAgency, setOrderAgency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSideBarRetail, setOpenSideBarRetail] = useState(false);
  const [openSideBarAgency, setOpenSideBarAgency] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [invoiceImage, setInvoiceImage] = useState('');
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allOrder();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setOrderRetail(response.data.order_retail);
      setOrderAgency(response.data.order_agency);
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
          '[]',
        ),
      );
    } else if (startDate) {
      filtered = orderAgency.filter((order) =>
        moment(order.order_date, 'YYYY-MM-DD').isSame(moment(startDate).startOf('day'), 'day'),
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
  const handleConfirmPayment = async (record) => {
    try {
      setLoading(true);
      const response = await confirmPayment(record.order_id);
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      if (response.success) {
        message.success('Cập nhật trạng thái thành công');
        setLoading(false);
        fetchDocument();
      } else {
        message.error('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
      setLoading(false);
    }
  };
  const handleConfirmChage = async (record) => {
    try {
      setLoading(true);
      const response = await confirmPaymentChange(record.order_id);
      if (response.success) {
        message.success('Cập nhật trạng thái thành công');
        setLoading(false);
        fetchDocument();
      } else {
        message.error('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
      setLoading(false);
    }
  };
  const handleShippingStatusChange = async (record, newStatus) => {
    try {
      if (newStatus === null) {
        message.info('Đơn hàng đã ở trạng thái cuối cùng.');
        return;
      }

      // Gửi yêu cầu cập nhật trạng thái vận chuyển
      const response = await orderDeliveryStatus(record.order_id, newStatus); // Truyền đúng tham số

      if (response.success) {
        // Kiểm tra kết quả trả về
        message.success('Cập nhật trạng thái vận chuyển thành công!');
        // Cập nhật lại dữ liệu bảng nếu cần thiết
        fetchDocument();
      } else {
        message.error('Cập nhật trạng thái vận chuyển thất bại!');
      }
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái vận chuyển!');
    }
  };
  const showModal = (image) => {
    const baseUrl = LARAVEL_SERVER;
    const fullImageUrl = `${baseUrl}/${image}`; 
    setInvoiceImage(fullImageUrl);
    setIsModalVisible(true);
  };

  // Function to handle modal close
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const canEdit = roleUser && (roleUser.department_id === 1 || (roleUser.department_id === 8&& roleUser.level_id === 23) || roleUser.role_id === 1);
  const canClick =
    roleUser &&
    (roleUser.department_id === 9 ||
      roleUser.department_id === 1 ||
      (roleUser.department_id === 8&& roleUser.level_id === 23) ||
      roleUser.role_id === 1);
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
      render: (text, record) => (
        <NavLink to={`/admin/aaifood/chi-tiet-phieu-thu/${record.order_id}`} activeClassName="active-link">
          {record.customer_name}
        </NavLink>
        //  <NavLink to={`${path}/chi-tiet/${record.order_id}`}>Chi tiết</NavLink>
      ),
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
    // {
    //   title: 'Ngày lập phiếu',
    //   dataIndex: 'created_at',
    //   key: 'created_at',
    //   render: (text) => moment(text).format('YYYY-MM-DD'),
    // },
    {
      title: 'Người lập',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ảnh hóa đơn',
      dataIndex: 'payment_img', // Assuming you have the image URL in the 'payment_img' field
      key: 'payment_img',
      render: (text, record) => (
        // Check if 'payment_img' exists before rendering the button
        record.payment_img ? (
          <Button
            onClick={() => showModal(record.payment_img)} // Show modal with the image
            type="link"
          >
            <FaEye />
          </Button>
        ) : null // If no 'payment_img', don't render anything
      ),
    },

    {
      title: 'Trạng thái thanh toán',
      key: 'action',
      render: (_, record) => {
        // Kiểm tra quyền của người dùng
        if (record.payos_status === 1) {
          return (
            <Popconfirm
              title="Bạn có chắc chắn muốn thay đổi trạng thái?"
              onConfirm={() => handleConfirmPayment(record)} // Gọi hàm xử lý thay đổi trạng thái
              okText="Đồng ý"
              cancelText="Hủy"
              disabled={!canEdit}
            >
              <Button disabled={!canEdit} style={{ background: '#22AAEF', color: '#FFF' }}>
                Đã thanh toán
              </Button>
            </Popconfirm>
          );
        } else if (record.payos_status === 2) {
          return (
            <Popconfirm
              title="Bạn có chắc chắn muốn xác nhận?"
              onConfirm={() => handleConfirmChage(record)} // Gọi hàm xử lý thay đổi trạng thái
              okText="Đồng ý"
              cancelText="Hủy"
              disabled={!canEdit}
            >
              <Button
                disabled={!canEdit}
                style={{ background: 'green', color: '#FFF' }}
                // Disable nút nếu không có quyền
              >
                Đã xác nhận
              </Button>
            </Popconfirm>
          );
        } else if (record.payos_status === 0) {
          return (
            <Popconfirm
              title="Bạn có chắc chắn muốn thay đổi trạng thái?"
              onConfirm={() => handleConfirmPayment(record)} // Gọi hàm xử lý thay đổi trạng thái
              okText="Đồng ý"
              cancelText="Hủy"
              disabled={!canEdit}
            >
              <Button type="danger" disabled={!canEdit}>
                Chưa thanh toán
              </Button>
            </Popconfirm>
          );
        }
        return null;
      },
    },
    {
      title: 'Trạng thái vận chuyển',
      key: 'shipping_status',
      render: (_, record) => {
        const getButton = (status, label, color, nextStatus) => (
          <Popconfirm
            title={`Bạn có chắc chắn muốn chuyển sang trạng thái "${label}"?`}
            onConfirm={() => handleShippingStatusChange(record, nextStatus)}
            okText="Đồng ý"
            cancelText="Hủy"
            disabled={!canClick}
          >
            <Button style={{ background: color, color: '#FFF' }} disabled={!canClick}>
              {label}
            </Button>
          </Popconfirm>
        );

        // Xử lý trạng thái hiện tại và nút tiếp theo
        switch (record.delivery_status) {
          case 0: // Xuất hàng
            return getButton(0, 'Chưa xuất hàng', '#FF9900', 1); // Chuyển sang Giao ĐVVC
          case 1: // Giao ĐVVC
            return getButton(1, 'Đã xuất hàng', '#22AAEF', null); // Chuyển sang Giao hàng thành công
          // case 2: // Giao hàng thành công
          //   return getButton(2, 'Giao thành công', 'green', null); // Không có trạng thái tiếp theo
          default:
            return <span>Không xác định</span>;
        }
      },
    },
    ...(canEdit ? [{
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
    }] : []),
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
      render: (text, record) => (
        <NavLink to={`/admin/aaifood/chi-tiet-phieu-thu/${record.order_id}`} activeClassName="active-link">
          {record.agency_name}
        </NavLink>
        //  <NavLink to={`${path}/chi-tiet/${record.order_id}`}>Chi tiết</NavLink>
      ),
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
    // {
    //   title: 'Cấp đại lý',
    //   dataIndex: 'agency_level',
    //   key: 'agency_level',
    // },
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
    // {
    //   title: 'Ngày lập phiếu',
    //   dataIndex: 'created_at',
    //   key: 'created_at',
    //   render: (text) => moment(text).format('YYYY-MM-DD'), // Định dạng ngày/tháng/năm
    // },
    {
      title: 'Người lập',
      dataIndex: 'name',
      key: 'name',
    },

    // {
    //   title: 'Chi tiết',
    //   key: 'details',
    //   render: (text, record) => (
    //     <NavLink to={`/admin/aaifood/chi-tiet-phieu-thu/${record.order_id}`} activeClassName="active-link">
    //       <Button type="primary">Chi tiết</Button>
    //     </NavLink>
    //   ),
    // },
    {
      title: 'Trạng thái thanh toán',
      key: 'action',
      render: (_, record) => {
        // Kiểm tra quyền của người dùng
        const canEdit =
          roleUser && (roleUser.department_id === 1 || roleUser.department_id === 8 || roleUser.role_id === 1);

        // Hiển thị các trạng thái
        if (record.payos_status === 1) {
          return (
            <Popconfirm
              title="Bạn có chắc chắn muốn thay đổi trạng thái?"
              onConfirm={() => handleConfirmPayment(record)} // Gọi hàm xử lý thay đổi trạng thái
              okText="Đồng ý"
              cancelText="Hủy"
              disabled={!canEdit} // Không cho phép mở Popconfirm nếu không có quyền
            >
              <Button
                style={{ background: '#22AAEF', color: '#FFF' }}
                disabled={!canEdit} // Không cho phép click nút nếu không có quyền
              >
                Đã thanh toán
              </Button>
            </Popconfirm>
          );
        } else if (record.payos_status === 2) {
          return (
            <Popconfirm
              title="Bạn có chắc chắn muốn xác nhận?"
              onConfirm={() => handleConfirmChage(record)} // Gọi hàm xử lý thay đổi trạng thái
              okText="Đồng ý"
              cancelText="Hủy"
              disabled={!canEdit} // Không cho phép mở Popconfirm nếu không có quyền
            >
              <Button
                style={{ background: 'green', color: '#FFF' }}
                disabled={!canEdit} // Không cho phép click nút nếu không có quyền
              >
                Đã xác nhận
              </Button>
            </Popconfirm>
          );
        } else if (record.payos_status === 0) {
          return (
            <Popconfirm
              title="Bạn có chắc chắn muốn thay đổi trạng thái?"
              onConfirm={() => handleConfirmPayment(record)} // Gọi hàm xử lý thay đổi trạng thái
              okText="Đồng ý"
              cancelText="Hủy"
              disabled={!canEdit} // Không cho phép mở Popconfirm nếu không có quyền
            >
              <Button
                danger
                disabled={!canEdit} // Không cho phép click nút nếu không có quyền
              >
                Chưa thanh toán
              </Button>
            </Popconfirm>
          );
        }
        return null;
      },
    },
    {
      title: 'Trạng thái vận chuyển',
      key: 'shipping_status',
      render: (_, record) => {
        const getButton = (status, label, color, nextStatus) => (
          <Popconfirm
            title={`Bạn có chắc chắn muốn chuyển sang trạng thái "${label}"?`}
            onConfirm={() => handleShippingStatusChange(record, nextStatus)}
            okText="Đồng ý"
            cancelText="Hủy"
            disabled={!canClick}
          >
            <Button style={{ background: color, color: '#FFF' }} disabled={!canClick}>
              {label}
            </Button>
          </Popconfirm>
        );

        // Xử lý trạng thái hiện tại và nút tiếp theo
        switch (record.delivery_status) {
          case 0: // Xuất hàng
            return getButton(0, 'Chưa xuất hàng', '#FF9900', 1); // Chuyển sang Giao ĐVVC
          case 1: // Giao ĐVVC
            return getButton(1, 'Đã xuất hàng', '#22AAEF', null); // Chuyển sang Giao hàng thành công
          // case 2: // Giao hàng thành công
          //   return getButton(2, 'Giao thành công', 'green', null); // Không có trạng thái tiếp theo
          default:
            return <span>Không xác định</span>;
        }
      },
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
            <Button type="primary">Tạo phiếu bán hàng online</Button>
          </NavLink>
          <NavLink
            to={`/admin/aaifood/tao-phieu-ban-dai-ly`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              marginRight: '15px',
            }}
          >
            <Button type="primary">Tạo phiếu bán đại lý</Button>
          </NavLink>
          <NavLink
            to={`/admin/aaifood/tao-phieu-ban-hang-thu-cong`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              marginRight: '15px',
            }}
          >
            <Button style={{ background: '#04E0D3' }}>Tạo phiếu bán hàng thủ công</Button>
          </NavLink>
          {/* <NavLink
            to={`/admin/aaifood/ket-qua-thanh-toan`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Button type="primary">Kết quả thanh toán</Button>
          </NavLink> */}
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
      <Modal
      title="Ảnh hóa đơn"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <img src={invoiceImage} alt="Invoice" style={{ width: '100%' }} />
    </Modal>
    </div>
    
  );
};

export default list_order_agency;
