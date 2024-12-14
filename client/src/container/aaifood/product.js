import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import { Cards } from '../../components/cards/frame/cards-frame';
import { allProduct, storeProduct, updateProduct } from '../../apis/aaifood/index';
import moment from 'moment';
const { Option } = Select;

const suppliers = () => {
  const [dataSource, setDataSource] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Thêm trạng thái
  const [form] = Form.useForm();

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allProduct();
      setDataSource(response.data);
      setSuppliers(response.suppliers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const handleAddNew = () => {
    form.resetFields();
    setEditingProduct(null); // Đặt lại trạng thái chỉnh sửa
    setIsAddModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
  
    // Kiểm tra giá trị ngày có hợp lệ không trước khi thiết lập vào form
    const inputDate = moment(record.product_input_date, 'DD/MM/YYYY');
    const shelfLifeDate = moment(record.product_shelf_life, 'DD/MM/YYYY');
  
    // Kiểm tra và set giá trị cho form, đảm bảo rằng ngày hợp lệ
    form.setFieldsValue({
      product_id: record.product_id,
      product_name: record.product_name,
      product_input_price: record.product_input_price,
      product_output_price: record.product_output_price,
      product_input_quantity: record.product_input_quantity,
      suppliers_id: record.suppliers_id,
      product_input_date: inputDate.isValid() ? inputDate : null,  // Chỉ set nếu hợp lệ
      product_shelf_life: shelfLifeDate.isValid() ? shelfLifeDate : null // Chỉ set nếu hợp lệ
    });
  
    setIsAddModalVisible(true);
  };
  

  const handleCancel = () => {
    setIsAddModalVisible(false);
    setEditingProduct(null); // Đặt lại trạng thái chỉnh sửa
    form.resetFields();
  };

  const handleAddModalOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields(); // Lấy dữ liệu từ form
      // Xử lý định dạng ngày tháng năm trước khi gửi
      const formattedValues = {
        ...values,
        product_shelf_life: values.product_shelf_life ? values.product_shelf_life.format('YYYY-MM-DD') : null,
        product_input_date: values.product_input_date ? values.product_input_date.format('YYYY-MM-DD') : null,
      };

      if (editingProduct) {
        // Nếu đang chỉnh sửa, gọi API update
        const response = await updateProduct(formattedValues, editingProduct.id);
        if (response.success) {
          message.success('Cập nhật nhà cung cấp thành công');
          fetchDocument();
        } else {
          message.error(response.message || 'Cập nhật thất bại!');
        }
      } else {
        // Nếu thêm mới, gọi API store
        const response = await storeProduct(formattedValues);
        if (response.success) {
          message.success('Thêm nhà cung cấp thành công');
          fetchDocument();
        } else {
          message.error(response.message || 'Thêm mới thất bại!');
        }
      }

      // Đóng modal và reset form
      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'product_id', key: 'product_id' },
    { title: 'Tên sản phẩm', dataIndex: 'product_name', key: 'product_name' },
    {
      title: 'Giá nhập',
      dataIndex: 'product_input_price',
      key: 'product_input_price',
      render: (text) => `${text.toLocaleString()}`,
    },
    {
      title: 'Giá bán',
      dataIndex: 'product_output_price',
      key: 'product_output_price',
      render: (text) => `${text.toLocaleString()}`,
    },
    { title: 'Số lượng nhập', dataIndex: 'product_input_quantity', key: 'product_input_quantity' },
    { title: 'Số lượng còn', dataIndex: 'product_quantity_remaining', key: 'product_quantity_remaining' },
    {
      title: 'Ngày nhập kho',
      dataIndex: 'product_input_date',
      key: 'product_input_date',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Chuyển đổi định dạng ngày tháng
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'product_shelf_life',
      key: 'product_shelf_life',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Chuyển đổi định dạng ngày tháng
    },
    { title: 'Nhà cung cấp', dataIndex: 'suppliers_name', key: 'suppliers_name' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleEdit(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={15}>
        <Col xs={24}>
          <Cards title="Quản lý kho sản phẩm">
            <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
              Nhập kho sản phẩm
            </Button>
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
                rowKey="product_id"
              />
            )}
          </Cards>
        </Col>
      </Row>
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Mã sản phẩm"
                name="product_id"
                rules={[{ required: true, message: 'Vui lòng nhập sản phẩm!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Tên sản phẩm"
                name="product_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Giá nhập"
                name="product_input_price"
                rules={[{ required: true, message: 'Vui lòng nhập giá nhập kho!' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Giá bán"
                name="product_output_price"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Số lượng nhập"
                name="product_input_quantity"
                rules={[{ required: true, message: 'Vui lòng số lượng nhập!' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Nhà cung cấp"
                name="suppliers_id"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  allowClear // Cho phép xóa lựa chọn
                  showSearch // Hiển thị khung tìm kiếm
                >
                  {suppliers && suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <Option key={supplier.suppliers_id} value={supplier.suppliers_id}>
                        {supplier.supplier_name}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>Không có dữ liệu</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Ngày nhập kho"
                name="product_input_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập kho!' }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  style={{ height: '45px', padding: '10px', with: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Hạn sử dụng sản phẩm"
                name="product_shelf_life"
                rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng!' }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  style={{ height: '45px', padding: '10px', with: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default suppliers;
