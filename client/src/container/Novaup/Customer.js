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
  const [content, setContent] = useState(null);  
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const { TextArea } = Input;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const fetchStatuses = async (filters = {}) => {
    try {
        setLoading(true);
        const params = new URLSearchParams(filters).toString();
        console.log('params',params);
        const response = await ListCustomer(`?${params}`);
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
    
    if (status) {
      form.setFieldsValue({
        ...status,
        date: status.date ? status.date : null,
        status_id: status.status_id,
        source_id: status.source_id,
      });
      console.log(form.getFieldValue('date'));
    } else {
      form.resetFields();
    }

    setIsModalVisible(true);
  };

  const handleAddStatus = async () => {
    try {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('phone', values.phone);
        formData.append('date', values.date); 
        formData.append('email', values.email ? values.email : null);
        formData.append('status_id', values.status_id);
        formData.append('content', values.content ? values.content : null); 
        formData.append('source_id', values.source_id);
        console.log(values.status_id);
        const response = await storeCustomer(formData);
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
        formData.append('name', values.name);
        formData.append('phone', values.phone);
        formData.append('date', values.date); 
        formData.append('email', values.email ? values.email : null);
        formData.append('status_id', values.status_id);
        formData.append('content', values.content ? values.content : null); 
        formData.append('source_id', values.source_id);
        console.log(formData);
        const response = await updateCustomer(formData);
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

  const handleSearch = () => {
    const params = {};
    if (searchTerm) {
        params.name = searchTerm;
    }
    if (selectedStatus) {
        params.status_id = selectedStatus;
    }
    if (selectedSource) {
        params.source_id = selectedSource;
    }
    fetchStatuses(params);
};

  const handleContentClick = (content) => {
    setContent(content)
    setContentModalVisible(true);
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
      title: 'Ngày làm việc',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (text ? dayjs(text).format('DD-MM-YYYY') : ''),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (content) => (
        <Button 
          type="link" 
          onClick={() => handleContentClick(content)} 
        >
          Xem nội dung
        </Button>
      ),
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
        <div>
          <Row  gutter={[16, 16]} style={{ marginBottom: '16px' , width:'100%' , display:'flex' , justifyContent:'end' , alignItems:'center'}}>
    <Col xs={24} sm={12} md={8} lg={4}>
    <Input  style={{padding:'7px 10px'}}
            placeholder="Tìm kiếm tên khách hàng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            enterButton
        />
    </Col>
    <Col xs={24} sm={12} md={8} lg={3}>
      <Select
        placeholder="Lọc theo trạng thái"
        style={{ width: '100%' }}
        value={selectedStatus}
        onChange={(value) => setSelectedStatus(value)}
        allowClear
      >
        {customer_status.map((status) => (
          <Option key={status.id} value={status.id}>
            {status.name}
          </Option>
        ))}
      </Select>
    </Col>
    <Col xs={24} sm={12} md={8} lg={3}>
      <Select
        placeholder="Lọc theo nguồn khách hàng"
        style={{ width: '100%' }}
        value={selectedSource}
        onChange={(value) => setSelectedSource(value)}
        allowClear
      >
        {customer_sources.map((source) => (
          <Option key={source.id} value={source.id}>
            {source.name}
          </Option>
        ))}
      </Select>
    </Col>
    <Col xs={24} sm={12} md={4} lg={2} style={{ textAlign: 'right' }}>
      <Button type="primary" onClick={handleSearch}>
        Tìm kiếm
      </Button>
    </Col>
          </Row>
          </div>
          <div className='d-flex justify-content-between'>
            <h2 className='fw-bold'>Danh sách Khách Hàng</h2>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
              Thêm khách hàng
            </Button>
          </div>
          <Table columns={columns} dataSource={customer} rowKey="id" scroll={{ x: 1000 }} />
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
                <Input placeholder='Nhập tên' />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input placeholder='Nhập số điện thoại' />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="date" label="Ngày làm việc">
              <Input
        type="date"
        value={editingStatus && editingStatus.date ? dayjs(editingStatus.date).format('YYYY-MM-DD') : ''}
        onChange={(e) => form.setFieldsValue({ date: e.target.value })}
            />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder='Nhập email' />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
            <Form.Item
             name="status_id"
             label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
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

            <Col className="gutter-row" span={24}>
              <Form.Item name="content" label="Nội dung trao đổi">
                <TextArea placeholder='Nhập nội dung' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
  title="Xem nội dung"
  visible={contentModalVisible}
  onCancel={() => setContentModalVisible(false)}
  footer={null}
  width={800}
>
    <div>{content}</div>
</Modal>
    </div>
  );
};

export default CustomerStatus;
