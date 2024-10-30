import React, {useEffect, useState, lazy, Suspense} from 'react';
import {Route, Switch, useRouteMatch, useHistory, NavLink} from 'react-router-dom';
import {Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker} from 'antd';
import moment from 'moment';
import {Cards} from '../../components/cards/frame/cards-frame';
import {Main} from '../styled';
import {
    getEmployees,
    createEmployees,
    deleteEmployees,
    updateEmployees,
    storeEmployees
} from '../../apis/employees/employee';

const EmployeeFile = lazy(() => import('./CrmEmployeeFile'));
const {Option} = Select;

function CrmEmployees() {
    const {path} = useRouteMatch();
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [departmentTeams, setDepartmentTeams] = useState([]);
    const [employeeLevels, setEmployeeLevels] = useState([]);

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
        fetchCreateData(); // Call this function on component mount
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
        setIsModalVisible(true);
    };
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            values.employee_date_join = values.employee_date_join.format('YYYY-MM-DD');
            let response;
            if (editingEmployee) {
                // Cập nhật thông tin nhân viên
                response = await updateEmployees(values, editingEmployee.employee_id);
                message.success('Cập nhật nhân sự thành công!');
            } else {
                // Thêm mới nhân viên
                response = await storeEmployees(values);
                setDataSource((prev) => [...prev, response.data.data]);
                message.success('Thêm nhân sự thành công!');
            }
            // Đóng modal và làm mới dữ liệu
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error('Error:', error); // Log chi tiết lỗi để dễ theo dõi
            message.error('Lưu thông tin nhân sự thất bại.'); // Thông báo lỗi cho người dùng
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteEmployees(id);
            if (res.success) {
                setDataSource((prev) => prev.filter((item) => item.employeeId !== id));
                message.success('Xóa nhân sự thành công!');
            } else {
                message.error(res.message || 'Xóa nhân sự thất bại.');
            }
        } catch (error) {
            message.error(error.message || 'Xóa nhân sự thất bại.');
        }
    };

    const columns = [
        {title: 'ID', dataIndex: 'employee_id', key: 'employee_id'},
        {title: 'Họ Tên', dataIndex: 'employee_name', key: 'employee_name'},
        {title: 'Email cá nhân', dataIndex: 'employee_email', key: 'employee_email'},
        {title: 'Email Nova', dataIndex: 'employee_email_nova', key: 'employee_email_nova'},
        {title: 'SĐT', dataIndex: 'employee_phone', key: 'employee_phone'},
        {title: 'Địa chỉ', dataIndex: 'employee_address', key: 'employee_address'},
        {title: 'CMND', dataIndex: 'employee_identity', key: 'employee_identity'},
        {title: 'Số tài khoản', dataIndex: 'employee_bank_number', key: 'employee_bank_number'},
        {title: 'Phòng ban', dataIndex: 'department_name', key: 'department_name'},
        {title: 'Team', dataIndex: 'team_name', key: 'team_name'},
        {title: 'Vị trí', dataIndex: 'level_name', key: 'level_name'},
        {
            title: 'Trạng thái',
            dataIndex: 'employee_status',
            key: 'employee_status',
            render: (status) => (
                <span style={{color: status === 1 ? 'blue' : 'orange'}}>{status === 1 ? 'Hiển thị' : 'Ẩn'}</span>
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
            dataIndex: 'employee_id',
            key: 'file',
            render: (employee_id) => (
                <NavLink to={`/admin/nhan-su/ho-so/${employee_id}`}>Hồ sơ</NavLink>
            ),
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
                        onConfirm={() => handleDelete(record.employee_id)}
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
                                <Button type="primary" onClick={() => handleOpenModal()} style={{marginBottom: 16}}>
                                    Thêm mới nhân sự
                                </Button>
                                {loading ? (
                                    <div className='spin'>
                                        <Spin/>
                                    </div>
                                ) : (
                                    <Table
                                        className="table-responsive"
                                        pagination={false}
                                        dataSource={dataSource}
                                        columns={columns}
                                        rowKey="employee_id"
                                    />
                                )}
                            </Cards>
                        </Col>
                    </Row>
                </Route>
                <Route path={`/admin/nhan-su/ho-so/:employee_id`}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <EmployeeFile/>
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
                        rules={[{required: true, message: 'Vui lòng nhập tên nhân sự!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="SĐT"
                        name="employee_phone"
                        rules={[{required: true, message: 'Vui lòng nhập số điện thoại!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Email cá nhân"
                        name="employee_email"
                        rules={[{required: true, message: 'Vui lòng nhập email cá nhân!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Email Nova"
                        name="employee_email_nova"
                        rules={[{required: true, message: 'Vui lòng nhập email Nova!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="employee_address"
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="CMND"
                        name="employee_identity"
                        rules={[{required: true, message: 'Vui lòng nhập CMND!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Số tài khoản"
                        name="employee_bank_number"
                        rules={[{required: true, message: 'Vui lòng nhập số tài khoản!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Phòng ban"
                        name="department_id"
                        rules={[{required: true, message: 'Vui lòng chọn phòng ban!'}]}
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
                        rules={[{required: true, message: 'Vui lòng chọn team!'}]}
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
                        rules={[{required: true, message: 'Vui lòng chọn vị trí!'}]}
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
                        label="Ngày tham gia"
                        name="employee_date_join"
                        rules={[{required: true, message: 'Vui lòng chọn ngày tham gia!'}]}
                    >
                        <DatePicker format="DD-MM-YYYY"/>
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="employee_status"
                        rules={[{required: true, message: 'Vui lòng chọn trạng thái!'}]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value={1}>Hiển thị</Option>
                            <Option value={0}>Ẩn</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Main>
    );
}

export default CrmEmployees;
