import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import UpdateEvent from './UpdateEvent';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { UpdatePopup } from '../Style';
import { Modal } from '../../../../components/modals/antd-modals';

function ProjectUpdate({ title, id, description, label, onEventDelete, time, date, type , room_id , customer_id , bookings }) {
  const data = { title, id, description, label, onEventDelete, time, date, type , room_id , customer_id };
  const [visible, setVisible] = useState(false);
  const onHandleVisible = () => {
    setVisible(true);
  };
  const onCancel = () => setVisible(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onHandleDelete = (id) => {
    setIsModalVisible(true);
   
  };
  console.log(date,time);
  const handleCancel = () => {
    setIsModalVisible(false); 
  };
  const handleDelete = async () => {
      onEventDelete(id);
      setIsModalVisible(false); 
  }
  return (
    <UpdatePopup>
      <Modal
        className="addEvent-modal"
        footer={null}
        type="primary"
        title="Chỉnh sửa đặt phòng"
        visible={visible}
        onCancel={onCancel}
      >
        <UpdateEvent onCancel={onCancel} data={data}  bookings={bookings} />
      </Modal>

      <Cards headless>
        <div className={`headerUpdate ${label}`}>
          <h4>{title}</h4>
          <div className="action">
            <Link onClick={onHandleVisible} to="#">
              <FeatherIcon icon="edit-3" size={14} />
            </Link>
            <Link onClick={() => onHandleDelete(id)} to="#">
              <FeatherIcon icon="trash-2" size={14} />
            </Link>
          </div>
        </div>

        <Modal
        title="Xóa sự kiện"
        visible={isModalVisible}
        onOk={handleDelete} 
        onCancel={handleCancel}  
        okText="Xóa"
        cancelText="Hủy"
        >
        <p>Bạn có chắc chắn muốn xóa sự kiện này</p>
      </Modal>
        <div className="bodyUpdate">
          <p className="event-info">
            <FeatherIcon icon="calendar" size={16} /> <span className="label">Ngày bắt đầu:</span>{' '}
            <strong>{moment(date[0]).format('dddd,DD MMMM ')}</strong>
          </p>
          <p className="event-info">
            <FeatherIcon icon="calendar" size={16} /> <span className="label">Ngày kết thúc:</span>{' '}
            <strong>{moment(date[1]).format('dddd,DD MMMM ')}</strong>
          </p>
          <p className="event-info">
            <FeatherIcon icon="clock" size={16} /> <span className="label">Thời gian:</span>
            <strong>{`${time[0]} - ${time[1]}`}</strong>
          </p>
          
        </div>
      </Cards>
    </UpdatePopup>
  );
}

ProjectUpdate.propTypes = {
  title: PropTypes.string,
  id: PropTypes.number,
  description: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  onEventDelete: PropTypes.func,
  time: PropTypes.array,
  date: PropTypes.array,
};

export default ProjectUpdate;
