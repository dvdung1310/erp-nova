import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card, Spin, Col, Row , Upload, message  } from 'antd';   
import { UploadOutlined } from '@ant-design/icons';
import {  DeleteCustomer  } from '../../apis/novaup/customer';
import { storePayment, updatePayment, ListPayment, DeletePayment , getBookingConnectCumstomer } from '../../apis/novaup/payment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Customer.css';
import dayjs from 'dayjs';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

const { Option } = Select;

const CustomerStatus = () => {
  const [payments, setPayment] = useState([]);
  const [bookingRoomUsers, setBookingRoomUser] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [date_test, setDate] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fetchStatuses = async () => {
    try {
        setLoading(true);
        const response = await ListPayment();
        const booking_Room_User = await getBookingConnectCumstomer();
        setBookingRoomUser(booking_Room_User)
        setPayment(response.payments)
    } catch (error) {
        console.error('Error fetching ListCustomer:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const showModal = (status = null) => {
    setIsEditMode(!!status);
    setEditingStatus(status);
    if (status) {
        form.setFieldsValue({
            id_customer_booking: status.booking_histories[0].room_booking_id,
            date: status.date ? dayjs(status.date).format('YYYY-MM-DD') : null,
            money: status.money,
            type: status.type, 
          });
      console.log(form.getFieldValue('type'));
      setSelectedFile(null);
    } else {
      form.resetFields();
      setSelectedFile(null);
    }

    setIsModalVisible(true);
  };

  const handleUploadChange = ({ fileList }) => {
    setSelectedFile(fileList.length > 0 ? fileList[0].originFileObj : null);
};
  

  const handleAddStatus = async () => {
    try {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('id_customer_booking', values.id_customer_booking);
        formData.append('date', values.date); 
        formData.append('money', values.money);
        formData.append('type', values.type);
        formData.append('image', selectedFile);
        const response = await storePayment(formData);
        toast.success(response.message);
        setIsModalVisible(false);
        form.resetFields();
        fetchStatuses();
    } catch (error) {
        toast.error(error.message);
    }
  };

  const handleEditStatus = async () => {
    try {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('id', editingStatus.id);
        formData.append('id_customer_booking', values.id_customer_booking);
        formData.append('date', values.date); 
        formData.append('money', values.money);
        formData.append('type', values.type);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }
        
        const response = await updatePayment(formData);
        toast.success(response.message);
        setIsModalVisible(false);
        form.resetFields();
        fetchStatuses();
    } catch (error) {
        toast.error(error.message);
    }
  };

  const handleOk = () => {
    if (isEditMode) {
      handleEditStatus(); 
    } else {
      handleAddStatus();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStatus(null); 
    form.resetFields();
  };

  const handleDelete = (id) => {
    DeletePayment(id)
      .then(response => {
        setPayment(payments.filter(s => s.id !== id));
        toast.success('Xóa giao dịch thành công!');
        fetchStatuses();
      })
      .catch(error => {
        toast.error('Xóa giao dịch thất bại!');
      });
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên Khách Hàng (Tên phòng)',
      key: 'customer_name',
      render: (text, record) => {
        const customerName = record.booking_histories[0]?.customer_name || 'Không có';
        const roomName = record.booking_histories[0]?.room_name || 'Không có';
        const name = customerName + '-' + roomName;
        return name;
    },
    },
    {
      title: 'Số điện thoại',
      render: (text, record) => {
        const customerPhone = record.booking_histories[0]?.customer_phone || 'Không có';
        return customerPhone;
    },
      key: 'phone',
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (text ? dayjs(text).format('DD-MM-YYYY') : ''),
    },
    {
      title: 'Số tiền thu - chi',
      render: (text, record) => {
        const isIncome = record.type === 1;
        const moneyFormatted = `${isIncome ? '+' : '-'}${record.money} VND`;
        const style = {
          color: isIncome ? 'green' : 'red',
        };
    
        return <span style={style}>{moneyFormatted}</span>; 
      },
      key: 'money',
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text, record) => (
        <a
          onClick={() => {
            setSelectedImage(`${LARAVEL_SERVER}/storage/${record.image}`);
            setIsImageModalVisible(true);
          }}
        >
          Xem ảnh
        </a>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Đã xác nhận' : 'Chưa xác nhân'}
        </Tag>
      ),
    },
    {
      title: 'Sale',
      dataIndex: 'sale_names',
      key: 'sale_names',
    },
    {
        title: 'Ngày dùng phòng (Ngày Kết Thúc)',
        render: (text, record) => {
          const start_date = record.booking_histories[0]?.start_date ? dayjs(record.booking_histories[0]?.start_date).format('DD-MM-YYYY') : 'Không có';
          const end_date = record.booking_histories[0]?.end_date ? dayjs(record.booking_histories[0]?.end_date).format('DD-MM-YYYY') : 'Không có';
          const start_end_date = start_date + ' đến ' + end_date;
          return start_end_date;
        },
        key: 'date',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="danger" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Spin spinning={loading}>
        <Card>
          <div className='d-flex justify-content-between'>
            <h2 className='fw-bold'>Doanh thu</h2>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
              Thêm giao dịch
            </Button>
          </div>
          <Table columns={columns} dataSource={payments} rowKey="id" />
        </Card>
      </Spin>

      <Modal
        title={isEditMode ? 'Sửa giao dịch' : 'Thêm giao dịch'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
          <Col className="gutter-row" span={24}>
            <Form.Item
             name="id_customer_booking"
             label="Khách hàng - phòng - thời gian"
              rules={[{ required: true, message: 'Vui lòng chọn khách hàng - lịch đăt phòng' }]}>
             <Select placeholder="Chọn Khách hàng - phòng - thời gian">
                {bookingRoomUsers.map((bookingRoomUser) => (
                 <Option key={bookingRoomUser.id} value={bookingRoomUser.id}>
                    {bookingRoomUser.customer_name} - {bookingRoomUser.room_name} - {bookingRoomUser.date_time}
                </Option>
            ))}
            </Select>
            </Form.Item>
            </Col>

            <Col className="gutter-row" span={24}>
              <Form.Item name="date" label="Ngày giao dịch" rules={[{ required: true, message: 'Vui lòng chọn ngày giao dịch' }]}>
              <Input
        type="date"
        value={editingStatus && editingStatus.date ? dayjs(editingStatus.date).format('YYYY-MM-DD') : ''}
        onChange={(e) => form.setFieldsValue({ date: e.target.value })}
      />
              </Form.Item>
            </Col>

         
            <Col className="gutter-row" span={12}>
              <Form.Item name="money" label="Số tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
                <Input type='number' placeholder='Số tiền' />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
            <Form.Item
             name="type"
             label="Chọn thu hoặc chi"
              rules={[{ required: true, message: 'Vui lòng chọn thu hoặc chi' }]}>
             <Select placeholder="Chọn thu hoặc chi">
                 <Option value={1}>
                    Thu
                </Option>
                <Option  value={0}>
                    Chi
                </Option>
                 </Select>
            </Form.Item>
            </Col>

            <Form.Item name="image">
                        <Upload
                            name="image"
                            listType="picture"
                            beforeUpload={() => false} onChange={handleUploadChange}><Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
            </Form.Item>
          </Row>
        </Form>
      </Modal>

      <Modal
  title="Xem ảnh"
  visible={isImageModalVisible}
  footer={null} 
  onCancel={() => setIsImageModalVisible(false)} 
>
  <img
    src={selectedImage} 
    alt="Preview"
    style={{ width: '100%' }} 
  />
</Modal>
    </div>
  );
};

export default CustomerStatus;
