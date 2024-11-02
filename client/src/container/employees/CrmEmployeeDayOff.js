import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Switch, useRouteMatch, useHistory, NavLink } from 'react-router-dom';
import { Row, Col, Table, Spin, message, Popconfirm, Button, Modal, Form, Input, Select, Badge, List, Avatar,DatePicker } from 'antd';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { getemployeedayoff, getAllUsers,saveemployeedayoff } from '../../apis/employees/employee';
import { checkRole, checkStatus } from '../../utility/checkValue';

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const EmployeeFile = lazy(() => import('./CrmEmployeeFile'));
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
  const [employeeId, setEmployeeId] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [form] = Form.useForm();
  // Fetch list of all users
  const fetchAPi = async () => {
    try {
      setLoading(true);
      const [users] = await Promise.all([getAllUsers()]);
      setListUser(users?.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee day-off data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getemployeedayoff()
      if (!res.error) {
        setDataSource(res.data.data);
        setEmployeeId(res.employee_id);
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
    fetchAPi();
  }, []);

  // Search functionality
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSelectMember = (member) => {
    // Add the member if it's not already selected
    if (!selectedMembers.some((selected) => selected.email === member.email)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (email) => {
    // Remove the member by email
    setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
  };

  const filteredMembers = listUserData?.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCancel = () => {
    setShowModalUpdateMembers(false);
  };
  const opentModelDayOff=()=>{
    setShowModalUpdateMembers(true);
  }
  const handleSubmit = async () => {
    try {
      setLoadingUpdate(true);
      const members = selectedMembers.map((member) => member?.id);
      // Validate and get form data
      const formData = await form.validateFields();
      const data = {
        off_title: formData.off_title,
        off_content: formData.off_content,
        day_off_start: formData.day_off_start,
        day_off_end: formData.day_off_end,
        manager_id: members,
        employee_id:formData.employee_id, // Assuming this is managed properly
      };
  
      const response = await saveemployeedayoff(data); // Call your API function
      if (!response.error) {
        message.success(response.message);
        handleCancel(); // Close modal
        setDataSource((prev) => [...prev, response.data]);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Please fill in all required fields.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Table columns
  const columns = [
    { title: 'ID', dataIndex: 'off_id', key: 'off_id' },
    { title: 'Tên đơn', dataIndex: 'off_title', key: 'off_title' },
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
                  <Button type="primary" onClick={opentModelDayOff} style={{ marginBottom: 16 }}>
                    Thêm đơn nghỉ phép
                  </Button>
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

      {/* Modal to manage selected members */}
      <Modal
        visible={showModalUpdateMembers}
        onCancel={handleCancel}
        centered
        title="Đơn nghỉ phép"
        footer={null}
      >
        <Form form={form} layout="vertical">
        <div>
        <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Tiêu đề</h6>
        <Form.Item name="off_title"  rules={[{ required: true }]}>
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
        </div>
        <div>
        <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Nội dung</h6>
        <Form.Item name="off_content">
            <Input.TextArea placeholder="Nhập mô tả" rows={3} />
          </Form.Item>
        </div>
        <div>
        <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Ngày bắt đầu nghỉ</h6>
        <Form.Item
            name="day_off_start"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
            style={{width: '100%'}}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
        </div>
        <div>
        <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Ngày kết thúc nghỉ</h6>
        <Form.Item
            name="day_off_end"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
            style={{width: '100%'}}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="employee_id" initialValue={employeeId} hidden>
            <Input type="hidden" />
          </Form.Item>
        </div>
        {showModalUpdateMembers && (
          <>
            <div style={{ marginBottom: '16px' }}>
              {selectedMembers.length > 0 && (
                <>
                  <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Gửi đến</h6>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    padding: '8px',
                    border: '1px solid #e8e8e8',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                  }}>
                    {selectedMembers.map((member) => (
                      <Badge key={member.email} onClick={() => handleRemoveMember(member.email)}>
                        <span style={{
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#f0f0f0',
                          color: '#000',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          {member.name}
                          <FeatherIcon icon="x" size={16} color="red" style={{ marginLeft: '8px' }} />
                        </span>
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm thành viên"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ marginBottom: '16px' }}
            />
            <List
              itemLayout="horizontal"
              style={{ height: '300px', overflowY: 'auto' }}
              dataSource={filteredMembers}
              renderItem={(member) => (
                <List.Item onClick={() => handleSelectMember(member)} style={{ cursor: 'pointer' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        width={40}
                        height={40}
                        name={member?.name}
                        src={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}
                      />
                    }
                    title={member.name}
                    description={
                      <>
                        <small className="text-muted">{member?.email}</small>
                        <br />
                        <strong className="text-muted">{checkRole(member?.role_id)}</strong>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button type="primary" onClick={handleSubmit} style={{ minWidth: '300px' }}>
           Gửi đơn
          </Button>
        </div>
        </Form>
      </Modal>
    </Main>
  );
}

export default CrmEmployeeDayOff;
