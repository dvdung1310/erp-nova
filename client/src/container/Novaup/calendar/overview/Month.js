/* eslint-disable no-shadow */
import React, { useState, useLayoutEffect, useRef } from 'react';
import { Calendar } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Link, NavLink } from 'react-router-dom';
import CalenDar from 'react-calendar';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import ProjectUpdate from './ProjectUpdate';
import AddNewEvent from './AddNewEvent';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BlockViewCalendarWrapper } from '../Style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { Dropdown } from '../../../../components/dropdown/dropdown';
import './style.css';
import { calendarDeleteData, eventVisible, addNewEvents } from '../../../../redux/calendar/actionCreator';
import { Modal } from '../../../../components/modals/antd-modals';
import { DeleteBooking } from '../../../../apis/novaup/booking';

function MonthCalendar({ bookings }) {
  const dispatch = useDispatch();
  const { events, isVisible } = useSelector(state => {
    return {
      events: state.Calender.events,
      isVisible: state.Calender.eventVisible,
    };
  });
  const [dataBooking, setDataBooking] = useState();
  const [state, setState] = useState({
    date: new Date(),
    container: null,
    currentLabel: moment().format('MMMM YYYY'),
    width: 0,
    defaultValue: moment().format('YYYY-MM-DD'),
  });

  const { date, container, currentLabel, width, defaultValue } = state;
  const getInput = useRef();

  useLayoutEffect(() => {
    const button = document.querySelector(
      '.calendar-header__left .react-calendar__navigation .react-calendar__navigation__label',
    );
    const containers = document.querySelector('.calendar-header__left .react-calendar__viewContainer');
    const calenderDom = document.querySelectorAll('.ant-picker-calendar-date-content');
    calenderDom.forEach(element => {
      element.addEventListener('click', e => {
        if (e.target.classList[0] === 'ant-picker-calendar-date-content') {
          const getDate = moment(e.currentTarget.closest('td').getAttribute('title')).format('YYYY-MM-DD');
          setState({
            container: containers,
            date,
            currentLabel,
            width: getInput.current ? getInput.current.clientWidth : '100%',
            defaultValue : getDate,
          });

          dispatch(eventVisible(true));
        }
      });
    });
    button.addEventListener('click', () => containers.classList.add('show'));

    setState({
      container: containers,
      defaultValue,
      date,
      currentLabel,
      width: getInput.current ? getInput.current.clientWidth : '100%',
    });
    setDataBooking(bookings.data_booking);
  }, [date, currentLabel, defaultValue , bookings, dispatch]);

  const onChange = dt => setState({ ...state, date: dt, defautlValue: moment(dt).format('YYYY-MM-DD') });
  
  const onEventDelete = async id => {
    const data = events.filter(item => item.id !== id);
    const response = await DeleteBooking(id);
    toast.success(response.message);
    dispatch(calendarDeleteData(data));
  };

  function getListData(value) {
    const listData = [];
    if (dataBooking) {
      dataBooking.forEach(booking => {
        const startDate = moment(booking.start_time);
        const endDate = moment(booking.end_time);
        if (value.isBetween(startDate, endDate, 'day', '[]') || value.isSame(startDate, 'day') || value.isSame(endDate, 'day')) {
          const total_Days = endDate.diff(startDate, 'days') + 1;
  
          listData.push({
            id: booking.id,
            title: `${booking.customer.name} - ${booking.room.name}`,
            room: booking.room_id,
            customer: booking.customer_id,
            time: [
              moment(booking.start_time).format('hh:mm A'),
              moment(booking.end_time).format('hh:mm A')
            ],
            date: [
              moment(booking.start_time).format('MM/DD/YYYY'),
              moment(booking.end_time).format('MM/DD/YYYY')
            ],
            label: `bg-${booking.room.color.replace('#', '')}`,
            totalDays: total_Days,
            start: startDate,
            end: endDate,
            room_id : booking.room.id,
            customer_id : booking.customer.id
          });
        }
      });
    }
    return listData;
  }
  
  

  function dateCellRender(value) {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map(item => (
          <Dropdown
            className="event-dropdown"
            key={item.id}
            style={{ padding: 0 }}
            placement="bottomLeft"
            content={<ProjectUpdate onEventDelete={onEventDelete} {...item} bookings={bookings} />}
            action={['click']}
          >
            <li ref={getInput}>
              <Link style={{ width: width * (item.totalDays + 1) }} className={item.label} to="#">
                {item.title}
              </Link>
            </li>
          </Dropdown>
        ))}
      </ul>
    );
  }

  const handleCancel = () => {
    dispatch(eventVisible(false));
  };

  const addNew = event => {
    const arrayData = [];
    events.map(data => {
      return arrayData.push(data.id);
    });
    const max = Math.max(...arrayData);
    dispatch(addNewEvents([...events, { ...event, id: max + 1 }]));
    dispatch(eventVisible(false));
  };

  return (
    <Cards headless>
      <Modal
        className="addEvent-modal"
        footer={null}
        type="primary"
        title="Đặt phòng"
        visible={isVisible}
        onCancel={handleCancel}
      >
        <AddNewEvent onHandleAddEvent={addNew} defaultValue={defaultValue} bookings={bookings} />
      </Modal>

      
      <div className="calendar-header">
        <div className="calendar-header__left">
          <Button className="btn-today" type="white" outlined>
            <NavLink to="./day">Today</NavLink>
          </Button>
          <CalenDar
            onClickMonth={() => {
              container.classList.remove('show');
            }}
            onActiveStartDateChange={({ activeStartDate }) =>
              setState({
                ...state,
                currentLabel: moment(activeStartDate).format('MMMM YYYY'),
                defaultValue: moment(activeStartDate).format('YYYY-MM-DD'),
              })
            }
            next2Label={null}
            prev2Label={null}
            nextLabel={<FeatherIcon icon="chevron-right" />}
            prevLabel={<FeatherIcon icon="chevron-left" />}
            onChange={onChange}
            value={state.date}
          />
        </div>
        <div className="calendar-header__right">
          <ul>
            <li>
              <NavLink to="./day">Day</NavLink>
            </li>
            <li>
              <NavLink to="./week">Week</NavLink>
            </li>
            <li>
              <NavLink to="./month">Month</NavLink>
            </li>
            <li>
              <NavLink to="./year">Year</NavLink>
            </li>
          </ul>
          
        </div>
      </div>
      <BlockViewCalendarWrapper className="table-responsive">
        <Calendar
          headerRender={() => {
            return <></>;
          }}
          mode="month"
          dateCellRender={dateCellRender}
          value={moment(defaultValue)}  // ngày được chọn 
          defaultValue={moment(defaultValue)}  // giá trị mặc định được render lần đầu
        />
      </BlockViewCalendarWrapper>
    </Cards>
  );
}

export default MonthCalendar;
