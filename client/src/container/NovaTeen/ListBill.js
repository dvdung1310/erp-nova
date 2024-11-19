import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Card,
  Spin,
  Upload,
  message,
  DatePicker,
  Popconfirm,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getPayment, getCustomerNovateen, storePayment, updatePayment, deletePayment,updateStatus } from '../../apis/novateen/index';
import { Cards } from '../../components/cards/frame/cards-frame';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
const { Dragger } = Upload;
const { Option } = Select;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const ListBill = () => {
  const [payment, setPayment] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [previewFile, setPreviewFile] = useState(null); // Lưu đường dẫn tệp cần hiển thị
  const [fileModalVisible, setFileModalVisible] = useState(false);
  // Lấy dữ liệu từ API
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await getPayment();
      setPayment(response.data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomerNovateen();
      setCustomer(response.data); // Lưu danh sách khách hàng
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Gọi hàm fetchCustomers trong useEffect
  useEffect(() => {
    fetchCustomers();
  }, []);
  // Hiển thị modal
  const showModal = async (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        customer_id: record.customer_id, // ID khách hàng
        money: record.money, // Số tiền
        date: record.date ? moment(record.date) : null, // Chuyển đổi thành moment
        file: record.file || [], // Tệp tải lên (nếu có)
      });
    } else {
      form.resetFields(); // Nếu không có bản ghi, đặt về mặc định
    }
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Lưu thông tin phiếu thu
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('customer_id', values.customer_id);
      formData.append('money', values.money);
      formData.append('date', values.date);

      if (values.file && values.file.length > 0) {
        formData.append('file', values.file[0].originFileObj);
      }
      if (editingRecord) {
        const response = await updatePayment(formData, editingRecord.id);
        message.success('Cập nhật thành công!');
      } else {
        const response = await storePayment(formData); // Thêm mới nếu không phải chỉnh sửa
        message.success('Thêm mới thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchStatuses(); // Tải lại danh sách
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Đã xảy ra lỗi. Vui lòng kiểm tra lại.');
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const handleDelete = async (id) => {
    try {
      const response = await deletePayment(id);
      message.success('Xóa thành công!');
      fetchStatuses(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      console.error('Xóa thất bại:', error);
      message.error('Đã xảy ra lỗi khi xóa.');
    }
  };
  const handleFileClick = (filePath) => {
    const completePath = `${LARAVEL_SERVER}/storage/${filePath}`; // Đường dẫn đầy đủ tới file
    setPreviewFile(completePath); // Lưu đường dẫn vào state
    setFileModalVisible(true); // Hiển thị modal
  };
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1; // Toggle trạng thái từ 1 thành 0 hoặc ngược lại
  
    try {
      const response = await updateStatus(id, newStatus); // Gọi API để cập nhật trạng thái
      if (response.success) {
        message.success('Cập nhật trạng thái thành công!');
        fetchStatuses(); // Tải lại danh sách sau khi cập nhật
      } else {
        message.error('Cập nhật trạng thái thất bại!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    {
      title: (
        <div>
          Phụ huynh <br />
          (con)
        </div>
      ),
      key: 'parent_and_student',
      render: (text, record) => (
        <div>
          <strong>{record.parent_name}</strong>
          <br />
          <span style={{ fontSize: '12px' }}>{record.student_name}</span>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'money',
      key: 'money',
      render: (money) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (filePath) =>
        filePath ? (
          <span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => handleFileClick(filePath)}>
            Xem ảnh
          </span>
        ) : (
          'Không có ảnh'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag
          color={status === 1 ? 'green' : 'red'}
          style={{cursor:'pointer'}}
          onClick={() => handleStatusChange(record.id, status === 1 ? 0 : 1)} // Gọi hàm cập nhật trạng thái khi nhấn vào Tag
        >
          {status === 1 ? 'Đã xác nhận' : 'Chưa xác nhận'}
        </Tag>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sale_name',
      key: 'sale_name',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa giao dịch này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="danger">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Spin spinning={loading}>
        <Card>
          <div className="d-flex justify-content-between">
            <h2 className="fw-bold">Doanh thu NovaTeen</h2>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: '16px' }}>
              Thêm phiếu thu
            </Button>
          </div>
          <Table columns={columns} dataSource={payment} rowKey="id" />
        </Card>
      </Spin>
      <Modal
        title={editingRecord ? 'Sửa phiếu thu' : 'Thêm phiếu thu'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Phụ huynh - Học sinh"
            name="customer_id"
            rules={[{ required: true, message: 'Vui lòng chọn một học sinh' }]}
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn học sinh"
              optionLabelProp="label"
              showSearch
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            >
              {customer.map((item) => (
                <Option key={item.id} value={item.id} label={item.student_name}>
                  {item.student_name} ({item.name})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Số tiền" name="money" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <Input placeholder="Nhập số tiền" type="number" />
          </Form.Item>
          <Form.Item label="Ngày" name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker
              format="YYYY-MM-DD HH:mm:ss" // Định dạng ngày giờ
              showTime={{ format: 'HH:mm:ss' }} // Hiển thị thời gian
              style={{ width: '100%', height:'45px', padding:'10px'}} // Đặt chiều rộng bằng với form
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>
          {/* Thêm input upload ảnh */}
          <Form.Item name="file" label="Tải file" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Dragger beforeUpload={() => false}>
              <p>Click hoặc kéo tệp vào đây để tải lên</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={fileModalVisible}
        footer={null}
        title="Hóa đơn thanh toán"
        onCancel={() => setFileModalVisible(false)}
      >
        {previewFile && <img src={previewFile} alt="Preview" style={{ width: '100%', height: 'auto' }} />}
      </Modal>
    </div>
  );
};

export default ListBill;
