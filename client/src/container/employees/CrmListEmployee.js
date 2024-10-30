import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Switch, useRouteMatch, useHistory, NavLink } from 'react-router-dom';
import { Row, Col, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { getEmployees, createEmployees, deleteEmployees, updateEmployees, storeEmployees } from '../../apis/employees/employee';
import { UserCard } from '../../container/pages/style';

const EmployeeFile = lazy(() => import('./CrmEmployeeFile'));
const { Option } = Select;

function CrmEmployees() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentTeams, setDepartmentTeams] = useState([]);
  const [employeeLevels, setEmployeeLevels] = useState([]);

  // Fetch employees data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
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
      message.error("Không thể tải dữ liệu tạo mới.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchCreateData(); // Fetch create data on component mount
  }, []);

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
        response = await storeEmployees(values);
        setDataSource((prev) => [...prev, response.data.data]); // Update data source
        message.success('Thêm nhân sự thành công!');
      }
      setIsModalVisible(false);
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
      if (res.success) {
        setDataSource((prev) => prev.filter((item) => item.employee_id !== id)); // Remove deleted employee
        message.success('Xóa nhân sự thành công!');
      } else {
        message.error(res.message || 'Xóa nhân sự thất bại.');
      }
    } catch (error) {
      message.error(error.message || 'Xóa nhân sự thất bại.');
    }
  };

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
                  <Row gutter={16}>
                    {dataSource.map((employee) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={employee.employee_id}>
                        <UserCard>
                          <div className="card user-card">
                            <Cards headless>
                              <figure>
                                {/* Use default image if imgUrl is not available */}
                                {/* <img src={employee.imgUrl || require('../../../static/img/users/1.png')} alt={employee.employee_name} /> */}
                                {/* <img src='' alt={employee.employee_name} /> */}
                              </figure>
                              <figcaption>
                                <div className="card__content">
                                  <h6 className="card__name">{employee.employee_name}</h6>
                                  <p className="card__designation">{employee.level_name}</p>
                                </div>
                                <div className="card__actions">
                                  <Button type="link" onClick={() => handleOpenModal(employee)}>Edit</Button>
                                  <Popconfirm
                                    title="Bạn có chắc muốn xóa nhân sự này không?"
                                    onConfirm={() => handleDelete(employee.employee_id)}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <Button type="link" danger>
                                      Delete
                                    </Button>
                                  </Popconfirm>
                                </div>
                              </figcaption>
                            </Cards>
                          </div>
                        </UserCard>
                      </Col>
                    ))}
                  </Row>
                )}
              </Cards>
            </Col>
          </Row>
        </Route>
        <Route path={`/admin/nhan-su/ho-so/:employee_id`}>
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
          <Form.Item
            label="Địa chỉ"
            name="employee_address"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="CMND"
            name="employee_identity"
            rules={[{ required: true, message: 'Vui lòng nhập CMND!' }]}
          >
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
              {departments.map(department => (
                <Option key={department.department_id} value={department.department_id}>
                  {department.department_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Team"
            name="team_id"
            rules={[{ required: true, message: 'Vui lòng chọn team!' }]}
          >
            <Select placeholder="Chọn team">
              {departmentTeams.map(team => (
                <Option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Vị trí"
            name="level_id"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
          >
            <Select placeholder="Chọn vị trí">
              {employeeLevels.map(level => (
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
    </Main>
  );
}

export default CrmEmployees;
