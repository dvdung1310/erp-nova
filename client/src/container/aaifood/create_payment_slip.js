import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Form, Input, InputNumber, Button, Row, Col, message, Select, DatePicker, Spin } from 'antd';
import { createOrder, storePaymentSlip } from '../../apis/aaifood/index';
import { NumericFormat } from 'react-number-format';
const { Option } = Select;

const create_payment_slip = () => {
  const [formRetail] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const handleSubmitPaymentSlip = async () => {
    try {
      setLoading(true);
      const values = await formRetail.validateFields(); // Sử dụng formRetail để lấy dữ liệu
      const formattedValues = {
        ...values,
        cost_date: values.cost_date ? values.cost_date.format('YYYY-MM-DD') : null, // Định dạng ngày
      };

      console.log('Dữ liệu gửi đi:', formattedValues);

      const response = await storePaymentSlip(formattedValues);
      if (response.success) {
        message.success('Lưu thành công!');
        formRetail.resetFields(); // Xóa dữ liệu trong form sau khi lưu thành công
        setLoading(false);
      } else {
        message.error(response.message || 'Lưu thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      message.error('Lưu thất bại, vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavLink
          to={`/admin/aaifood/phieu-chi`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
            marginRight: '10px',
          }}
        >
          <Button type="primary">&larr; Quay lại</Button>
        </NavLink>
        <h3 style={{ marginBottom: '0' }}>Phiếu chi</h3>
      </div>
      <hr />
      <div>
        <Form
          form={formRetail}
          layout="vertical"
          onFinish={(values) => handleSubmitPaymentSlip(values)}
          style={{ maxWidth: '600px', margin: '30px auto' }}
        >
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Tên chi phí"
                name="cost_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên tên chi phí!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            {/* <Col className="gutter-row" span={24}>
              <Form.Item
                label="Chi phí"
                name="cost_total"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí!' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col> */}
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Chi phí"
                name="cost_total"
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
              <Form.Item label="Ghi chú" name="cost_description">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Ngày chi"
                name="cost_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày chi!' }]}
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
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Tạo phiếu chi
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default create_payment_slip;
