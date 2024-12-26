import React, { useState, useEffect } from 'react';
import { Col, Row, DatePicker, Form, Input, Radio, Select } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AddEventWrap } from '../Style';
import { BasicFormWrapper } from '../../../styled';
import { Button } from '../../../../components/buttons/buttons';
import { storeBooking } from '../../../../apis/novaup/booking';
const dateFormat = 'YYYY/MM/DD';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const { Option } = Select;

function AddNewEvent({ defaultValue, onHandleAddEvent , bookings }) {
  const [state, setState] = useState({
    startDate: defaultValue,
    endDate: defaultValue,
    startTime: '',
    endTime: '',
  });
 
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  useEffect(() => {
    if (defaultValue) {
      setState({
        startDate: defaultValue,
        endDate: defaultValue,
      });
    }

    if (bookings) {
      setCustomers(bookings.customers || []);
      setRooms(bookings.rooms || []);
    }
  }, [defaultValue, bookings]);

  const [form] = Form.useForm();
  const handleSubmit = async () => {
        const values = await form.validateFields();
        const formData = new FormData();
        formData.append('customer_id', values.customer_id);
        formData.append('room_id', values.room_id);
        const startDateTime = moment(`${state.startDate} ${state.startTime}`, 'YYYY/MM/DD HH:mm');
        const endDateTime = moment(`${state.endDate} ${state.endTime}`, 'YYYY/MM/DD HH:mm');
        console.log(startDateTime);
        formData.append('start_datetime', startDateTime.format('YYYY-MM-DD HH:mm'));
        formData.append('end_datetime', endDateTime.format('YYYY-MM-DD HH:mm'));
        console.log('du-lieu:',formData);
        const response = await storeBooking(formData);
        toast.success(response.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        if (onHandleAddEvent) {
          onHandleAddEvent(response.data);
        }
        form.resetFields();
  };
  const onChangeStart = (date, dateString) => {
    setState({ ...state, startDate: dateString });
  };
  const onChangeEnd = (date, dateString) => {
    setState({ ...state, endDate: dateString });
  };

  const onChangeStartTime = (time, timeString) => {
    setState({ ...state, startTime: timeString }); 
  };
  
  const onChangeEndTime = (time, timeString) => {
    setState({ ...state, endTime: timeString }); 
  };

  return (
    <BasicFormWrapper>
      <AddEventWrap>
        <Form style={{ width: '100%' }} form={form} name="addNewEvent" onFinish={handleSubmit}>

        <div className="ant-form-item">
            <Row>
              <Col sm={4} xs={24}>
                <span className="label">Người đặt:</span>
              </Col>
              <Col sm={20} xs={24}>
              <Form.Item name="customer_id" rules={[{ required: true, message: 'Vui lòng chọn người đặt' }]}>
              <Select style={{ width: '100%' }}>
                {customers.map((customer) => (
                  <Select.Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Select.Option>
                ))}
            </Select>
            </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="ant-form-item">
            <Row>
              <Col sm={4} xs={24}>
                <span className="label">Phòng:</span>
              </Col>
              <Col sm={20} xs={24}>
              <Form.Item name="room_id" rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}>
              <Select style={{ width: '100%' }}>
                {rooms.map((room) => (
                  <Select.Option key={room.id} value={room.id}>
                    {room.name}
                  </Select.Option>
                ))}
            </Select>
            </Form.Item>
              </Col>
            </Row>
          </div>
    
          <div className="ant-form-item">
          <Row style={{alignItems:'center'}}>
    <Col sm={4} xs={24}>
      <span className="label">Thời gian bắt đầu:</span>
    </Col>
    <Col sm={20} xs={24}>
      <div className="date-time-picker d-flex">
        <Form.Item name="startDate" style={{marginRight:'8px', marginBottom:'0'}}>
          <DatePicker
            onChange={onChangeStart}
            value={moment(state.startDate, dateFormat)}
            defaultValue={moment(state.startDate, dateFormat)}
          />
        </Form.Item>
        <Form.Item
          name="startTime"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
        >
          <DatePicker onChange={onChangeStartTime} picker="time" />
        </Form.Item>
      </div>
    </Col>
  </Row>
          </div>
          <div className="ant-form-item">
          <Row>
    <Col sm={4} xs={24}>
      <span className="label">Thời gian kết thúc:</span>
    </Col>
    <Col sm={20} xs={24}>
      <div className="date-time-picker d-flex">
        <Form.Item style={{marginRight:'8px' , marginBottom:'0'}}
          name="endDate"
        >
          <DatePicker
            onChange={onChangeEnd}
            value={moment(state.endDate, dateFormat)}
            defaultValue={moment(state.endDate, dateFormat)}
          />
        </Form.Item>
        <Form.Item
          name="endTime"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
        >
          <DatePicker onChange={onChangeEndTime} picker="time" />
        </Form.Item>
      </div>
    </Col>
  </Row>
          </div>
          <Form.Item>
            <div className="add-event-footer text-right">
              <Button htmlType="submit" className="btn-save" type="primary">
                Lưu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </AddEventWrap>
    </BasicFormWrapper>
  );
}

AddNewEvent.propTypes = {
  defaultValue: PropTypes.string,
  onHandleAddEvent: PropTypes.func,
};

export default AddNewEvent;
