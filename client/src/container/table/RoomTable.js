// Import các thư viện và thành phần cần thiết
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Radio } from 'antd';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';

function RoomTable() {
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
        const response = await axios.get('http://localhost:8000/api/nvuroom');
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

  // Xử lý thêm mới phòng
  const handleAddNew = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    try {
      const newItem = await form.validateFields(); // Lấy giá trị đã điền trong form
      const response = await axios.post('http://localhost:8000/api/nvuroom', newItem);

      // Kiểm tra phản hồi
      console.log(response.data); // Xem phản hồi từ API

      // Giả sử response.data.data chứa bản ghi mới đã được tạo
      if (!response.data.error) {
        setDataSource((prevData) => [...prevData, response.data.data]); // Cập nhật dataSource với item mới
        message.success('Room added successfully');
      } else {
        message.error(response.data.message);
      }

      // Đóng modal sau khi thêm mới
      setIsAddModalVisible(false);
      form.resetFields(); // Đặt lại form để nhập liệu cho lần sau
    } catch (error) {
      message.error('Failed to add room');
    }
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
  };

  // Xử lý chỉnh sửa phòng
  const handleEdit = (record) => {
    setCurrentItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const updatedItem = form.getFieldsValue();
      await axios.put(`http://localhost:8000/api/nvuroom/${currentItem.room_id}`, updatedItem);
      message.success('Updated successfully');
      setDataSource((prevData) =>
        prevData.map((item) => (item.room_id === currentItem.room_id ? { ...item, ...updatedItem } : item)),
      );
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to update the record');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Xử lý xóa phòng
  const handleDelete = async (roomId) => {
    try {
      await axios.delete(`http://localhost:8000/api/nvuroom/${roomId}`);
      message.success('Deleted successfully');
      setDataSource((prevData) => prevData.filter((item) => item.room_id !== roomId));
    } catch (error) {
      message.error('Failed to delete the record');
    }
  };

  // Cột cho bảng
  const columns = [
    { title: 'ID', dataIndex: 'room_id', key: 'room_id' },
    { title: 'Tên phòng', dataIndex: 'room_name', key: 'room_name' },
    { title: 'Địa chỉ', dataIndex: 'room_address', key: 'room_address' },
    { title: 'Mô tả', dataIndex: 'room_description', key: 'room_description' },
    {
      title: 'Màu sắc',
      dataIndex: 'room_color',
      key: 'room_color',
      render: (text) => <div style={{ backgroundColor: text, padding: '5px' }}>{text}</div>,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'room_status',
        key: 'room_status',
        render: (text) => (
          <span style={{ color: text === 1 ? 'blue' : 'orange' }}>
            {text === 1 ? 'Hiển thị' : 'Ẩn'}
          </span>
        ),
      },
    {
      title: 'Tùy chọn',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button type="primary" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this room?"
            onConfirm={() => handleDelete(record.room_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <>
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <Cards title="Room Management">
              <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
                Add New Room
              </Button>
              {loading ? (
                <Spin tip="Loading..." />
              ) : (
                <Table
                  className="table-responsive"
                  pagination={false}
                  dataSource={dataSource}
                  columns={columns}
                  rowKey="room_id"
                />
              )}
            </Cards>
          </Col>
        </Row>

        {/* Modal chỉnh sửa */}
        <Modal title="Edit Room" visible={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
          <Form form={form} layout="vertical">
            <Form.Item label="Room ID" name="room_id">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Room Name"
              name="room_name"
              rules={[{ required: true, message: 'Please enter room name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Room Address"
              name="room_address"
              rules={[{ required: true, message: 'Please enter room address!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Room Description"
              name="room_description"
              rules={[{ required: true, message: 'Please enter room description!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Room Color"
              name="room_color"
              rules={[{ required: true, message: 'Please select a room color!' }]}
            >
              <Input type="color" />
            </Form.Item>
            <Form.Item
              label="Room Status"
              name="room_status"
              rules={[{ required: true, message: 'Please select room status!' }]}
            >
              <Radio.Group>
                <Radio value={0}>Ẩn</Radio>
                <Radio value={1}>Hiển thị</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm mới */}
        <Modal title="Add New Room" visible={isAddModalVisible} onOk={handleAddModalOk} onCancel={handleAddModalCancel}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Room Name"
              name="room_name"
              rules={[{ required: true, message: 'Please enter room name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Room Address"
              name="room_address"
              rules={[{ required: true, message: 'Please enter room address!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Room Description"
              name="room_description"
              rules={[{ required: true, message: 'Please enter room description!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Room Color"
              name="room_color"
              rules={[{ required: true, message: 'Please select a room color!' }]}
            >
              <Input type="color" />
            </Form.Item>

            <Form.Item name="room_status" initialValue={1} hidden>
              <Input type="hidden" />
            </Form.Item>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default RoomTable;
