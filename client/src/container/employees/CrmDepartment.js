// StatusCustomerTable.js
import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { Link, Route, Switch, useRouteMatch, useHistory, NavLink } from 'react-router-dom';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import API_ENDPOINTS from '../../apis/crm';

const { Option } = Select;

// Lazy load DepartmentTeam component
const DepartmentTeam = lazy(() => import('./CrmDepartmentTeam'));

function StatusCustomerTable() {
  const { path } = useRouteMatch();
  const history = useHistory();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.departments);
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

  const handleAddNew = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    try {
      const newDepartment = await form.validateFields();
      const response = await axios.post(API_ENDPOINTS.departments, newDepartment);

      if (!response.data.error) {
        setDataSource((prevData) => [...prevData, response.data.data]);
        message.success('Department added successfully');
      } else {
        message.error(response.data.message);
      }

      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add department');
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
      const updatedDepartment = form.getFieldsValue();
      await axios.put(`${API_ENDPOINTS.departments}/${currentItem.department_id}`, updatedDepartment);

      message.success('Department updated successfully');
      setDataSource((prevData) =>
        prevData.map((item) =>
          item.department_id === currentItem.department_id ? { ...item, ...updatedDepartment } : item,
        ),
      );
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to update the department');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'department_id', key: 'department_id' },
    { title: 'Phòng', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Trạng thái',
      dataIndex: 'department_status',
      key: 'department_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>{status === 1 ? 'Hiển thị' : 'Ẩn'}</span>
      ),
    },
    {
      title: 'Team',
      dataIndex: 'department_id',
      key: 'team',
      render: (department_id, record) => (
        <NavLink to={`${path}/teams/${department_id}`}>{record.department_name}</NavLink>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <Main>
      <Switch>
        <Route exact path={path}>
          <PageHeader ghost title="Danh sách phòng ban" />
          <Row gutter={15}>
            <Col xs={24}>
              <Cards title="Quản lý phòng ban">
                <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
                  Thêm phòng ban
                </Button>
                {loading ? (
                  <Spin tip="Loading..." />
                ) : (
                  <Table
                    className="table-responsive"
                    pagination={false}
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="department_id"
                  />
                )}
              </Cards>
            </Col>
          </Row>
        </Route>
        {/* Route for DepartmentTeam */}
        <Route path={`${path}/teams/:departmentId`}>
          <Suspense fallback={<div>Loading...</div>}>
            <DepartmentTeam />
          </Suspense>
        </Route>
      </Switch>

      <Modal title="Thêm phòng ban" visible={isAddModalVisible} onOk={handleAddModalOk} onCancel={handleAddModalCancel}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên phòng"
            name="department_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="department_status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Chỉnh sửa phòng ban" visible={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên phòng"
            name="department_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="department_status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default StatusCustomerTable;
