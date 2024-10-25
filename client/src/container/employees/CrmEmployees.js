import React, { useEffect, useState, lazy, Suspense } from 'react'; // Added lazy import
import { Route, Switch, useRouteMatch, useHistory, NavLink } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import API_ENDPOINTS from '../../apis/crm'; // Ensure this file is accessible
const { Option } = Select;
const EmployeeFile = lazy(() => import('./CrmEmployeeFile')); // Updated import

function CrmEmployees() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [dataStatuses, setDataStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentTeams, setDepartmentTeams] = useState([]);
  const [employeeLevels, setEmployeeLevels] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.employee);
      if (!response.data.error) {
        setDataSource(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu phòng ban, team, vị trí để tạo mới
  const fetchCreateData = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.employee}/create`);
      if (!response.data.error) {
        const {
          departments: fetchedDepartments,
          departmentTeams: fetchedDepartmentTeams,
          employeeLevels: fetchedEmployeeLevels,
        } = response.data.data; // Updated variable names
        setDepartments(fetchedDepartments);
        setDepartmentTeams(fetchedDepartmentTeams);
        setEmployeeLevels(fetchedEmployeeLevels);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu tạo mới.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    form.resetFields();

    if (employee) {
      form.setFieldsValue({
        ...employee,
        employee_date_join: moment(employee.employee_date_join),
      });
    }
    fetchCreateData();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      values.employee_date_join = values.employee_date_join.format('YYYY-MM-DD');

      if (editingEmployee) {
        await axios.put(`${API_ENDPOINTS.employee}/${editingEmployee.employeeId}`, values); // Updated to employeeId
        message.success('Cập nhật nhân sự thành công!');
      } else {
        const response = await axios.post(API_ENDPOINTS.employee, values);
        setDataSource((prev) => [...prev, response.data.data]);
        message.success('Thêm nhân sự thành công!');
      }

      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lưu thông tin nhân sự thất bại.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_ENDPOINTS.employee}/${id}`);
      setDataSource((prev) => prev.filter((item) => item.employeeId !== id)); // Updated to employeeId
      message.success('Xóa nhân sự thành công!');
    } catch (error) {
      message.error('Xóa nhân sự thất bại.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'employee_id', key: 'employee_id' }, // Updated to employeeId
    { title: 'Họ Tên', dataIndex: 'employee_name', key: 'employee_name' }, // Updated to employeeName
    { title: 'Email cá nhân', dataIndex: 'employee_email', key: 'employee_email' }, // Updated to employeeEmail
    { title: 'Email Nova', dataIndex: 'employee_email_nova', key: 'employee_email_nova' }, // Updated to employeeEmailNova
    { title: 'SĐT', dataIndex: 'employee_phone', key: 'employee_phone' }, // Updated to employeePhone
    { title: 'Địa chỉ', dataIndex: 'employee_address', key: 'employee_address' }, // Updated to employeeAddress
    { title: 'CMND', dataIndex: 'employee_identity', key: 'employee_identity' }, // Updated to employeeIdentity
    { title: 'Số tài khoản', dataIndex: 'employee_bank_number', key: 'department_name' }, // Updated to employeeBankNumber
    { title: 'Phòng ban', dataIndex: 'department_name', key: 'departmentName' }, // Updated to departmentName
    { title: 'Team', dataIndex: 'team_name', key: 'team_name' }, // Updated to teamName
    { title: 'Vị trí', dataIndex: 'level_name', key: 'level_name' }, // Updated to levelName
    {
      title: 'Trạng thái',
      dataIndex: 'employee_status', // Updated to employeeStatus
      key: 'employee_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>{status === 1 ? 'Hiển thị' : 'Ẩn'}</span>
      ),
    },
    {
      title: 'Ngày Tham gia',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('DD-MM-YYYY'),
    },
    {
      title: 'Hồ sơ',
      dataIndex: 'employee_id', // Make sure this is correct
      key: 'file',
      render: (employeeId) => <NavLink to={`${path}/ho-so`}>Hồ sơ</NavLink>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhân sự này không?"
            onConfirm={() => handleDelete(record.employeeId)} // Updated to employeeId
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Main>
      <Switch>
        <Route exact path={path}>
          <Row gutter={15}>
            <Col xs={24}>
              <Cards title="Danh sách nhân sự">
                <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
                  Thêm mới nhân sự
                </Button>
                {loading ? (
                  <Spin tip="Loading..." />
                ) : (
                  <Table
                    className="table-responsive"
                    pagination={false}
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="employeeId" // Updated to employeeId
                  />
                )}
              </Cards>
            </Col>
          </Row>
        </Route>
        {/* Define the route for employee profile */}
        <Route path={`${path}/ho-so`}>
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeFile />
          </Suspense>
        </Route>
      </Switch>

      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Họ Tên"
            name="employeeName" // Updated to employeeName
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân sự!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="SĐT"
            name="employeePhone" // Updated to employeePhone
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email cá nhân"
            name="employeeEmail" // Updated to employeeEmail
            rules={[{ required: true, message: 'Vui lòng nhập email cá nhân!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email Nova"
            name="employeeEmailNova" // Updated to employeeEmailNova
            rules={[{ required: true, message: 'Vui lòng nhập email Nova!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="employeeAddress" // Updated to employeeAddress
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="CMND"
            name="employeeIdentity" // Updated to employeeIdentity
            rules={[{ required: true, message: 'Vui lòng nhập CMND!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số tài khoản"
            name="employeeBankNumber" // Updated to employeeBankNumber
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phòng ban"
            name="departmentId" // Updated to departmentId
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
          >
            <Select placeholder="Chọn phòng ban">
              {departments.map((department) => (
                <Option key={department.id} value={department.id}>
                  {department.name}
                </Option> // Updated department mapping
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Team"
            name="teamId" // Updated to teamId
            rules={[{ required: true, message: 'Vui lòng chọn team!' }]}
          >
            <Select placeholder="Chọn team">
              {departmentTeams.map((team) => (
                <Option key={team.id} value={team.id}>
                  {team.name}
                </Option> // Updated team mapping
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Vị trí"
            name="levelId" // Updated to levelId
            rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
          >
            <Select placeholder="Chọn vị trí">
              {employeeLevels.map((level) => (
                <Option key={level.id} value={level.id}>
                  {level.name}
                </Option> // Updated level mapping
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày tham gia"
            name="employee_date_join" // Updated to employee_date_join
            rules={[{ required: true, message: 'Vui lòng chọn ngày tham gia!' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="employeeStatus" // Updated to employeeStatus
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Define your routes here */}
    </Main>
  );
}

export default CrmEmployees;
