import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';

const { Option } = Select;

function CustomerTable() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [dataStatuses, setDataStatuses] = useState([]);

  // Move fetchData function above useEffect to resolve 'no-use-before-define' error
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/nvucustomer');
      if (!response.data.error) {
        setDataSource(response.data.data);
      } else {
        message.error(response.data.message);
        return;
      }
    } catch (err) {
      message.error('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Now fetchData is defined before useEffect
  }, []);

  const fetchCreateData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/nvucustomer/create');
      if (!response.data.error) {
        setDataSources(response.data.data.dataSource);
        setDataStatuses(response.data.data.dataStatus);
      } else {
        message.error(response.data.message);
        return;
      }
    } catch (err) {
      message.error('Failed to fetch source and status data.');
    }
  };

  const handleOpenModal = (customer = null) => {
    setEditingCustomer(customer);
    form.resetFields();
    if (customer) {
      form.setFieldsValue({ ...customer, customer_date_receipt: moment(customer.customer_date_receipt) });
    }
    fetchCreateData();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      values.customer_date_receipt = values.customer_date_receipt.format('YYYY-MM-DD');

      if (editingCustomer) {
        await axios.put(`http://localhost:8000/api/nvucustomer/${editingCustomer.customer_id}`, values);
        message.success('Customer updated successfully');
      } else {
        const response = await axios.post('http://localhost:8000/api/nvucustomer', values);
        setDataSource((prev) => [...prev, response.data.data]);
        message.success('Customer added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/nvucustomer/${id}`);
      setDataSource((prev) => prev.filter((item) => item.customer_id !== id));
      message.success('Customer deleted successfully');
    } catch (error) {
      message.error('Failed to delete customer');
      return;
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'customer_id', key: 'customer_id' },
    { title: 'Khách hàng', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'SĐT', dataIndex: 'customer_phone', key: 'customer_phone' },
    { title: 'Mô tả', dataIndex: 'customer_description', key: 'customer_description' },
    { title: 'Ngày nhận Data', dataIndex: 'customer_date_receipt', key: 'customer_date_receipt', render: (text) => moment(text).format('DD-MM-YYYY') },
    { title: 'Nguồn Data', dataIndex: 'source_name', key: 'source_name' },
    { title: 'Trạng thái', dataIndex: 'status_name', key: 'status_name' },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => moment(text).format('HH:mm:ss DD-MM-YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleOpenModal(record)}>Edit</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa khách hàng này không?"
            onConfirm={() => handleDelete(record.customer_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Main>
      <Row gutter={15}>
        <Col xs={24}>
          <Cards title="Customer Management">
            <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
              Thêm khách hàng
            </Button>
            {loading ? (
              <Spin tip="Loading..." />
            ) : (
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                rowKey="customer_id"
              />
            )}
          </Cards>
        </Col>
      </Row>

      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Khách Hàng"
            name="customer_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số Điện Thoại"
            name="customer_phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="customer_description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Ngày nhận Data"
            name="customer_date_receipt"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhận data!' }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Nguồn Data"
            name="customer_source"
            rules={[{ required: true, message: 'Vui lòng chọn nguồn data!' }]}
          >
            <Select placeholder="Chọn nguồn data">
              {dataSources.map((source) => (
                <Option key={source.source_id} value={source.source_id}>
                  {source.source_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng Thái"
            name="customer_status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              {dataStatuses.map((status) => (
                <Option key={status.status_id} value={status.status_id}>
                  {status.status_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default CustomerTable;
