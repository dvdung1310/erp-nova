import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row, Input, Button, Form, Select, message, Table, DatePicker, Modal } from 'antd';
import {
  showCustomer,
  updateCustomer,
  getStudentTrial,
  storeStudentTrial,
  updateStudentTrial,
  updateCommentParent,
  getCommentParent,
} from '../../apis/novateen/index';
import moment from 'moment';
const { Option } = Select;

const ShowCustomer = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [customer_status, setStatuses] = useState([]);
  const [customer_sources, setSources] = useState([]);
  const [teacher, setTeacher] = useState([]);
  const [student_status, setStudentStatus] = useState([]);
  const [form] = Form.useForm(); // Sử dụng Form.useForm
  const [trialSchedule, setTrialSchedule] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [trialId, setTrialId] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [listcomment, setListComments] = useState([]);
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await showCustomer(id);
        setCustomer(response.data);
        setStatuses(response.statuses || []);
        setSources(response.data_sources || []);
        form.setFieldsValue(response.data); // Đặt giá trị trường ngay sau khi dữ liệu trả về
      } catch (error) {
        console.error('Error fetching customer details:', error);
      }
    };
    fetchCustomerDetails();
  }, [id]);
  useEffect(() => {
    const fetchTrialSchedule = async () => {
      try {
        if (customer && customer.student_id) {
          const response = await getStudentTrial(customer.student_id);
          setTrialSchedule(response.data || []);
          setTeacher(response.teacher || []);
          setStudentStatus(response.student_status || []);
        }
      } catch (error) {
        console.error('Error fetching trial schedule:', error);
      }
    };
    fetchTrialSchedule();
  }, [customer]);

  const handleUpdate = async () => {
    const values = form.getFieldsValue();
    try {
      // Đảm bảo id được truyền đúng cách
      const res = await updateCustomer(id, values);
      if (res.success) {
        message.success('Cập nhật thông tin khách hàng thành công');
      } else {
        message.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Lỗi khi kết nối với server');
    }
  };
  const handleAddTrialSchedule = async (values) => {
    try {
      const res = await storeStudentTrial(values);
      if (res.success) {
        message.success('Thêm mới lịch học thử thành công');
        setTrialSchedule(res.data || []);
        setTeacher(res.teacher || []);
        setStudentStatus(res.student_status || []);
        setIsModalVisible(false);
      } else {
        message.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Lỗi khi kết nối với server');
    }
    // Close the modal after adding
  };
  // Hàm xử lý khi click sửa
  useEffect(() => {}, [trialId]);

  const handleEdit = (record) => {
    setTrialId(record.trial_id); // Cập nhật trial_id vào state

    form.setFieldsValue({
      trial_subject: record.trial_subject,
      teacher_id: record.teacher_id,
      trial_date: moment(record.trial_date), // Đảm bảo trial_date là đối tượng moment
      status_id: record.status_id,
      student_id: customer.student_id,
    });

    setIsEditMode(true); // Chế độ sửa
    setIsModalVisible(true); // Mở modal
  };

  const handleUpdateTrialSchedule = async (values) => {
    try {
      const res = await updateStudentTrial(values, trialId);
      if (res.success) {
        message.success('Cập nhật lịch học thử thành công');
        setTrialSchedule(res.data || []);
        setTeacher(res.teacher || []);
        setStudentStatus(res.student_status || []);
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Lỗi khi kết nối với server');
    }
  };
  const onSubmit = (values) => {
    handleUpdateTrialSchedule(values);
  };
  // Hàm xử lý khi click thêm
  const showAddTrialScheduleModal = () => {
    form.resetFields(); // Reset các trường trong form khi thêm mới
    setIsEditMode(false); // Chế độ thêm mới
    setIsModalVisible(true); // Mở modal
  };
  const columns = [
    { title: 'ID', dataIndex: 'trial_id', key: 'trial_id' },
    { title: 'Môn học', dataIndex: 'trial_subject', key: 'trial_subject' },
    { title: 'Giáo viên', dataIndex: 'name', key: 'name' },
    {
      title: 'Ngày học',
      dataIndex: 'trial_date',
      key: 'trial_date',
      render: (text) => moment(text).format('HH:mm:ss DD-MM-YYYY'),
    },
    { title: 'Trạng thái', dataIndex: 'status_name', key: 'status_name' },
    {
      title: 'Sửa',
      key: 'edit',
      render: (text, record) => (
        <Button
          onClick={() => handleEdit(record)}
          style={{
            backgroundColor: '#007bff', // Màu nền nổi bật
            color: 'white', // Màu chữ
            borderColor: '#007bff', // Màu viền
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //-------------------------------------------------------------
  const getCurrentDateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Xử lý khi nhấn submit
  const updateHistoryParent = async (e) => {
    e.preventDefault(); // Ngừng sự kiện mặc định khi submit form

    if (comment.trim()) {
      // Kiểm tra nếu comment không rỗng
      try {
        // Gửi bình luận và thời gian đến backend
        const response = await updateCommentParent({ student_note: comment }, customer.student_id);

        if (response.data.success) {
          // Nếu thành công, thêm bình luận vào danh sách
          setComments([...comments, comment]);
          setComment(''); // Xóa nội dung sau khi submit
          
          message.success('Thêm trao đổi thành công');
        } else {
          message.success('Thêm trao đổi thành công');
        }
      } catch (error) {
        message.error('Thêm trao đổi Thất bại');
      }
    }
  };

  // Xử lý khi người dùng thay đổi nội dung trong ô input
  const handleInputChange = (e) => {
    const timeStamp = getCurrentDateTime();
    const newComment = e.target.value;
    // Kiểm tra và chỉ cho phép người dùng chỉnh sửa phần nội dung (sau dấu thời gian)
    if (!newComment.startsWith(timeStamp)) {
      setComment(timeStamp + ' ' + newComment.slice(timeStamp.length)); // Duy trì thời gian
    } else {
      setComment(newComment);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (customer && customer.student_id) {
          const response = await getCommentParent(customer.student_id);
          setListComments(response.data || []);
        } else {
          console.error('Customer or student_id is missing');
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
      }
    };

    if (customer) {
      fetchComments();
    } else {
      console.log('Customer data is not yet available');
    }
  }, [customer]);
  //-------------------------------------------------------------
  if (!customer) {
    return <div>Đang tải...</div>;
  }
  return (
    <div style={{ background: 'rgb(241,245,249)' }}>
      <div style={{ padding: '30px' }}>
        <Row gutter={{ md: 24 }}>
          <Col className="gutter-row" span={10}>
            <div style={{ padding: '20px', borderRadius: '10px', background: '#fff' }}>
              <Form form={form} onFinish={handleUpdate} layout="vertical">
                <Form.Item label="Tên phụ huynh" name="name">
                  <Input placeholder="Tên phụ huynh" style={{ marginTop: '10px' }} />
                </Form.Item>

                <Form.Item label="Tên học sinh" name="student_name">
                  <Input placeholder="Tên học sinh" style={{ marginTop: '10px' }} />
                </Form.Item>

                <Form.Item label="Ngày sinh học sinh" name="student_birthday">
                  <Input placeholder="Ngày sinh học sinh" style={{ marginTop: '10px' }} />
                </Form.Item>

                <Form.Item label="Email" name="email">
                  <Input placeholder="Email" style={{ marginTop: '10px' }} />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone">
                  <Input placeholder="Số điện thoại" style={{ marginTop: '10px' }} />
                </Form.Item>
                <Form.Item name="student_id" hidden>
                  <Input type="hidden" />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Form.Item label="Trạng thái" name="status_id">
                    <Select placeholder="Chọn trạng thái" style={{ width: '150px' }}>
                      {customer_status.map((status) => (
                        <Option key={status.id} value={status.id}>
                          {status.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Nguồn data" name="source_id">
                    <Select placeholder="Chọn nguồn khách hàng" style={{ width: '150px' }}>
                      {customer_sources.map((source) => (
                        <Option key={source.id} value={source.id}>
                          {source.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
                    Cập nhật
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
          <Col className="gutter-row" span={14}>
            <div style={{ padding: '20px', borderRadius: '10px', background: '#fff', marginBottom: '20px' }}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <h4 style={{ marginBottom: '0px' }}>Lịch học thử</h4>
                  <Button type="primary" onClick={showModal}>
                    Thêm lịch học thử
                  </Button>
                </div>
                <div>
                  <Table
                    columns={columns}
                    dataSource={trialSchedule}
                    rowKey="trial_id"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderRadius: '10px', background: '#fff' }}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <h4 style={{ marginBottom: '0px' }}>Nội dung trao đổi</h4>
                </div>
                <div>
                  <div>
                    {/* Form thêm bình luận */}
                    <form onSubmit={updateHistoryParent}>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          value={comment}
                          onChange={handleInputChange}
                          placeholder="Nhập nội dung trao đổi"
                          name="student_note"
                          required
                          style={{
                            padding: '0.40rem 1rem',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '0.375rem',
                            width: 'calc(100% - 2.5rem)', // Adjust to account for button width
                            transition: 'border-color 0.3s ease-in-out',
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: '1px solid #007bff',
                            padding: '0.40rem 1.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '1rem',
                            marginLeft: '10px', // Add space between button and input
                            transition: 'background-color 0.3s ease-in-out, transform 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0056b3';
                            e.target.style.borderColor = '#0056b3';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#007bff';
                            e.target.style.borderColor = '#007bff';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          Thêm
                        </button>
                      </div>
                    </form>
                  </div>
                  <div>
                    <div style={{marginTop:'20px'}}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: listcomment, // The raw HTML content
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <Modal
        title={isEditMode ? 'Sửa Lịch Học Thử' : 'Thêm Lịch Học Thử'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={isEditMode ? handleUpdateTrialSchedule : handleAddTrialSchedule} layout="vertical">
          <Form.Item
            label="Môn học"
            name="trial_subject"
            rules={[{ required: true, message: 'Vui lòng chọn môn học thử' }]}
          >
            <Select placeholder="Chọn môn học thử">
              <Option value="Toán">Toán</Option>
              <Option value="Văn">Văn</Option>
              <Option value="Tiếng Anh">Tiếng Anh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giáo viên"
            name="teacher_id"
            rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
          >
            <Select placeholder="Chọn giáo viên">
              {teacher.map((source) => (
                <Option key={source.id} value={source.id}>
                  {source.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ngày học" name="trial_date" rules={[{ required: true, message: 'Vui lòng chọn ngày học' }]}>
            <DatePicker showTime />
          </Form.Item>

          {/* Ẩn Trạng thái khi thêm mới, hiển thị khi sửa */}
          {isEditMode && (
            <Form.Item
              label="Trạng thái"
              name="status_id"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                {student_status.map((source) => (
                  <Option key={source.status_id} value={source.status_id}>
                    {source.status_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="student_id" hidden initialValue={customer.student_id}>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isEditMode ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShowCustomer;
