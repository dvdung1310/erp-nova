import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card, Spin, Col, Row, DatePicker } from 'antd';   
import { storeCustomer, updateCustomer, ListCustomer, DeleteCustomer } from '../../apis/novaup/customer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Customer.css';
import dayjs from 'dayjs';

const { Option } = Select;

const CustomerStatus = () => {
  const [customer, setCustomer] = useState([]);
  const [customer_status, setStatuses] = useState([]);
  const [customer_sources, setSources] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchStatuses = async () => {
    try {
        setLoading(true);
        const response = await ListCustomer();
        setCustomer(response.customers);
        setStatuses(response.statuses || []);
        setSources(response.data_sources || []);
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
    form.setFieldsValue({
      ...status,
      date: status?.date ? dayjs(status.date) : null,
    });
    setIsModalVisible(true);
  };

  const handleAddStatus = async () => {
    try {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('phone', values.phone);
        formData.append('date', values.date ? values.date.format('YYYY-MM-DD') : null); 
        formData.append('email', values.email ? values.email : null);
        formData.append('status_id', values.status_id);
        formData.append('source_id', values.source_id);
        
        const response = await storeCustomer(formData);
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
        formData.append('phone', values.phone);
        formData.append('date', values.date ? values.date.format('YYYY-MM-DD') : null); // Chuyển đổi ngày
        formData.append('email', values.email || 'không có');
        formData.append('status_id', values.status_id);
        formData.append('source_id', values.source_id);
        
        const response = await updateCustomer(formData);
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

  const handleDelete = (id) => {
    DeleteCustomer(id)
      .then(response => {
        setCustomer(customer.filter(s => s.id !== id));
        toast.success('Xóa khách hàng thành công!');
        fetchStatuses();
      })
      .catch(error => {
        toast.error('Xóa khách hàng thất bại!');
      });
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'date',
      key: 'date',
      render: (text) => {
        return text ? dayjs(text).format('DD-MM-YYYY') : '';
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_name',
      key: 'status_name',
    },
    {
      title: 'Nguồn data',
      dataIndex: 'source_name',
      key: 'source_name',
    },
    {
      title: 'Sale',
      dataIndex: 'sales_names',
      key: 'sales_names',
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
            <h2 className='fw-bold'>Nguồn Khách Hàng</h2>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
              Thêm khách hàng
            </Button>
          </div>
          <Table columns={columns} dataSource={customer} rowKey="id" />
        </Card>
      </Spin>

      <Modal
        title={isEditMode ? 'Sửa nguồn khách hàng' : 'Thêm khách hàng'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="date" label="Ngày sinh">
                <DatePicker format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="status_id" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                <Select placeholder="Chọn trạng thái">
                  {customer_status.map((status) => (
                    <Option key={status.id} value={status.id}>
                      {status.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="source_id" label="Nguồn khách hàng" rules={[{ required: true, message: 'Vui lòng chọn nguồn khách hàng' }]}>
                <Select placeholder="Chọn nguồn khách hàng">
                  {customer_sources.map((source) => (
                    <Option key={source.id} value={source.id}>
                      {source.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerStatus;
