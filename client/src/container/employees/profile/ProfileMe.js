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
import { employeeLogin, updateEmployeeAvatar } from '../../../apis/employees/employee';
import { changePassword, getProfile, updateProfile } from '../../../apis/work/user';
import { SnippetsOutlined, ProductOutlined } from '@ant-design/icons';
import Avatar from '../../../components/Avatar/Avatar';

const UserCards = lazy(() => import('../../pages/overview/UserCard'));
const Overview = lazy(() => import('./overview/Overview'));
const EditInfomationEmployee = lazy(() => import('./overview/EditInfomationEmployee'));
const WorkEmployee = lazy(() => import('../../work/MainWord'));

function MyProfile() {
  const { path } = useRouteMatch();
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form] = Form.useForm();
  const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

  // Fetch employee data when component mounts
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await employeeLogin();
      console.log(res);

      setDataSource(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAvatar(file);
    }
  };

  // Update avatar
  const handleUpdateAvatar = async () => {
    if (!avatar) {
      message.error('Vui lòng chọn ảnh để cập nhật');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const res = await updateEmployeeAvatar(formData);
      message.success('Cập nhật avatar thành công!');
      setImagePreview(URL.createObjectURL(avatar)); // Update preview after successful upload
    } catch (error) {
      message.error('Cập nhật avatar thất bại');
      console.error('Lỗi khi cập nhật avatar:', error);
    }
  };

  return (
    <Main>
      <Row gutter={25} style={{ marginTop: '30px' }}>
        <Col xxl={6} lg={8} md={10} xs={24}>
          <Suspense
            fallback={
              <Cards headless>
                <Skeleton avatar active paragraph={{ rows: 3 }} />
              </Cards>
            }
          >
            {dataSource && (
              <UserCard>
                <div className="card user-card">
                  <Cards headless>
                    <figure
                      className="photo-upload align-center-v"
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <input type="file" hidden name="avatar" id="avatar" onChange={handleImageChange} />
                      <label htmlFor="avatar" style={{ cursor: 'pointer', position: 'relative' }}>
                        <Avatar
                          name={dataSource?.name}
                          imageUrl={imagePreview || (dataSource.avatar ? `${LARAVEL_SERVER}${dataSource?.avatar}` : '')}
                          width={120}
                          height={120}
                        />
                      </label>
                    </figure>
                    <figcaption>
                      <div className="card__content" style={{ marginTop: '10px' }}>
                        <Heading className="card__name" as="h6">
                          <Link to="#">{dataSource.employee_name}</Link>
                        </Heading>
                        <p className="card__designation">
                          {dataSource.level_name} - {dataSource.department_name}
                        </p>
                      </div>
                      <div className="card__actions">
                        <Button size="default" type="white" onClick={handleUpdateAvatar}>
                          <ProductOutlined size={14} /> Cập nhật
                        </Button>
                      </div>
                    </figcaption>
                  </Cards>
                </div>
              </UserCard>
            )}
          </Suspense>
          <Suspense
            fallback={
              <Cards headless>
                <Skeleton active paragraph={{ rows: 10 }} />
              </Cards>
            }
          >
            <UserBioBox>
              {dataSource && (
                <Cards headless>
                  <address className="user-info">
                    <h5 className="user-info__title">Thông tin cá nhân</h5>
                    <ul className="user-info__contact">
                      <li>
                        Email cá nhân: &ensp;<span>{dataSource.employee_email}</span>
                      </li>
                      <li>
                        Email Nova: &ensp;<span>{dataSource.employee_email_nova}</span>
                      </li>
                      <li>
                        SĐT: &ensp;<span>{dataSource.employee_phone}</span>
                      </li>
                      <li>
                        Địa chỉ: &ensp;<span>{dataSource.employee_address}</span>
                      </li>
                      <li>
                        CCCD: &ensp;<span>{dataSource.employee_identity}</span>
                      </li>
                      <li>
                        Số tài khoản: &ensp;<span>{dataSource.employee_bank_number}</span>
                      </li>
                    </ul>
                  </address>
                </Cards>
              )}
            </UserBioBox>
          </Suspense>
        </Col>
        <Col xxl={18} lg={16} md={14} xs={24}>
          <SettingWrapper>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <div className="coverWrapper">
                <div className="cover-image">
                  <img style={{ width: '100%' }} src={require('./banner_profile.png')} alt="banner" />
                </div>
                <nav className="profileTab-menu">
                  <ul>
                    <li>
                      <NavLink
                        to={`${path}/lam-viec`}
                        activeClassName="active"
                        exact
                        isActive={(match, location) => {
                          // Ensure exact match for the "/lam-viec" route
                          return location.pathname === `${path}/lam-viec`;
                        }}
                      >
                        Công việc
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={`${path}/sua-thong-tin`} activeClassName="active">
                        Tài khoản
                      </NavLink>
                    </li>
                  </ul>
                </nav>
              </div>
            </Suspense>
            <Switch>
              {/* Ensure exact matching for the route */}
              <Route path={`${path}/lam-viec`} exact>
                <Suspense fallback={<Skeleton active paragraph={{ rows: 10 }} />}>
                  <WorkEmployee />
                </Suspense>
              </Route>
              <Route path={`${path}/sua-thong-tin`} exact>
                <Suspense fallback={<Skeleton active paragraph={{ rows: 10 }} />}>
                  {dataSource && <EditInfomationEmployee dataSource={dataSource} setDataSource={setDataSource} />}
                </Suspense>
              </Route>
            </Switch>
          </SettingWrapper>
        </Col>
      </Row>
    </Main>
  );
}

export default MyProfile;
