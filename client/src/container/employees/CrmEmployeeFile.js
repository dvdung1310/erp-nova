import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch, useParams } from 'react-router-dom';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import {
  getEmployeesFile,
  createEmployeesFile,
  storeEmployeesFile,
  editEmployeesFile,
  updateEmployeesFile,
  deleteEmployeesFile,
} from '../../apis/employees/employee';

const { Option } = Select;

function CrmEmployees() {
  const { path } = useRouteMatch();
  const { employee_id } = useParams();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [categoryFile, setCategoryFile] = useState([]); // Define state for category files

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployeesFile(employee_id);
      console.log('Employee Files:', res);

      if (!res.error) {
        setDataSource(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreateData = async () => {
    try {
      const res = await createEmployeesFile();
      if (!res.error) {
        setCategoryFile(res.data.categoryFile || []); // Use defined setter
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error('Error fetching create data:', error);
      message.error('Không thể tải dữ liệu tạo mới.');
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
    fetchCreateData();
  }, []);

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee); // Lưu employee để biết đang sửa
  
    form.resetFields(); // Reset các giá trị của form trước
  
    if (employee) {
      form.setFieldsValue({
        category_id: employee.category_id,
        file_name: employee.file_name,
        file_discription: employee.file_discription,
        file_date: moment(employee.file_date), // Chuyển thành moment object
        file_status: employee.file_status,
        employee_id: employee.employee_id,
      });
    }
  
    setIsModalVisible(true); // Hiển thị modal
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // values.employee_date_join = values.employee_date_join.format('YYYY-MM-DD');

      let response;
      if (editingEmployee) {
        response = await updateEmployeesFile(values, editingEmployee.employee_id);
        message.success('Cập nhật thất bại!');
      } else {
        response = await storeEmployeesFile(values);
        setDataSource((prev) => [...prev, response.data.data]);
        message.success('Thêm mới thành công!');
      }
      setIsModalVisible(false);
      fetchData(); // Refresh data after save
    } catch (error) {
      console.error('Error:', error);
      message.error('Lưu thông tin thất bại.'+ error);
    }
  };

  const handleDelete = async (id) => {
    console.log('Deleting employee with ID:', id); // Log ID cần xóa
    try {
        const res = await deleteEmployeesFile(id);
        console.log('API response:', res); // Log phản hồi từ API
        if (res.success) {
            setDataSource((prev) => {
                const newDataSource = prev.filter((item) => item.file_id !== id);
                console.log('Updated dataSource:', newDataSource); 
                return newDataSource;
            });
            message.success('Xóa nhân sự thành công!');
        } else {
            message.error(res.message || 'Xóa nhân sự thất bại.');
        }
    } catch (error) {
        console.error('Error during deletion:', error); // Log lỗi
        message.error('Xóa nhân sự thất bại.');
    }
};


  const columns = [
    { title: 'ID', dataIndex: 'file_id', key: 'file_id' },
    { title: 'Tên hồ sơ', dataIndex: 'file_name', key: 'file_name' },
    { title: 'Mô tả', dataIndex: 'file_discription', key: 'file_discription' },
    { title: 'Ngày', dataIndex: 'file_date', key: 'file_date' },
    { title: 'File', dataIndex: 'file', key: 'file' },
    {
      title: 'Trạng thái',
      dataIndex: 'file_status',
      key: 'file_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>{status === 1 ? 'Hiển thị' : 'Ẩn'}</span>
      ),
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => moment(created_at??"").format('DD-MM-YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa không?"
            onConfirm={() => handleDelete(record.file_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Xóa
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
              <Cards title="Danh sách hồ sơ nhân sự">
                <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
                  Thêm mới hồ sơ
                </Button>
                {loading ? (
                  <Spin tip="Loading..." />
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
      </Switch>

      <Modal
        title={editingEmployee ? 'Sửa hồ sơ' : 'Thêm hồ sơ'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categoryFile.map((dept) => (
                <Option key={dept.category_id} value={dept.category_id}>
                  {dept.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="file_name"
            label="Tên file"
            rules={[{ required: true, message: 'Vui lòng tên file!' }]}>
            <Input placeholder="Nhập tên file" />
          </Form.Item>
          <Form.Item name="file_discription" label="Mô Tả" rules={[{ required: false }]}>
            <Input.TextArea placeholder="Nhập mô tả" rows={3} />
          </Form.Item>
          <Form.Item
            name="file_date"
            label="Ngày tạo hồ sơ"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="file" label="Tải file" rules={[{ required: true, message: 'Vui lòng tải file!' }]}>
            <Input type="file" />
          </Form.Item>
          <Form.Item name="employee_id" initialValue={employee_id} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="file_status" initialValue={1} hidden>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default CrmEmployees;
