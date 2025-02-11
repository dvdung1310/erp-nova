import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Form, Input, InputNumber, Button, Row, Col, message, Select, DatePicker, Spin, Upload } from 'antd';
import { createOrder, storeOrderHandmade } from '../../../apis/aaifood/index';
const { Option } = Select;
import { PlusOutlined } from '@ant-design/icons';

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
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await createOrder();
      setAllProduct(response.all_product);
      setAllAgency(response.all_agency);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);
  // const handleRetailSubmit = (values) => {
  //   console.log('Retail Order Submitted:', values);

  // };
  // const handleAgencySubmit = (values) => {
  //   console.log('Agency Order Submitted:', values);
  //   formAgency.resetFields();
  // };

  const handleAddProduct = () => {
    setProductFields([...productFields, { key: Date.now() }]);
  };

  const handleProductChange = (value, fieldKey, previousValue) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev };

      // Xóa sản phẩm cũ khỏi danh sách nếu có
      if (previousValue) {
        const index = Object.values(updated).indexOf(previousValue);
        if (index !== -1) {
          delete updated[fieldKey];
        }
      }

      // Thêm sản phẩm mới vào danh sách
      if (value) {
        updated[fieldKey] = value;
      }

      return Object.values(updated).filter(Boolean); // Trả về danh sách các giá trị đã chọn
    });
  };

  // Xử lý khi xóa sản phẩm, làm cho sản phẩm đó có thể chọn lại
  const handleRemoveProduct = (key) => {
    setProductFields((prevFields) => {
      const updatedFields = prevFields.filter((field) => field.key !== key);

      // Lấy lại `product_id` của sản phẩm đã xóa
      const productIdToRemove = formRetail.getFieldValue(`product_id_${key}`);

      // Thêm sản phẩm đã xóa vào danh sách sản phẩm có thể chọn lại
      setSelectedProducts((prevSelected) => [
        ...prevSelected.filter((productId) => productId !== productIdToRemove), // Loại bỏ sản phẩm đã xóa
        productIdToRemove, // Thêm sản phẩm đã xóa vào danh sách để có thể chọn lại
      ]);

      // Xóa giá trị của sản phẩm bị xóa khỏi form
      formRetail.setFieldsValue({
        [`product_id_${key}`]: undefined,
        [`quantity_${key}`]: undefined,
      });

      // Tính toán lại tổng tiền
      setTimeout(() => calculateTotal(), 0);

      return updatedFields;
    });
  };

  const calculateTotal = () => {
    const values = formRetail.getFieldsValue();
    let total = 0;

    productFields.forEach((field) => {
      const productId = values[`product_id_${field.key}`];
      const quantity = values[`quantity_${field.key}`];
      const product = allProduct.find((p) => p.product_id === productId);

      if (product && quantity) {
        total += product.product_output_price * quantity;
      }
    });

    // Format tổng tiền
    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);

    // Cập nhật giá trị vào form
    formRetail.setFieldsValue({ order_total: formattedTotal });
  };

  // Khi giá trị trong form thay đổi, tính toán lại tổng
  const handleFormChange = () => {
    calculateTotal();
  };

  const handleSubmitOrderRetail = async (values) => {
    try {
      // Chuẩn bị dữ liệu sản phẩm với giá
      const products = productFields.map((field) => {
        const productId = values[`product_id_${field.key}`];
        const quantity = values[`quantity_${field.key}`];
        const product = allProduct.find((p) => p.product_id === productId); // Tìm sản phẩm theo ID
  
        return {
          product_id: productId,
          quantity,
          product_price_input: product ? product.product_input_price : 0,
          product_price_output: product ? product.product_output_price : 0,
        };
      });
  
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
      formData.append('products', JSON.stringify(products));
  
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
            onValuesChange={handleFormChange} // Lắng nghe thay đổi form
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
                  <Input type="number"/>
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item label="Địa chỉ" name="customer_address">
                  <Input />
                </Form.Item>
              </Col>

              {productFields.map((field, index) => (
                <React.Fragment key={field.key}>
                  <Col className="gutter-row" span={16}>
                    <Form.Item
                      label={`Sản phẩm ${index + 1}`}
                      name={`product_id_${field.key}`}
                      rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                    >
                      <Select
                        placeholder="Chọn sản phẩm"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={formAgency.getFieldValue(`product_id_${field.key}`)} // Gắn giá trị đã chọn
                        onChange={(value) => handleProductChange(value, field.key)}
                        onClear={() => handleProductChange(null, field.key)} // Khi xóa chọn
                      >
                        {allProduct &&
                          allProduct
                            .filter((product) => !selectedProducts.includes(product.product_id)) // Lọc các sản phẩm đã chọn
                            .map((product) => (
                              <Select.Option
                                key={product.product_id}
                                value={product.product_id}
                                label={product.product_name}
                              >
                                {product.product_id} - {product.product_name}
                              </Select.Option>
                            ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Form.Item
                      label="Số lượng"
                      name={`quantity_${field.key}`}
                      rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={2}>
                    {productFields.length > 1 && (
                      <Button
                        type="danger"
                        onClick={() => handleRemoveProduct(field.key)}
                        style={{ marginTop: '10px' }}
                      >
                        Xóa
                      </Button>
                    )}
                  </Col>
                </React.Fragment>
              ))}

              <Col span={24}>
                <Button type="dashed" onClick={handleAddProduct} block>
                  Thêm sản phẩm
                </Button>
              </Col>
              {/* <Col className="gutter-row" span={24}>
                <Form.Item
                  label="Ngày xuất hàng"
                  name="order_date"
                  rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng!' }]}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                  }}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    style={{ height: '45px', padding: '10px', with: '100%' }}
                  />
                </Form.Item>
              </Col> */}
              <Col className="gutter-row" span={24}>
                <Form.Item
                  label="Thành tiền"
                  name="order_total"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                >
                  <InputNumber
                    min={1}
                    style={{
                      width: '100%',
                      backgroundColor: '#fff', // Nền trắng
                      color: '#000', // Chữ màu đen
                      fontSize: '18px', // Kích thước chữ lớn
                      border: 'none', // Loại bỏ đường viền nếu cần
                      cursor: 'default', // Con trỏ chuột không thay đổi
                    }}
                    disabled
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
                    Tạo phiếu bán hàng thủ công
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
