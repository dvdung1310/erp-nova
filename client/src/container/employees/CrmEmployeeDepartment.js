import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Switch, useRouteMatch, useHistory, NavLink, useParams } from 'react-router-dom';
import { Row, Col, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import {
  DeleteOutlined,
  FormOutlined,
  PhoneOutlined,
  MailOutlined,
  SnippetsOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  getEmployees,
  createEmployees,
  deleteEmployees,
  updateEmployees,
  storeEmployees,
  updateRoleUser,
  getDepartEmployee,
} from '../../apis/employees/employee';
import { UserCard } from '../pages/style';

const EmployeeFile = lazy(() => import('./CrmEmployeeFile'));
const { Option } = Select;

function CrmEmployees() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);
  const [allData, setAllData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [employeeDepartment, setemployeeDepartment] = useState([]);
  const [userLogin, setUserLogin] = useState(null);
  const [roleUser, setRoleUser] = useState([]);
  const [roleSelected, setroleSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentTeams, setDepartmentTeams] = useState([]);
  const [employeeLevels, setEmployeeLevels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [departmentName, setdepartmentName] = useState('');
  const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
  const { department_id } = useParams();
  // Fetch employees data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDepartEmployee(department_id);
      if (!res.error) {
        setDataSource(res.data);
        setAllData(res.data);
        setUserLogin(res.user_login);
        setRoleUser(res.rule_employee);
        setdepartmentName(res.department_name);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments, teams, and employee levels for the form
  const fetchCreateData = async () => {
    try {
      const res = await createEmployees();
      if (!res.error) {
        setDepartments(res.data.departments || []);
        setDepartmentTeams(res.data.department_teams || []);
        setEmployeeLevels(res.data.employee_levels || []);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu tạo mới.');
    }
  };
  useEffect(() => {
    fetchData();
    fetchCreateData(); // Fetch create data on component mount
  }, []);
  const handleSearch = () => {
    const filteredData = allData.filter((employee) => {
      const keyword = searchKeyword.toLowerCase();
      return (
        employee.employee_name?.toLowerCase().includes(keyword) || // Tìm kiếm theo tên
        employee.employee_email?.toLowerCase().includes(keyword) || // Tìm kiếm theo email
        employee.department_name?.toLowerCase().includes(keyword) // Tìm kiếm theo phòng ban
      );
    });
    setDataSource(filteredData); // Cập nhật danh sách nhân sự
  };
  // Open modal for editing or adding an employee
  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    form.resetFields();

    if (employee) {
      form.setFieldsValue({
        ...employee,
        employee_date_join: moment(employee.employee_date_join), // Format date
      });
    }
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      values.employee_date_join = values.employee_date_join.format('YYYY-MM-DD'); // Format date
      let response;

      if (editingEmployee) {
        response = await updateEmployees(values, editingEmployee.employee_id);
        message.success('Cập nhật nhân sự thành công!');
      } else {
        try {
          response = await storeEmployees(values);
          if (response?.error) {
            message.error(response?.message);
            return;
          }
          setDataSource((prev) => [...prev, response.data.data]); // Update data source
          message.success('Thêm nhân sự thành công!');
        } catch (error) {
          console.error('Error:', error);
          message.error('Đã có lỗi xảy ra.');
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchData(); // Refetch data after submission
    } catch (error) {
      console.error('Error:', error);
      message.error('Lưu thông tin nhân sự thất bại.');
    }
  };

  // Handle employee deletion
  const handleDelete = async (id) => {
    try {
      const res = await deleteEmployees(id);
      setDataSource((prev) => prev.filter((item) => item.employee_id !== id)); // Remove deleted employee
      message.success('Xóa nhân sự thành công!');
    } catch (error) {
      message.error(error.message || 'Xóa nhân sự thất bại.');
    }
  };

  const handlechangeRule = (employee) => {
    // Mở modal để chỉnh sửa
    setroleSelected(employee);
    setIsModalOpen(true);
  };

  // Xử lý submit
  const handleUpdateRole = async (values) => {
    try {
      // Gửi dữ liệu đến API qua hàm updateRoleUser
      const response = await updateRoleUser(values);

      message.success('Cập nhật thành công!');
      setIsModalOpen(false); // Đóng modal sau khi cập nhật thành công
    } catch (error) {
      // Xử lý lỗi xảy ra trong quá trình gọi API
      message.error('Cập nhật không thành công!');
    }
  };
  const handleCancel = () => {
    // Đóng modal và reset form
    setIsModalOpen(false);
    form.resetFields(); // Xóa toàn bộ giá trị trong form
  };
  return (
    <Main style={{ background: '#fff' }}>
      <Switch>
        <Route exact path={path}>
          <Row gutter={15}>
            <Col xs={24}>
              <div style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>DANH SÁCH NHÂN SỰ - {departmentName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Search Form */}
                    <Input
                      placeholder="Tìm kiếm nhân sự"
                      style={{ width: 200, height: '40px'}}
                      value={searchKeyword}
                      onChange={(e) => {
                        setSearchKeyword(e.target.value);
                        handleSearch();
                      }}
                    />
                  </div>
                  <Button type="primary" onClick={() => handleOpenModal()} style={{ height: '40px' }}>
                    Thêm mới nhân sự
                  </Button>
                </div>
                {loading ? (
                  <Spin tip="Loading..." />
                ) : (
                  <Row gutter={16} style={{ marginTop: '30px' }}>
                    {dataSource.map((employee) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={employee.employee_id}>
                        <UserCard>
                          <div
                            className="card user-card"
                            style={{
                              boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                              padding: '5px',
                              borderRadius: '5px',
                              marginBottom: '15px',
                            }}
                          >
                            <Cards headless>
                              <figure>
                                {/* Use default image if imgUrl is not available */}
                                <img
                                  style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                  }}
                                  src={
                                    employee.avatar
                                      ? LARAVEL_SERVER + employee.avatar
                                      : require('../../static/img/users/1.png')
                                  }
                                  alt={employee.employee_name}
                                />
                                {/* <img src='' alt={employee.employee_name} /> */}
                              </figure>
                              <figcaption>
                                <div className="card__content">
                                  <h6 className="card__name">{employee.employee_name}</h6>
                                  <p className="card__designation">
                                    {employee.level_name}-{employee.department_name}
                                  </p>
                                </div>
                                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneOutlined
                                      style={{
                                        marginRight: '8px',
                                        color: '#1890ff',
                                      }}
                                    />
                                    <p style={{ margin: 0 }}>{employee.employee_phone}</p>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {/* <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> */}
                                    <MailOutlined
                                      style={{
                                        marginRight: '8px',
                                        color: '#1890ff',
                                      }}
                                    />
                                    <p style={{ margin: 0 }}>{employee.employee_email}</p>
                                  </div>
                                  {userLogin && userLogin && (
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <SnippetsOutlined
                                        style={{
                                          marginRight: '8px',
                                          color: '#1890ff',
                                        }}
                                      />
                                      <NavLink
                                        to={`/admin/nhan-su/ho-so/${employee.employee_id}`}
                                        style={{
                                          color: 'inherit',
                                          textDecoration: 'none',
                                        }}
                                      >
                                        Hồ sơ
                                      </NavLink>
                                    </div>
                                  )}
                                </div>
                                {userLogin && userLogin && (
                                  <div className="card__actions">
                                    <NavLink
                                      to={`/admin/nhan-su/profile/${employee.employee_id}`}
                                      style={{ color: 'inherit', textDecoration: 'none' }}
                                    >
                                      {' '}
                                      <Button type="link" style={{ padding: '0px' }}>
                                        {' '}
                                        <EyeOutlined />{' '}
                                      </Button>{' '}
                                    </NavLink>
                                    <Button
                                      type="link"
                                      style={{ padding: '8px' }}
                                      onClick={() => handleOpenModal(employee)}
                                    >
                                      <FormOutlined />
                                    </Button>
                                    <Button
                                      type="link"
                                      style={{ padding: '8px' }}
                                      onClick={() => handlechangeRule(employee)}
                                    >
                                      <SafetyCertificateOutlined />
                                    </Button>

                                    <Popconfirm
                                      title="Bạn có chắc muốn xóa nhân sự này không?"
                                      onConfirm={() => handleDelete(employee.employee_id)}
                                      okText="Yes"
                                      cancelText="No"
                                    >
                                      <Button style={{ padding: '8px' }} type="link" danger>
                                        <DeleteOutlined />
                                      </Button>
                                    </Popconfirm>
                                  </div>
                                )}
                              </figcaption>
                            </Cards>
                          </div>
                        </UserCard>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </Route>
        <Route path={`/admin/nhan-su/ho-so/:employee_id`}>
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeFile />
          </Suspense>
        </Route>
        {/* <Route path={`/admin/nhan-su/nhan-vien-theo-phong/:department_id`}>
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeFile />
          </Suspense>
        </Route> */}
      </Switch>

      <Modal
        title={editingEmployee ? 'Cập nhật nhân viên' : 'Thêm mới nhân viên'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Họ Tên"
            name="employee_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân sự!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="SĐT"
            name="employee_phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email cá nhân"
            name="employee_email"
            rules={[{ required: true, message: 'Vui lòng nhập email cá nhân!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email Nova"
            name="employee_email_nova"
            rules={[{ required: true, message: 'Vui lòng nhập email Nova!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="employee_address">
            <Input />
          </Form.Item>
          <Form.Item label="CMND" name="employee_identity" rules={[{ required: true, message: 'Vui lòng nhập CMND!' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Số tài khoản"
            name="employee_bank_number"
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phòng ban"
            name="department_id"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
          >
            <Select placeholder="Chọn phòng ban">
              {departments.map((department) => (
                <Option key={department.department_id} value={department.department_id}>
                  {department.department_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Team" name="team_id">
            <Select placeholder="Chọn team">
              {departmentTeams.map((team) => (
                <Option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Vị trí" name="level_id" rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}>
            <Select placeholder="Chọn vị trí">
              {employeeLevels.map((level) => (
                <Option key={level.level_id} value={level.level_id}>
                  {level.level_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Ngày vào làm"
            name="employee_date_join"
            rules={[{ required: true, message: 'Vui lòng chọn ngày vào làm!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cập nhật quyền nhân sự"
        visible={isModalOpen}
        onCancel={handleCancel} // Xử lý khi đóng modal (nút "X" hoặc click ra ngoài)
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Đóng
          </Button>,
          <Button key="submit" type="primary" form="updateRoleForm" htmlType="submit">
            Update
          </Button>,
        ]} // Tùy chỉnh footer
        maskClosable // Cho phép đóng modal khi click ra ngoài
      >
        <Form
          id="updateRoleForm" // Thêm ID để gắn nút submit vào form
          form={form}
          layout="vertical"
          onFinish={handleUpdateRole} // Xử lý khi submit form
          initialValues={{
            account_id: roleSelected?.account_id, // Gán giá trị mặc định cho trường account_id
            role: roleSelected?.role_id, // Gán giá trị mặc định cho trường role
          }}
        >
          {/* Trường ẩn để lưu account_id */}
          <Form.Item name="account_id" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Dropdown chọn quyền */}
          <Form.Item
            name="role"
            label="Chọn quyền nhân sự"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Chọn quyền">
              {roleUser.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default CrmEmployees;
