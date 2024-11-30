import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Card, Spin, Col, Row, Upload } from 'antd';   
import { UploadOutlined } from '@ant-design/icons';
import { storeCustomer, updateCustomer, ListCustomer, DeleteCustomer } from '../../apis/customers/index';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { Option } = Select;

const CustomerList = () => {
  const [customer, setCustomer] = useState([]);
  const [customer_status, setStatuses] = useState([]);
  const [customer_sources, setSources] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);  
  const [content, setContent] = useState(null);  
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [fileType, setFileType] = useState(null);
  const { Search } = Input;
  const { Option } = Select;
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
      console.log('status',status);
      setSelectedFile(null);
    } else {
      form.resetFields();
      setSelectedFile(null);
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
        formData.append('content', values.content ? values.content : null); 
        formData.append('status_id', values.status_id);
        formData.append('source_id', values.source_id);
        if (Array.isArray(selectedFile) && selectedFile.length > 0) {
        selectedFile.forEach(file => {
          formData.append('file_infor[]', file);
        });
      }
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
         formData.append('content', values.content ? values.content : null); 
        formData.append('status_id', values.status_id);
        formData.append('source_id', values.source_id);
        if (selectedFile && selectedFile.length > 0) {
          selectedFile.forEach(file => {
            formData.append('file_infor[]', file);
          });
        }
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

  const handleUploadChange = ({ fileList }) => {
    // setSelectedFile(fileList.length > 0 ? fileList[0].originFileObj : null);
    setSelectedFile(fileList.map(file => file.originFileObj));
};

const handleFileClick = (file) => {
  const files = Array.isArray(file) ? file : JSON.parse(file);
  console.log('files', files);
  setFileUrl(files);
  if (files == null || files.length === 0) {
    setFileType('null');
  } else {
    setFileType('multi');
  }
  setFileModalVisible(true);
};

const handleContentClick = (content) => {
  setContent(content)
  setContentModalVisible(true);
};

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Mã KH',
      dataIndex: 'id',
      key: 'id',
      render: (text) => `KH${text}`,
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
      title: 'Hóa đơn, Hợp đồng',
      dataIndex: 'file_infor',
      key: 'file_infor',
      render: (file_infor) => (
        <Button 
          type="link" 
          onClick={() => handleFileClick(file_infor)} 
        >
          Xem file
        </Button>
      ),
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
    <Col span={4}>
    <Input  style={{padding:'7px 10px'}}
            placeholder="Tìm kiếm tên khách hàng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            enterButton
        />
    </Col>
    <Col span={3}>
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
    <Col span={3}>
      <Select
        placeholder="Lọc theo nguồn khách hàng"
        style={{ width: '100%' }}
        value={selectedSource}
        onChange={(value) => setSelectedSource(value)}
        allowClear
      >
        {customer_sources.map((source) => (
          <Option key={source.id} value={source.id}>
            {source.name_source}
          </Option>
        ))}
      </Select>
    </Col>
    <Col span={2}>
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
                      {source.name_source}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={24}>
                <Upload
                multiple
                name="file_infor"
                listType="picture"
                beforeUpload={() => false} onChange={handleUploadChange}><Button icon={<UploadOutlined />}>Chọn file</Button>
                </Upload>
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
  title="Xem file"
  visible={fileModalVisible}
  onCancel={() => setFileModalVisible(false)}
  footer={null}
  width={800}
>
  {fileType === 'multi' ? (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {fileUrl.map((file, index) => {
        const fileExtension = file.split('.').pop().toLowerCase();
        return fileExtension === 'pdf' ? (
          <embed key={index} src={`${LARAVEL_SERVER}/storage/${file}`} width="100%" height="500px" type="application/pdf" />
        ) : (
          <img
  key={index}
  src={`${LARAVEL_SERVER}/storage/${file}`}
  alt={`file-preview-${index}`}
  style={{ width: '100%', marginBottom: '10px' }}
/>
        );
      })}
    </div>
  ) : (
    <div>Không có file để xem</div>
  )}
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

export default CustomerList;
