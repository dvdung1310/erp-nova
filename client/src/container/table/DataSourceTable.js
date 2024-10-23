// Import các thư viện và thành phần cần thiết
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input } from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';

function StatusCustomerTable() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();

  // Lấy dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/nvudatasource');
        if (!response.data.error) {
          setDataSource(response.data.data);
        } else {
          message.error(response.data.message);
        }
      } catch (err) {
        message.error('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Xử lý thêm mới status
  const handleAddNew = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    try {
      const newItem = await form.validateFields(); // Lấy giá trị đã điền trong form
      const response = await axios.post('http://localhost:8000/api/nvudatasource', newItem);
      
      // Kiểm tra phản hồi
      console.log(response.data); // Xem phản hồi từ API
  
      // Giả sử response.data.data chứa bản ghi mới đã được tạo
      if (!response.data.error) {
        setDataSource((prevData) => [...prevData, response.data.data]); // Cập nhật dataSource với item mới
        message.success('Status added successfully');
      } else {
        message.error(response.data.message);
      }
  
      // Đóng modal sau khi thêm mới
      setIsAddModalVisible(false);
      form.resetFields(); // Đặt lại form để nhập liệu cho lần sau
    } catch (error) {
      message.error('Failed to add status');
    }
  };
  
  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
  };

  // Xử lý chỉnh sửa status
  const handleEdit = (record) => {
    setCurrentItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const updatedItem = form.getFieldsValue();
      await axios.put(`http://localhost:8000/api/nvudatasource/${currentItem.source_id}`, updatedItem);
      message.success('Updated successfully');
      setDataSource((prevData) =>
        prevData.map((item) => (item.source_id === currentItem.source_id ? { ...item, ...updatedItem } : item)),
      );
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to update the record');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Xử lý xóa status
//   const handleDelete = async (sourceId) => {
//     try {
//       await axios.delete(`http://localhost:8000/api/nvudatasource/${sourceId}`);
//       message.success('Deleted successfully');
//       setDataSource((prevData) => prevData.filter((item) => item.source_id !== sourceId));
//     } catch (error) {
//       message.error('Failed to delete the record');
//     }
//   };

  // Cột cho bảng
  const columns = [
    { title: 'ID', dataIndex: 'source_id', key: 'source_id' },
    { title: 'Nguồn Data', dataIndex: 'source_name', key: 'source_name' },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('HH:mm:ss DD-MM-YYYY'), // Định dạng theo giờ phút giây ngày tháng năm
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => moment(text).format('HH:mm:ss DD-MM-YYYY'), // Định dạng theo giờ phút giây ngày tháng năm
    },
    {
      title: 'Tùy chọn',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button type="primary" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          {/* <Popconfirm
            title="Are you sure to delete this status?"
            onConfirm={() => handleDelete(record.source_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm> */}
        </span>
      ),
    },
  ];

  return (
    <>
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <Cards title="Basic Usage">
              <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
                Thêm Nguồn Data
              </Button>
              {loading ? (
                <Spin tip="Loading..." />
              ) : (
                <Table
                  className="table-responsive"
                  pagination={false}
                  dataSource={dataSource}
                  columns={columns}
                  rowKey="source_id" // Chỉnh sửa key thành source_id
                />
              )}
            </Cards>
          </Col>
        </Row>

        {/* Modal chỉnh sửa */}
        <Modal title="Edit Status" visible={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
          <Form form={form} layout="vertical">
            <Form.Item label="Status ID" name="source_id">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Status Name"
              name="source_name"
              rules={[{ required: true, message: 'Please enter status name!' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm mới */}
        <Modal
          title="Add New Status"
          visible={isAddModalVisible}
          onOk={handleAddModalOk}
          onCancel={handleAddModalCancel}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Status Name"
              name="source_name"
              rules={[{ required: true, message: 'Please enter status name!' }]}
            >
              <Input />
            </Form.Item>

            {/* Trường Status với giá trị mặc định */}
            <Form.Item name="source_status" initialValue={1} hidden>
              <Input type="hidden" />
            </Form.Item>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default StatusCustomerTable;
