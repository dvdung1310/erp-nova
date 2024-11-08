import React, { lazy, Suspense, useState, useEffect } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Row, Col, Skeleton, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import { NavLink, Switch, Route, useRouteMatch, Link, useParams } from 'react-router-dom';
import { SettingWrapper, UserBioBox } from './overview/style';
import { UserCard } from '../../pages/style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import Heading from '../../../components/heading/heading';
import FontAwesome from 'react-fontawesome';
import { showEmployees, updateEmployees } from '../../../apis/employees/employee';
import { SnippetsOutlined, ProductOutlined } from '@ant-design/icons';

const UserCards = lazy(() => import('../../pages/overview/UserCard'));
const Overview = lazy(() => import('./overview/Overview'));
const EditInfomationEmployee = lazy(() => import('./overview/EditInfomationEmployee'));
const EmployeeFile = lazy(() => import('./overview/EmployeeFile'));

function MyProfile() {
  const { path } = useRouteMatch();
  const { employee_id } = useParams();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
  
  // Fetch employee data when component mounts
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await showEmployees(employee_id);
      if (!res.error) {
        setDataSource(res.data);
      } else {
        message.error(res.message);
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

  // Open modal and load form data if editing
  const handleOpenModal = () => {
    if (dataSource) {
      form.setFieldsValue({
        employee_name: dataSource.employee_name,
        employee_phone: dataSource.employee_phone,
        employee_email: dataSource.employee_email,
        employee_email_nova: dataSource.employee_email_nova,
        employee_address: dataSource.employee_address,
        employee_identity: dataSource.employee_identity,
        employee_bank_number: dataSource.employee_bank_number,
        department_id: dataSource.department_id,
      });
    }
    setIsModalVisible(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Update employee data
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Update employee data if editing
      const response = await updateEmployees(values, employee_id);
      if (response && !response.error) {
        message.success('Cập nhật nhân sự thành công!');
        fetchData(); // Refetch data after successful update
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(response?.message || 'Đã có lỗi xảy ra khi cập nhật nhân sự.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Lưu thông tin nhân sự thất bại.');
    }
  };

  return (
    <>
      <Main>
        <Row gutter={25} style={{ marginTop: '30px' }}>
          <Col xxl={6} lg={8} md={10} xs={24}>
            <Suspense fallback={<Cards headless><Skeleton avatar active paragraph={{ rows: 3 }} /></Cards>}>
              {dataSource && (
                <UserCard>
                  <div className="card user-card">
                    <Cards headless>
                      <figure>
                        <img
                          src={
                            dataSource.avatar
                              ? LARAVEL_SERVER + dataSource.avatar
                              : require('../../../static/img/users/1.png')
                          }
                          alt={dataSource.level_name}
                        />
                      </figure>
                      <figcaption>
                        <div className="card__content">
                          <Heading className="card__name" as="h6">
                            <Link to="#">{dataSource.employee_name}</Link>
                          </Heading>
                          <p className="card__designation">
                            {dataSource.level_name} - {dataSource.department_name}
                          </p>
                        </div>
                        <div className="card__actions">
                          <Button size="default" type="white" onClick={handleOpenModal}>
                            <ProductOutlined size={14} /> Cập nhật
                          </Button>
                        </div>
                      </figcaption>
                    </Cards>
                  </div>
                </UserCard>
              )}
            </Suspense>
            <Suspense fallback={<Cards headless><Skeleton active paragraph={{ rows: 10 }} /></Cards>}>
              <UserBioBox>
                {dataSource && (
                  <Cards headless>
                    <address className="user-info">
                      <h5 className="user-info__title">Thông tin cá nhân</h5>
                      <ul className="user-info__contact">
                        <li>Email cá nhân: &ensp;<span>{dataSource.employee_email}</span></li>
                        <li>Email Nova: &ensp;<span>{dataSource.employee_email_nova}</span></li>
                        <li>SĐT: &ensp;<span>{dataSource.employee_phone}</span></li>
                        <li>Địa chỉ: &ensp;<span>{dataSource.employee_address}</span></li>
                        <li>CCCD: &ensp;<span>{dataSource.employee_identity}</span></li>
                        <li>Số tài khoản: &ensp;<span>{dataSource.employee_bank_number}</span></li>
                      </ul>
                    </address>
                  </Cards>
                )}
              </UserBioBox>
            </Suspense>
          </Col>
          <Col xxl={18} lg={16} md={14} xs={24}>
            <SettingWrapper>
              <Suspense fallback={<Cards headless><Skeleton active /></Cards>}>
                <div className="coverWrapper">
                  <div className="cover-image">
                    <img style={{ width: '100%' }} src={require('./banner_profile.png')} alt="banner" />
                  </div>
                  <nav className="profileTab-menu">
                    <ul>
                      {/* <li>
                        <NavLink to={`${path}/overview`}>Overview</NavLink>
                      </li> */}
                      <li>
                        <NavLink to={`/admin/nhan-su/profile/activity/${employee_id}`} activeClassName="active">
                          Hồ sơ
                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Suspense>
              <Switch>
                {/* <Route exact path={`${path}/overview`}>
                  <Suspense fallback={<Skeleton active paragraph={{ rows: 10 }} />}>
                    <Overview />
                  </Suspense>
                </Route> */}
                <Route path={`/admin/nhan-su/profile/activity/:employee_id`}>
                  <Suspense fallback={<Skeleton active paragraph={{ rows: 10 }} />}>
                    <EmployeeFile />
                  </Suspense>
                </Route>
              </Switch>
            </SettingWrapper>
          </Col>
        </Row>
        <Modal
          title="Cập nhật nhân viên"
          open={isModalVisible}
          onOk={handleModalOk} // Call handleModalOk on "OK" button
          onCancel={handleModalClose}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Họ Tên" name="employee_name" rules={[{ required: true, message: 'Vui lòng nhập tên nhân sự!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="SĐT" name="employee_phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email cá nhân" name="employee_email" rules={[{ required: true, message: 'Vui lòng nhập email cá nhân!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email Nova" name="employee_email_nova" rules={[{ required: true, message: 'Vui lòng nhập email Nova!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="employee_address">
              <Input />
            </Form.Item>
            <Form.Item label="Số CCCD" name="employee_identity" rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Số tài khoản" name="employee_bank_number">
              <Input />
            </Form.Item>
            {/* <Form.Item label="Ngày vào công ty" name="employee_date_join">
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item> */}
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default MyProfile;
