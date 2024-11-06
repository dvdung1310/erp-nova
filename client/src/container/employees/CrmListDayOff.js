import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Switch, useRouteMatch, useHistory, NavLink,useParams  } from 'react-router-dom';
import {
  Row,
  Col,
  Table,
  Spin,
  message,
  Form,
  Select,
} from 'antd';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { listdayoff} from '../../apis/employees/employee';
import { checkRole, checkStatus } from '../../utility/checkValue';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { Option } = Select;

function CrmEmployeeDayOff() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState([]);
  const [listUserData, setListUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showModalUpdateMembers, setShowModalUpdateMembers] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
//   const [employeeId, setEmployeeId] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const { employeeId } = useParams();
  // Fetch employee day-off data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await listdayoff(employeeId);
      if (!res.error) {
        setDataSource(res.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // Table columns
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    { title: 'Tên đơn', dataIndex: 'off_title', key: 'off_title' },
    { title: 'Người gửi', dataIndex: 'employee_name', key: 'employee_name' },
    { title: 'Phòng ban', dataIndex: 'department_name', key: 'department_name' },
    { title: 'Nội dung', dataIndex: 'off_content', key: 'off_content' },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'day_off_start',
      key: 'day_off_start',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Format to 'day/month/year'
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'day_off_end',
      key: 'day_off_end',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Format to 'day/month/year'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'off_status',
      key: 'off_status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'blue' : status === 2 ? 'red' : 'orange' }}>
          {status === 1 ? 'Đã duyệt' : status === 2 ? 'Không duyệt' : 'Chưa duyệt'}
        </span>
      ),
    },
    {
        title: 'Chi tiết',
        dataIndex: 'off_id',
        key: 'off',
        render: (off_id) => (
            <NavLink to={`/admin/nhan-su/don-nghi-phep/${off_id}`}>Chi tiết</NavLink>
        ),
    },
  ];

  return (
    <Main>
      <Switch>
        <Route exact path={path}>
          <Row gutter={15}>
            <Col xs={24}>
              <div style={{ background: '#fff', padding: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Danh sách đơn xin nghỉ phép</h3>
                </div>
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
                    rowKey="employee_id"
                  />
                )}
              </div>
            </Col>
          </Row>
        </Route>
      </Switch>
    </Main>
  );
}

export default CrmEmployeeDayOff;
