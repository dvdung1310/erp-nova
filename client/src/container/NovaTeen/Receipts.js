import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Popconfirm, message, Drawer, Form, DatePicker, Modal, Input } from 'antd';
import {
  allOrder,
  deleteOrder,
  confirmPayment,
  confirmPaymentChange,
  checkRoleUser,
  orderDeliveryStatus,
} from '../../apis/aaifood/index';
import { allReceiptsNovateen } from '../../apis/novateen/index';
import moment from 'moment';
import { FaEye } from 'react-icons/fa';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const Receipts = () => {
  const { path } = useRouteMatch();
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataAgency, setFilteredDataAgency] = useState([]);
  const [orderRetail, setOrderRetail] = useState([]);
  const [allOrderRetail, setAllOrderRetail] = useState([]);
  const [orderAgency, setOrderAgency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSideBarRetail, setOpenSideBarRetail] = useState(false);
  const [openSideBarAgency, setOpenSideBarAgency] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [invoiceImage, setInvoiceImage] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allReceiptsNovateen();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
      setOrderRetail(response.data.all_recipts);
      setAllOrderRetail(response.data.all_recipts);
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
  const handleSearch = (keyword) => {
    // Đảm bảo từ khóa tìm kiếm là chuỗi
    const lowerKeyword = keyword ? keyword.toString().toLowerCase() : '';

    const filteredData = allOrderRetail.filter((order) => {
      return (
        order.order_id?.toString().includes(lowerKeyword) || // Chuyển số thành chuỗi để tìm kiếm
        order.customer_name?.toLowerCase().includes(lowerKeyword) || // Tìm kiếm theo tên khách hàng
        order.customer_phone?.toString().includes(lowerKeyword) // Chuyển số thành chuỗi để tìm kiếm
      );
    });

    setOrderRetail(filteredData);
  };
  const canEdit =
    roleUser &&
    (roleUser.department_id === 1 ||
      (roleUser.department_id === 8 && roleUser.level_id === 23) ||
      roleUser.role_id === 1);
  const canClick =
    roleUser &&
    (roleUser.department_id === 9 ||
      roleUser.department_id === 1 ||
      (roleUser.department_id === 8 && roleUser.level_id === 23) ||
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
      // render: (text, record) => (
      //   <NavLink to={`/admin/aaifood/chi-tiet-phieu-thu/${record.order_id}`} activeClassName="active-link">
      //     {record.customer_name}
      //   </NavLink>
      //   //  <NavLink to={`${path}/chi-tiet/${record.order_id}`}>Chi tiết</NavLink>
      // ),
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
      title: 'Người lập',
      dataIndex: 'name',
      key: 'name',
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
    ...(canEdit
      ? [
          {
            title: 'Hành động',
            key: 'action',
            render: (_, record) =>
              record.payos_status === 0 ? ( // Kiểm tra nếu trạng thái thanh toán là 0
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa bản ghi này?"
                  onConfirm={() => handleDelete(record)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="danger">Xóa</Button>
                </Popconfirm>
              ) : null, // Không hiển thị gì nếu trạng thái không phải 0
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '30px' }}>
        <h3>Danh sách phiếu thu NovaTeen</h3>
        <div style={{ display: 'flex', alignContent: 'center' }}>
          <NavLink
            to={`/admin/novateen/tao-phieu-thu`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              marginRight: '15px',
            }}
          >
            <Button type="primary">Tạo phiếu thu online</Button>
          </NavLink>
        </div>
      </div>
      <hr style={{ marginBottom: '10px' }} />
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
            </div>
            <div>
              <Input
                placeholder="Tìm kiếm phiếu thu"
                style={{ width: 200, height: '40px' }}
                value={searchKeyword || ''} // Đảm bảo giá trị không phải null hoặc undefined
                onChange={(e) => {
                  setSearchKeyword(e.target.value); // Cập nhật giá trị tìm kiếm
                  handleSearch(e.target.value); // Gọi hàm tìm kiếm với giá trị mới
                }}
              />
            </div>
          </div>
          <Table
            columns={columns_orderRetail}
            dataSource={filteredData.length > 0 ? filteredData : orderRetail}
            rowKey="id"
          />
        </div>
      )}
      <Modal title="Ảnh hóa đơn" visible={isModalVisible} onCancel={handleCancel} footer={null} width={600}>
        <img src={invoiceImage} alt="Invoice" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default Receipts;
