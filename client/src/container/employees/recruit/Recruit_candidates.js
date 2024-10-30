import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, Upload } from 'antd';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Main } from '../../styled';
import { toast } from 'react-toastify';
import {
  getRecruitCandidates,
  storeRecruitCandidates,
  updateRecruitCandidates,
  deleteRecruitCandidates,
} from '../../../apis/employees/recruit';
import { UploadOutlined } from '@ant-design/icons';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { Option } = Select;

function Recruit_news() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCvModalVisible, setIsCvModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [fileList, setFileList] = useState([]); // Quản lý danh sách file
  const [cvUrl, setCvUrl] = useState('');
  const { news_id } = useParams();
  // Fetch candidates data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRecruitCandidates();
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (record) => {
    setEditingEmployee(record || null);
    if (record) {
      form.setFieldsValue(record); // Set giá trị vào form
      // Nếu có file cũ, bạn có thể tải xuống và hiển thị nếu cần
    } else {
      form.resetFields(); // Reset form khi thêm mới
    }
    setFileList([]); // Đặt lại danh sách file
    setIsModalVisible(true);
  };

  const handleDelete = async (candidates_id) => {
    try {
      await deleteRecruitCandidates(candidates_id);
      message.success('Xóa nhân sự thành công.');
      fetchData();
    } catch (error) {
      message.error('Xóa nhân sự thất bại.');
    }
  };
  const handleOpenCvModal = (cvPath) => {
    const completePath = `${LARAVEL_SERVER}/storage/${cvPath}`; // Thay bằng đường dẫn của bạn
    console.log('====================================');
    console.log(completePath);
    console.log('====================================');
    setCvUrl(completePath);
    setIsCvModalVisible(true);
  };
  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form Values:', values); // Log the form values
      const formData = new FormData();
      // Append form fields to FormData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      // Append CV file if uploaded
      if (fileList.length > 0) {
        formData.append('candidates_cv', fileList[0].originFileObj);
      }
      let res;
      if (editingEmployee) {
        // Update candidate
        console.log('====================================');
        console.log(formData, editingEmployee);
        console.log('====================================');
        res = await updateRecruitCandidates(formData, editingEmployee.candidates_id);
        toast.success('Cập nhật ứng viên thành công.');
      } else {
        // Create new candidate
        res = await storeRecruitCandidates(formData);
        if (!res.error) {
          setDataSource((prev) => [...prev, res.data.data]);
          toast.success('Thêm mới ứng viên thành công.');
        } else {
          message.error(res.message);
        }
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error saving candidate:', error);
      message.error('Lưu ứng viên thất bại.');
    }
  };
  const columns = [
    { title: 'ID', dataIndex: 'candidates_id', key: 'candidates_id' },
    { title: 'Tên ứng viên', dataIndex: 'candidates_name', key: 'candidates_name' },
    { title: 'SĐT', dataIndex: 'candidates_phone', key: 'candidates_phone' },
    { title: 'Email', dataIndex: 'candidates_email', key: 'candidates_email' },
    // { title: 'CV', dataIndex: 'candidates_cv', key: 'candidates_cv' },
    {
        title: 'CV',
        dataIndex: 'candidates_cv',
        key: 'candidates_cv',
        render: (text, record) => (
          <Button type="link" onClick={() => handleOpenCvModal(record.candidates_cv)}>
            Xem CV
          </Button>
        ),
      },
    { title: 'Nhận xét', dataIndex: 'candidates_feedback', key: 'candidates_feedback' },
    {
      title: 'Trạng thái',
      dataIndex: 'candidates_status',
      key: 'candidates_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : 'orange' }}>
          {status === 1 ? 'Pass phỏng vấn' : 'Không pass'}
        </span>
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
            title="Bạn có chắc muốn xóa không?"
            onConfirm={() => handleDelete(record.candidates_id)}
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
              Thêm mới ứng viên
            </Button>
            {loading ? (
              <Spin tip="Loading..." />
            ) : (
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                rowKey="candidates_id"
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
            name="candidates_name"
            label="Tên ứng viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên ứng viên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="candidates_phone"
            label="SĐT"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="candidates_email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="CV">
            <Upload beforeUpload={() => false} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)}>
              <Button icon={<UploadOutlined />}>Chọn CV</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="candidates_feedback" label="Nhận xét">
            <Input />
          </Form.Item>
          <Form.Item label="Trạng thái" name="candidates_status">
            <Select placeholder="Chọn trạng thái">
              <Option value={0}>Chưa phỏng vấn</Option>
              <Option value={1}>Được nhận</Option>
              <Option value={2}>Không được nhận</Option>
            </Select>
          </Form.Item>
          <Form.Item name="news_id" initialValue={news_id} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Xem CV"
        visible={isCvModalVisible}
        footer={null}
        onCancel={() => setIsCvModalVisible(false)}
        width={800}
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {cvUrl ? (
            <embed
              src={cvUrl}
              type="application/pdf"
              width="100%"
              height="500px"
              onLoad={() => console.log('CV loaded successfully')}
              onError={() => console.log('Error loading CV')}
            />
          ) : (
            <p>Không có CV để hiển thị.</p>
          )}
        </div>
      </Modal>
    </Main>
  );
}

export default Recruit_news;
