import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card } from 'antd';
import { storeStatus, updateStatus, ListStatus, DeleteStatus } from '../../apis/novaup/status';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;

const CustomerStatus = () => {
  const [statuses, setStatuses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null); 
  const [form] = Form.useForm();

 
  const fetchStatuses = () => {
    ListStatus()
      .then(response => {
        setStatuses(response);
      })
      .catch(error => {
        toast.error('Lấy danh sách trạng thái thất bại!');
      });
  };


  useEffect(() => {
    fetchStatuses();
  }, []);


  const showModal = (status = null) => {
    setIsEditMode(!!status);
    setEditingStatus(status);
    form.setFieldsValue(status || { name: '', color: '', status: '' });
    setIsModalVisible(true); 
  };


  const handleAddStatus = async () => {
    try {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('color', values.color);
        formData.append('status',values.status);
        const response = await storeStatus(formData);
        toast.success('Lưu trạng thái thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchStatuses(); 
      } catch (error) {
        toast.error('Lưu trạng thái thất bại!');
      }
  };


  const handleEditStatus = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('id', editingStatus.id);
      formData.append('name', values.name);
      formData.append('color', values.color);
      formData.append('status',values.status);
      const response = await updateStatus(formData);
      toast.success('Cập nhật trạng thái thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchStatuses(); 
    } catch (error) {
      toast.error('Cập nhật trạng thái thất bại!');
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
    DeleteStatus(id)
      .then(response => {
        setStatuses(statuses.filter(s => s.id !== id));
        toast.success('Xóa trạng thái thành công!');
        fetchStatuses();
      })
      .catch(error => {
        toast.error('Xóa trạng thái thất bại!');
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
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      key: 'color',
      render: color => <Tag color={color}>{color}</Tag>,
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
      <Card>
        <div className='d-flex justify-content-between'>
          <h2 className='fw-bold'>Trạng thái khách hàng</h2>
          <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
            Thêm trạng thái
          </Button>
        </div>
        <Table columns={columns} dataSource={statuses} rowKey="id" />
      </Card>

      <Modal
        title={isEditMode ? 'Sửa trạng thái' : 'Thêm trạng thái'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Màu" rules={[{ required: true, message: 'Vui lòng nhập mã màu' }]}>
            <Input type="color" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value={1}>Mở</Option>
              <Option value={0}>Đóng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerStatus;
