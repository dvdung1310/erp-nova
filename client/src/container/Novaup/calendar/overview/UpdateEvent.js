import React, { useState } from 'react';
import { Col, DatePicker, Form, Input, message, Radio, Row, Select } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { AddEventWrap } from '../Style';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BasicFormWrapper } from '../../../styled';
import { Button } from '../../../../components/buttons/buttons';
import { updateCurrentEvent } from '../../../../redux/calendar/actionCreator';
import { updateBooking } from '../../../../apis/novaup/booking';
const dateFormat = 'YYYY/MM/DD';
const { Option } = Select;

function UpdateEvent({ data, onCancel, bookings}) {
  const dispatch = useDispatch();
  const { events } = useSelector(state => {
    return {
      events: state.Calender.events,
    };
  });
  const rooms =  bookings.rooms;
  const customers =  bookings.customers;
  const { title, id, description, label, time, date, type , room_id , customer_id } = data;
  const [state, setState] = useState({
    startDate: moment(date[0]).format('YYYY-MM-DD'),
    endDate: moment(date[1]).format('YYYY-MM-DD'),
    startTime: moment(time[0], 'HH:mm a'),
    endTime: moment(time[1], 'HH:mm a'),
    customerId : customer_id,
    roomId : room_id,
  });
  console.log(state.roomId);
  console.log(rooms[0].id);
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };
  const [form] = Form.useForm();
  const handleSubmit = async (values) => {
    const startDateTime = moment(`${state.startDate} ${state.startTime}`, 'YYYY/MM/DD HH:mm');
    const endDateTime = moment(`${state.endDate} ${state.endTime}`, 'YYYY/MM/DD HH:mm');
    const formData = {
      id,
      start_datetime : startDateTime.format('YYYY-MM-DD HH:mm'),
      end_datetime : endDateTime.format('YYYY-MM-DD HH:mm'),
      customer_id: state.customerId,
      room_id: state.roomId,
    };
    console.log(formData);
    try {
      const response = await updateBooking(formData);
      toast.success(response.message);
      if (response) {
        dispatch(
          updateCurrentEvent(
            events,
            {
              ...formData,
              date: [
                moment(state.startDate).format('MM/DD/YYYY'), 
                moment(state.endDate).format('MM/DD/YYYY')
              ],
              time: [
                state.startTime.format('hh:mm a'), 
                state.endTime.format('hh:mm a')
              ],
            },
            id,
          ),
        );
        onCancel(); 
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    onCancel(); 
  };
  const onChangeStart = (_, dateString) => {
    setState({ ...state, startDate: dateString });
  };
  const onChangeEnd = (_, dateString) => {
    setState({ ...state, endDate: dateString });
  };

  const onChangeStartTime = (time, timeString) => {
    setState({ ...state, startTime: moment(timeString, 'HH:mm a') }); 
  };
  
  const onChangeEndTime = (time, timeString) => {
    setState({ ...state, endTime: moment(timeString, 'HH:mm a') });
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
              <Select style={{ width: '100%' }} value={state.customerId} onChange={(value) => setState({ ...state, customerId: value })}>
              {customers.map((customer) => (
              <Select.Option key={customer.id} value={customer.id}>
              {customer.name}
               </Select.Option>
               ))}
            </Select>
              </Col>
            </Row>
          </div>

          <div className="ant-form-item">
            <Row>
              <Col sm={4} xs={24}>
                <span className="label">Phòng:</span>
              </Col>
              <Col sm={20} xs={24}>
              <Select style={{ width: '100%' }} value={state.roomId} onChange={(value) => setState({ ...state, roomId: value })}>
              {rooms.map((room) => (
              <Select.Option key={room.id} value={room.id}>
              {room.name}
               </Select.Option>
               ))}
            </Select>
              </Col>
            </Row>
          </div>


          <div className="ant-form-item">
            <Row>
              <Col sm={4} xs={24}>
                <span className="label">Ngày bắt đầu:</span>
              </Col>
              <Col sm={20} xs={24}>
                <div className="date-time-picker d-flex" style={{marginRight:'8px', marginBottom:'0'}}>
                  <DatePicker
                    onChange={onChangeStart}
                    value={moment(state.startDate, dateFormat)}
                    defaultValue={moment(state.startDate, dateFormat)}
                  />
                  <DatePicker onChange={onChangeStartTime} defaultValue={moment(time[0], 'HH:mm:ss')} picker="time" />
                </div>
              </Col>
            </Row>
          </div>
          <div className="ant-form-item">
            <Row>
              <Col sm={4} xs={24}>
                <span className="label">Ngày kết thúc:</span>
              </Col>
              <Col sm={20} xs={24}>
                <div className="date-time-picker d-flex" style={{marginRight:'8px', marginBottom:'0'}}>
                  <DatePicker
                    onChange={onChangeEnd}
                    value={moment(state.endDate, dateFormat)}
                    defaultValue={moment(state.endDate, dateFormat)}
                  />
                  <DatePicker onChange={onChangeEndTime} defaultValue={moment(time[1], 'HH:mm:ss')} picker="time" />
                </div>
              </Col>
            </Row>
          </div>

          

          <Form.Item>
            <div className="add-event-footer text-right">
              <Button htmlType="submit" type="primary">
                Chỉnh sửa
              </Button>
            </div>
          </Form.Item>
        </Form>
      </AddEventWrap>
    </BasicFormWrapper>
  );
}

UpdateEvent.propTypes = {
  data: PropTypes.object,
  onCancel: PropTypes.func,
};

export default UpdateEvent;
