import React, { useEffect, useState } from 'react';
import { Table, Spin, Button, Popconfirm, message, Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { allPaymentSlip, deleteCost, storePaymentSlip, updateCost } from '../../apis/aaifood/index';
import moment from 'moment';
import { NumericFormat } from 'react-number-format';
const Turnover = () => {
  const [dataSource, setDataSource] = useState([]);
  const [totalPaymentSlip, setTotalPaymentSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null); // Dữ liệu đang chỉnh sửa

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allPaymentSlip();
      setDataSource(response.data);
      setTotalPaymentSlip(response.total_payment_slip);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      const response = await deleteCost(record.cost_id);
      if (response.success) {
        message.success('Xóa phiếu chi thành công');
        fetchDocument();
      } else {
        message.error('Xóa phiếu chi thất bại');
      }
    } catch (error) {
      message.error('Xóa phiếu chi thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị modal để thêm mới hoặc chỉnh sửa
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      // Nếu sửa, đổ dữ liệu vào form
      form.setFieldsValue({
        cost_id: record.cost_id,
        cost_name: record.cost_name,
        cost_total: record.cost_total,
        cost_description: record.cost_description,
        cost_date: moment(record.cost_date).startOf('day'),
      });
    } else {
      form.resetFields(); // Reset form nếu thêm mới
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // Validate form fields
      console.log('Submitted Data:', values);

      if (editingRecord) {
        const response = await updateCost(values, values.cost_id);
        message.success('Cập nhật thành công');
        if (response.success) {
          fetchDocument();
          message.success('Thêm mới thành công');
          setIsModalVisible(false); // Close the modal
        }
      } else {
        const response = await storePaymentSlip(values);
        if (response.success) {
          fetchDocument();
          message.success('Thêm mới thành công');
          setIsModalVisible(false); // Close the modal
        }
      }
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    { title: 'Tên chi phí', dataIndex: 'cost_name', key: 'cost_name' },
    { title: 'Số tiền', dataIndex: 'cost_total', key: 'cost_total', 
      render: (text) => {
        // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
        return text ? parseFloat(text).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '';
      },
    },
    { title: 'Ghi chú', dataIndex: 'cost_description', key: 'cost_description' },
    { title: 'Ngày thanh toán', dataIndex: 'cost_date', key: 'cost_date' },
    {
      title: 'Ngày tạo phiếu',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => new Date(created_at).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="primary" style={{ marginRight: 8 }} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h3>Danh sách phiếu chi</h3>
        <h3>Tổng chi: {totalPaymentSlip?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h3>
        <Button type="primary" onClick={() => showModal()}>
          Tạo phiếu chi
        </Button>
      </div>
      <hr />
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <Table
          className="table-responsive"
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          rowKey="suppliers_id"
        />
      )}

      {/* Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh sửa phiếu chi' : 'Tạo phiếu chi'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="cost_id"
            initialValue={editingRecord?.cost_id} // Set the initial value if you're editing an existing record
            style={{ display: 'none' }} // Hide the input field
          >
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="cost_name"
            label="Tên chi phí"
            rules={[{ required: true, message: 'Vui lòng nhập tên chi phí' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Chi phí" name="cost_total" rules={[{ required: true, message: 'Vui lòng nhập chi phí!' }]}>
            <NumericFormat
              customInput={Input}
              thousandSeparator={true} // Thêm dấu phân cách hàng nghìn
              decimalSeparator="." // Dấu phân cách phần thập phân
              decimalScale={3} // Giới hạn số chữ số thập phân (ví dụ: 3 chữ số thập phân)
              fixedDecimalScale={true} // Cố định số chữ số thập phân
              allowNegative={false} // Không cho phép số âm
              placeholder="Nhập giá nhập kho"
              // onValueChange={(values) => {
              //   form.setFieldsValue({ product_input_price: values.value });
              // }}
            />
          </Form.Item>
          <Form.Item name="cost_description" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="cost_date"
            label="Ngày thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
          >
            <DatePicker style={{ width: '100%', height: '45px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Turnover;
