import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card , Spin , Row , Col } from 'antd';
import { storeRoom, updateRoom, ListRoom, DeleteRoom } from '../../apis/novaup/room';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Customer.css';
const { Option } = Select;

const Room = () => {
  const [statuses, setStatuses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
 
  const fetchStatuses = async () => {
    try {
        setLoading(true);
        const response = await ListRoom();
        setStatuses(response);
      } catch (error) {
        console.error('Error fetching ListSource:', error);
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
    form.setFieldsValue(status || { name: '', status: '' });
    setIsModalVisible(true); 
  };


  const handleAddStatus = async () => {
    try {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('address', values.address);
        formData.append('infor',values.infor);
        formData.append('color',values.color);
        formData.append('status',values.status);
        const response = await storeRoom(formData);
        toast.success(response.message);
        setIsModalVisible(false);
        form.resetFields();
        fetchStatuses(); 
      } catch (error) {
        toast.error('Lưu phòng thất bại!');
      }
  };


  const handleEditStatus = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('id', editingStatus.id);
      formData.append('name', values.name);
      formData.append('address', values.address);
      formData.append('infor',values.infor);
      formData.append('color',values.color);
      formData.append('status',values.status);
      const response = await updateRoom(formData);
      toast.success(response.message);
      setIsModalVisible(false);
      form.resetFields();
      fetchStatuses(); 
    } catch (error) {
      toast.error('Cập nhật phòng thất bại!');
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
    DeleteRoom(id)
      .then(response => {
        setStatuses(statuses.filter(s => s.id !== id));
        toast.success('Xóa nguồn khách hàng thành công!');
        fetchStatuses();
      })
      .catch(error => {
        toast.error('Xóa nguồn khách hàng thất bại!');
      });
  };

  // Các cột cho bảng
  const columns = [
    {
        title: 'STT',
        key: 'stt',
        render: (text, record, index) => index + 1,
    },
    // {
    //     title: 'ID',
    //     dataIndex: 'id',
    //     key: 'id',
    // },
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
    },
    {
        title: 'Địa Chỉ',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Màu',
        dataIndex: 'color',
        key: 'color',
        render: color => <Tag color={color}>{color}</Tag>,
      },

    {
        title: 'Thông tin',
        dataIndex: 'infor',
        key: 'infor',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Mở' : 'Đóng'}
        </Tag>
      ),
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
          <h2 className='fw-bold'>Danh sách phòng</h2>
          <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
            Thêm phòng
          </Button>
        </div>
        <Table columns={columns} dataSource={statuses} rowKey="id" />
      </Card>
      </Spin>

      <Modal
        title={isEditMode ? 'Sửa phòng' : 'Thêm phòng'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên phòng" rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="infor" label="Thông tin">
            <Input />
          </Form.Item>

          <Row gutter={16}>
          <Col className="gutter-row" span={12}>
          <Form.Item name="color" label="Màu">
            <Input type="color" />
          </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value={1}>Mở</Option>
              <Option value={0}>Đóng</Option>
            </Select>
          </Form.Item>
          </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Room;
