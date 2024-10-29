import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Switch, useRouteMatch, useHistory, NavLink, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  Table,
  Spin,
  message,
  Popconfirm,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
} from 'antd';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Main } from '../../styled';
import moment from 'moment';
import {
  getRecruitNews,
  storeRecruitNews,
  updateRecruitNews,
  showRecruitNews,
  deleteRecruitNews,
} from '../../../apis/employees/recruit';
import {storeEmployeesFile} from "../../../apis/employees/employee";

// eslint-disable-next-line import/no-self-import
const RecruitNews = lazy(() => import('./Recruit_news'));
const { Option } = Select;

function Recruit_news() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const { target_id } = useParams();
  const [fileList, setFileList] = useState([]); // To manage file uploads

  // Fetch danh sách nhân sự
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRecruitNews();
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
      const res = await getRecruitNews();
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
    if (record) {
      // Convert dates to moment if needed
      if (record.news_start_date) {
        record.news_start_date = moment(record.news_start_date);
      }
      if (record.news_end_date) {
        record.news_end_date = moment(record.news_end_date);
      }

      setEditingEmployee(record);
      form.setFieldsValue(record);
      setFileList([]); // Clear file list on editing
    } else {
      setEditingEmployee(null);
      form.resetFields(); // Reset form fields
      setFileList([]); // Clear file list for new entry
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (news_id) => {
    try {
      await deleteRecruitNews(news_id);
      message.success('Xóa nhân sự thành công.');
      fetchData();
    } catch (error) {
      message.error('Xóa nhân sự thất bại.');
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();

      // Convert date formats
      if (values.news_start_date) {
        values.news_start_date = values.news_start_date.format('YYYY-MM-DD');
      }
      if (values.news_end_date) {
        values.news_end_date = values.news_end_date.format('YYYY-MM-DD');
      }

      let res;
      if (editingEmployee) {
        res = await updateRecruitNews(values, editingEmployee.news_id);
        message.success('Cập nhật chỉ tiêu tuyển dụng thành công.');
      } else {
        res = await storeRecruitNews(values);
        if (!res.error) {
          setDataSource((prev) => [...prev, res.data.data]);
          message.success('Thêm mới chỉ tiêu tuyển dụng thành công.');
        } else {
          message.error(res.message || 'Thêm mới thất bại.');
        }
      }

      // Handle file upload if there's a file selected
      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append('employee_file', fileList[0]); // Assuming only one file is uploaded
        formData.append('name', values.news_title); // Add other required fields
        formData.append('description', values.news_content);
        formData.append('target_id', target_id); // Include target_id if necessary

        const fileUploadRes = await storeEmployeesFile(formData);
        if (fileUploadRes.success) {
          message.success('Tệp nhân sự đã được lưu thành công.');
        } else {
          message.error('Lưu tệp nhân sự thất bại.');
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
    { title: 'ID', dataIndex: 'news_id', key: 'news_id' },
    { title: 'Tên tin tức', dataIndex: 'news_title', key: 'news_title' },
    { title: 'Nội dung tin tức', dataIndex: 'news_content', key: 'news_content' },
    { title: 'Mức lương', dataIndex: 'news_salary', key: 'news_salary' },
    { title: 'Thời gian bắt đầu', dataIndex: 'news_start_date', key: 'news_start_date' },
    { title: 'Thời gian kết thúc', dataIndex: 'news_end_date', key: 'news_end_date' },
    {
      title: 'Trạng thái',
      dataIndex: 'news_status',
      key: 'news_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>{status === 1 ? 'Đang tuyển' : 'Dừng tuyển'}</span>
      ),
    },
    {
      title: 'Ứng viên',
      dataIndex: 'news_id',
      key: 'recruit_candidates',
      render: (news_id) => <NavLink to={`/admin/tuyen-dung/ung-vien/${news_id}`}>Danh sách</NavLink>,
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
            onConfirm={() => handleDelete(record.news_id)}
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
      <Row gutter={15}>
        <Col xs={24}>
          <Cards title="Danh sách tin tuyển dụng">
            <Button type="primary" onClick={() => handleOpenModal(null)} style={{ marginBottom: 16 }}>
              Thêm mới tin tuyển dụng
            </Button>
            {loading ? (
              <Spin tip="Loading..." />
            ) : (
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                rowKey="news_id"
              />
            )}
          </Cards>
        </Col>
      </Row>
      <Modal
        title={editingEmployee ? 'Cập nhật tin tuyển dụng' : 'Thêm mới tin tuyển dụng'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateOrUpdate}>
          <Form.Item
            name="news_title"
            label="Tên tin tức"
            rules={[{ required: true, message: 'Vui lòng nhập tên tin tức' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="news_content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung tuyển dụng' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="news_salary"
            label="Mức lương"
            rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="news_start_date"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="news_end_date"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="news_status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={1}>Đang tuyển</Option>
              <Option value={0}>Dừng tuyển</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
          <Form.Item name="target_id" initialValue={target_id} hidden>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
}

export default Recruit_news;
