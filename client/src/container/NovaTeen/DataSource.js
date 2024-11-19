import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card , Spin } from 'antd';
import { storeSource, updateSource, ListSource, DeleteSource } from '../../apis/novaup/source';
import {getDataSourceNovaTeen,storeDataSourceNovaTeen,updateDataSourceNovaTeen} from '../../apis/novateen/index';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;

const CustomerStatus = () => {
  const [statuses, setStatuses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
 
  const fetchStatuses = async () => {
    try {
        setLoading(true);
        const response = await getDataSourceNovaTeen();
        setStatuses(response.data);
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
        formData.append('status',values.status);
        const response = await storeDataSourceNovaTeen(formData);
        toast.success('Lưu nguồn khách hàng thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchStatuses(); 
      } catch (error) {
        toast.error('Lưu nguồn khách hàng thất bại!');
      }
  };


  const handleEditStatus = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('id', editingStatus.id);
      formData.append('name', values.name);
      formData.append('status',values.status);
      const response = await updateDataSourceNovaTeen(formData);
      toast.success('Cập nhật nguồn khách hàng thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchStatuses(); 
    } catch (error) {
      toast.error('Cập nhật nguồn khách hàng thất bại!');
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
        </Space>
      ),
    },
  ];

  return (
    <div>
        <Spin spinning={loading}>
      <Card>
        <div className='d-flex justify-content-between'>
          <h2 className='fw-bold'>Nguồn Khách Hàng</h2>
          <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
            Thêm nguồn khách hàng
          </Button>
        </div>
        <Table columns={columns} dataSource={statuses} rowKey="id" />
      </Card>
      </Spin>

      <Modal
        title={isEditMode ? 'Sửa nguồn khách hàng' : 'Thêm nguồn khách hàng'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập nguồn khách hàng' }]}>
            <Input />
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
