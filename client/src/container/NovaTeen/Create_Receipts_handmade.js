import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Form, Input, InputNumber, Button, Row, Col, message, Select, DatePicker, Spin, Upload } from 'antd';
import { storeOrderHandmade } from '../../apis/novateen/index';
const { Option } = Select;
import { PlusOutlined } from '@ant-design/icons';
import { NumericFormat } from 'react-number-format';
const create_order = () => {
  const [formRetail] = Form.useForm();
  const [formAgency] = Form.useForm();
  const [allProduct, setAllProduct] = useState([]);
  const [allAgency, setAllAgency] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [form] = Form.useForm();
  const [productFields, setProductFields] = useState([{ key: Date.now() }]);

  const handleSubmitOrderRetail = async (values) => {
    try {
      // Chuẩn bị dữ liệu sản phẩm với giá
      //   const products = productFields.map((field) => {
      //     const productId = values[`product_id_${field.key}`];
      //     const quantity = values[`quantity_${field.key}`];
      //     const product = allProduct.find((p) => p.product_id === productId); // Tìm sản phẩm theo ID

      //     return {
      //       product_id: productId,
      //       quantity,
      //       product_price_input: product ? product.product_input_price : 0,
      //       product_price_output: product ? product.product_output_price : 0,
      //     };
      //   });

      // Tạo FormData để gửi dữ liệu, bao gồm cả ảnh và các trường khác
      const formData = new FormData();

      // Thêm các trường thông tin từ values vào FormData
      Object.keys(values).forEach((key) => {
        if (key !== 'payment_img') {
          // Nếu không phải là ảnh
          formData.append(key, values[key]);
        }
      });

      // Thêm sản phẩm vào FormData
      //   formData.append('products', JSON.stringify(products));

      // Kiểm tra và thêm ảnh vào FormData (chỉ lấy ảnh đầu tiên)
      const uploadImage = values.payment_img && values.payment_img[0]; // Lấy ảnh đầu tiên
      if (uploadImage) {
        formData.append('payment_img', uploadImage.originFileObj); // Thêm ảnh vào FormData
      }

      // Gửi dữ liệu tới API
      setLoadingCreate(true);
      const response = await storeOrderHandmade(formData); // Gửi dữ liệu dưới dạng FormData
      setLoadingCreate(false);
      // Xử lý khi API trả về thành công
      console.log('API Response:', response.success);
      if (response.success) {
        message.success('Tạo phiếu bán hàng thành công!');
        formRetail.resetFields();
      } else {
        message.error('Có lỗi xảy ra khi tạo phiếu bán hàng!');
      }
    } catch (error) {
      // Xử lý lỗi
      console.error('API Error:', error);
      message.error('Có lỗi xảy ra khi tạo phiếu bán hàng!');
      setLoadingCreate(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Phiếu bán hàng thủ công</h3>
        <div>
          <NavLink
            to={`/admin/aaifood/tao-phieu-ban-dai-ly`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Button type="primary">Tạo phiếu bán hàng đại lý</Button>
          </NavLink>
        </div>
      </div>
      <hr />
      <div>
        {loadingCreate ? (
          <div className="spin">
            {' '}
            <Spin />
          </div>
        ) : (
          <Form
            form={formRetail}
            layout="vertical"
            onFinish={(values) => handleSubmitOrderRetail(values)}
            style={{ maxWidth: '600px', margin: '30px auto' }}
          >
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{ display: 'flex', alignItems: 'center' }}>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  label="Tên khách hàng"
                  name="customer_name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  label="Số điện thoại"
                  name="customer_phone"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại khách hàng!' }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item label="Địa chỉ" name="customer_address">
                  <Input />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  label="Chi phí"
                  name="order_total"
                  rules={[{ required: true, message: 'Vui lòng nhập chi phí!' }]}
                >
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator={true} // Thêm dấu phân cách hàng nghìn
                    decimalSeparator="." // Dấu phân cách phần thập phân
                    decimalScale={0} // Giới hạn số chữ số thập phân (ví dụ: 3 chữ số thập phân)
                    fixedDecimalScale={true} // Cố định số chữ số thập phân
                    allowNegative={false} // Không cho phép số âm
                    placeholder="Nhập giá nhập kho"
                    // onValueChange={(values) => {
                    //   form.setFieldsValue({ product_input_price: values.value });
                    // }}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  label="Tải ảnh hóa đơn thanh toán"
                  name="payment_img"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  rules={[{ required: true, message: 'Vui lòng tải lên ảnh!' }]}
                >
                  <Upload
                    name="image"
                    listType="picture-card"
                    beforeUpload={() => false} // Không tự động upload
                    maxCount={1} // Chỉ cho phép chọn 1 ảnh
                    showUploadList={{ showRemoveIcon: true }} // Hiển thị nút xóa ảnh
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Tạo phiếu thu thủ công
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    </div>
  );
};

export default create_order;
