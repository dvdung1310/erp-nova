import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Switch, useRouteMatch, useHistory, NavLink } from 'react-router-dom';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Main } from '../../styled';
import moment from 'moment';
import {
  getRecruitTarget,
  createRecruitTarget,
  storeRecruitTarget,
  updateRecruitTarget,
  deleteRecruitTarget,
} from '../../../apis/employees/recruit';
const RecruitNews = lazy(() => import('./Recruit_news'));
const { Option } = Select;

function CrmEmployees() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Fetch danh sách nhân sự
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRecruitTarget();
      if (!res.error) {
        setDataSource(res.data.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách phòng ban
  const fetchDepartments = async () => {
    try {
      const res = await createRecruitTarget();
      if (!res.error) {
        setDepartments(res.data.departments || []);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu phòng ban.');
    }
  };

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  const handleOpenModal = (record) => {
    // Check if record is null (i.e., for adding a new entry)
    if (record) {
      // Chuyển đổi ngày sang định dạng moment nếu cần
      if (record.target_start_date) {
        record.target_start_date = moment(record.target_start_date); // Chuyển đổi sang moment
      }
      if (record.target_end_date) {
        record.target_end_date = moment(record.target_end_date); // Chuyển đổi sang moment
      }

      setEditingEmployee(record);
      form.setFieldsValue(record);
    } else {
      // If record is null, clear the form for adding a new entry
      setEditingEmployee(null);
      form.resetFields(); // Reset form fields to clear any previous values
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (targetId) => {
    try {
      await deleteRecruitTarget(targetId);
      message.success('Xóa nhân sự thành công.');
      fetchData();
    } catch (error) {
      message.error('Xóa nhân sự thất bại.');
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();

      // Chuyển đổi định dạng ngày
      if (values.target_start_date) {
        values.target_start_date = values.target_start_date.format('YYYY-MM-DD'); // Định dạng theo yêu cầu của API
      }
      if (values.target_end_date) {
        values.target_end_date = values.target_end_date.format('YYYY-MM-DD'); // Định dạng theo yêu cầu của API
      }
      let res;
      if (editingEmployee) {
        res = await updateRecruitTarget(values, editingEmployee.target_id);
        message.success('Cập nhật chỉ tiêu tuyển dụng thành công.');
      } else {
        res = await storeRecruitTarget(values);
        if (!res.error) {
          setDataSource((prev) => [...prev, res.data.data]);
          message.success('Thêm mới chỉ tiêu tuyển dụng thành công.');
        } else {
          message.error(res.message || 'Thêm mới thất bại.');
        }
      }

      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      message.error('Lưu chỉ tiêu tuyển dụng thất bại.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'target_id', key: 'target_id' },
    { title: 'Vị trí', dataIndex: 'target_position', key: 'target_position' },
    { title: 'Mức lương', dataIndex: 'target_amout', key: 'target_amout' },
    { title: 'Thời gian bắt đầu', dataIndex: 'target_start_date', key: 'target_start_date' },
    { title: 'Thời gian kết thúc', dataIndex: 'target_end_date', key: 'target_end_date' },
    { title: 'Phòng ban', dataIndex: 'department_name', key: 'department_name' },
    {
      title: 'Tin tuyển dụng',
      dataIndex: 'target_id',
      key: 'target_news',
      render: (target_id) => <NavLink to={`/admin/tuyen-dung/tin-tuyen-dung/${target_id}`}>Danh sách</NavLink>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'target_status',
      key: 'target_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>{status === 1 ? 'Hiển thị' : 'Ẩn'}</span>
      ),
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
            title="Bạn có chắc muốn xóa nhân sự này không?"
            onConfirm={() => handleDelete(record.target_id)}
            okText="Có"
            cancelText="Không"
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
              <Cards title="Danh sách nhân sự">
                <Button type="primary" onClick={() => handleOpenModal(null)} style={{ marginBottom: 16 }}>
                  Thêm mới chỉ tiêu tuyển dụng
                </Button>
                {loading ? (
                  <Spin tip="Loading..." />
                ) : (
                  <Table
                    className="table-responsive"
                    pagination={false}
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="target_id"
                  />
                )}
              </Cards>
            </Col>
          </Row>
        </Route>
        <Route path={`/admin/tuyen-dung/tin-tuyen-dung/:target_id`}>
          <Suspense fallback={<div>Loading...</div>}>
            <RecruitNews />
          </Suspense>
        </Route>
      </Switch>
      <Modal
        title={editingEmployee ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateOrUpdate}>
          <Form.Item
            name="target_position"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="target_quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="target_amout"
            label="Mức lương"
            rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="target_start_date"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="target_end_date"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="department_id"
            label="Phòng ban"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select placeholder="Chọn phòng ban">
              {departments.map((dep) => (
                <Option key={dep.department_id} value={dep.department_id}>
                  {dep.department_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="target_status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={1}>Hiển thị</Option>
              <Option value={0}>Ẩn</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default CrmEmployees;
