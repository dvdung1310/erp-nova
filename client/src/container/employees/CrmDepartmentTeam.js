import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select } from 'antd';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import {getdepartmentteam,storeDepartmentTeam,updateDepartmentTeam} from '../../apis/employees/employee';
const { Option } = Select;

function CrmDepartmentTeam() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();
  const { departmentId } = useParams();

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await getdepartmentteam(departmentId);
        if (!res.error) {
            setDataSource(res.data);
        } else {
            message.error(res.message);
        }
    } catch (error) {
        message.error("Có lỗi xảy ra khi tải dữ liệu nhân sự.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentId]);

  // Add new status handler
  const handleAddNew = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    try {
      const newItem = await form.validateFields();
      const response = await storeDepartmentTeam(newItem);
      if (!response.data.error) {
        setDataSource([...dataSource, response.data]);
        message.success('Status added successfully');
      } else {
        message.error(response.data.message);
      }
      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add status');
    }
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleEdit = (record) => {
    setCurrentItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const updatedItem = form.getFieldsValue();
      const response = await updateDepartmentTeam(updatedItem,currentItem.team_id);
      message.success('Updated successfully');
      setDataSource((prevData) =>
        prevData.map((item) =>
          item.team_id === currentItem.team_id ? { ...item, ...updatedItem } : item
        )
      );
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to update the record');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'team_id', key: 'team_id' },
    { title: 'Tên nhóm', dataIndex: 'team_name', key: 'team_name' },
    {
      title: 'Trạng thái',
      dataIndex: 'team_status',
      key: 'team_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>
          {status === 1 ? 'Hiển thị' : 'Ẩn'}
        </span>
      ),
    },
    {
      title: 'Tùy chọn',
      key: 'actions',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Main>
      <Row gutter={15}>
        <Col xs={24}>
          <Cards title="Danh sách Team">
            <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
              Thêm mới
            </Button>
            {loading ? (
              <Spin tip="Loading..." />
            ) : (
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                rowKey="team_id"
              />
            )}
          </Cards>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Edit Status"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Team ID" name="team_id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Team Name"
            name="team_name"
            rules={[{ required: true, message: 'Please enter team name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="team_status"
            rules={[{ required: true, message: 'Please select team status!' }]}
          >
            <Select>
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Add New Status"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Team Name"
            name="team_name"
            rules={[{ required: true, message: 'Please enter team name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="team_status"
            rules={[{ required: true, message: 'Please select team status!' }]}
            initialValue={1}
          >
            <Select>
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
          <Form.Item name="department_id" initialValue={departmentId} hidden>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default CrmDepartmentTeam;
