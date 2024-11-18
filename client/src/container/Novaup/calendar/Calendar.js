import React, { useState, lazy, Suspense , useEffect} from 'react';
import { Row, Col, Skeleton , Spin  } from 'antd';
import FeatherIcon from 'feather-icons-react';
import CalenDar from 'react-calendar';
import { Link, Switch, Route, useRouteMatch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Aside, CalendarWrapper } from './Style';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';
import { Main } from '../../styled';
import { Button } from '../../../components/buttons/buttons';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { PageHeader } from '../../../components/page-headers/page-headers';
import 'react-calendar/dist/Calendar.css';
import { eventVisible } from '../../../redux/calendar/actionCreator';

const YearCalendar = lazy(() => import('./overview/Year'));
const MonthCalendar = lazy(() => import('./overview/Month'));
const WeekCalendar = lazy(() => import('./overview/Week'));
const DayCalendar = lazy(() => import('./overview/Day'));
const TodayCalendar = lazy(() => import('./overview/Today'));
const ScheduleCalendar = lazy(() => import('./overview/Schedule'));

import { ListBooking } from '../../../apis/novaup/booking';

function Calendars() {
  const dispatch = useDispatch();
  const { events, isVisible } = useSelector(state => {
    return {
      events: state.Calender.events,
      isVisible: state.Calender.eventVisible,
    };
  });

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRoom] = useState([]);
  const { path } = useRouteMatch();

  const [state, setState] = useState({
    date: new Date(),
    visible: false,
  });

  const onChange = date => setState({ date });

  const onHandleVisible = () => {
    dispatch(eventVisible(!isVisible));
  };

  const ListBookingLoadData = async () => {
    try {
        setLoading(true);
        const response = await ListBooking();
        setBookings(response);
        setRoom(response.rooms || []);
    } catch (error) {
        console.error('Error fetching ListCustomer:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    ListBookingLoadData();
  }, []);

 

  return (
    <Spin spinning={loading}>
      <PageHeader
        ghost
        title="Danh sách đặt phòng"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />

      <Main>
        <CalendarWrapper>
          <Row gutter={25}>
            <Col xxl={6} xl={9} xs={24}>
              <Aside>
                <Button onClick={onHandleVisible} className="btn-create" size="large" type="primary">
                  <FeatherIcon icon="plus" size={14} /> Đặt phòng
                </Button>
                
                <div className="mb-3 d-flex flex-column" style={{flexDirection:'column'}}>
                  <h4>Thông tin phòng</h4>
                  {rooms.map((room) => (
                <Button className="mb-2" style={{ background: room.color , color: '#fff' , marginBottom:'10px'}}>
                {room.name}
                </Button>
                ))}
                </div>
              </Aside>
            </Col>
            <Col xxl={18} xl={15} xs={24}>
              <Switch>
                <Suspense
                  fallback={
                    <Cards headless>
                      <Skeleton paragraph={{ rows: 15 }} active />
                    </Cards>
                  }
                >
                  <Route path={`${path}/year`} component={YearCalendar} />
                  <Route 
                   path={`${path}/month`} 
                   render={(props) => <MonthCalendar {...props} bookings={bookings} />} 
                  />
                  <Route path={`${path}/week`} component={WeekCalendar} />
                  <Route path={`${path}/day`} component={DayCalendar} />
                  <Route path={`${path}/today`} component={TodayCalendar} />
                  <Route path={`${path}/schedule`} component={ScheduleCalendar} />
                </Suspense>
              </Switch>
            </Col>
          </Row>
        </CalendarWrapper>
      </Main>
      </Spin>
  );
}

export default Calendars;
