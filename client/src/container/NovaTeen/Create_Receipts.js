import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Form, Input, InputNumber, Button, Row, Col, message, Select, DatePicker, Spin } from 'antd';
import { createOrder, storeOrderRetail } from '../../apis/aaifood/index';
import { storeReceiptsNovaTeen } from '../../apis/novateen/index';
import { NumericFormat } from 'react-number-format';
const { Option } = Select;

const Create_Receipts = () => {
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

  const handleSubmitOrderRetail = async (values) => {
    try {
      // Gửi dữ liệu tới API
      setLoadingCreate(true);
      const response = await storeReceiptsNovaTeen(values);
      if (response.success) {
        window.open(response.data, '_blank');
      }
      setLoadingCreate(false);
      // Xử lý khi API trả về thành công
      console.log('API Response:', response.data);
      if (response.success) {
        setLoading(false);
        message.success('Tạo phiếu bán hàng thành công!');
        formRetail.resetFields();
        setLoadingCreate(false);

      } else {
        message.error('Có lỗi xảy ra khi tạo phiếu bán hàng!');
        setLoadingCreate(false);
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
        <h3>Phiếu thu NovaTeen</h3>
        
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
                    decimalScale={3} // Giới hạn số chữ số thập phân (ví dụ: 3 chữ số thập phân)
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
                <Form.Item label="Mô tả" name="customer_description">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Tạo phiếu thu Online
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

export default Create_Receipts;
