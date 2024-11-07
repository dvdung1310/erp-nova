import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Row, Col, Skeleton, message } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NavLink, Switch, Route, useRouteMatch, Link, useParams } from 'react-router-dom';
import { SettingWrapper, UserBioBox } from './overview/style';
import { UserCard } from '../../pages/style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import Heading from '../../../components/heading/heading';
import FontAwesome from 'react-fontawesome';
import { showEmployees } from '../../../apis/employees/employee';
import { SnippetsOutlined, ProductOutlined } from '@ant-design/icons';
const UserCards = lazy(() => import('../../pages/overview/UserCard'));
// const CoverSection = lazy(() => import('../overview/CoverSection'));
const Overview = lazy(() => import('./overview/Overview'));
const Timeline = lazy(() => import('./overview/Timeline'));
const EmployeeFile = lazy(() => import('./overview/EmployeeFile'));

function MyProfile() {
  const { path } = useRouteMatch();
  const { employee_id } = useParams();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
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

  return (
    <>
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
                          <Button size="default" type="white">
                            {/* <FeatherIcon icon="mail" size={14} /> */}
                            <ProductOutlined size={14} />
                            Cập nhật
                          </Button>
                          <Button size="default" type="white">
                            {/* <FeatherIcon icon="user-plus" size={14} /> */}
                            <SnippetsOutlined size={14} />
                            Hồ sơ
                          </Button>
                        </div>
                        {/* <div className="card__info">
                          <Row gutter={15}>
                            <Col xs={8}>
                              <div className="info-single">
                                <Heading className="info-single__title" as="h2">
                                  $72,572
                                </Heading>
                                <p>Total Revenue</p>
                              </div>
                            </Col>
                            <Col xs={8}>
                              <div className="info-single">
                                <Heading className="info-single__title" as="h2">
                                  3,257
                                </Heading>
                                <p>Orders</p>
                              </div>
                            </Col>
                            <Col xs={8}>
                              <div className="info-single">
                                <Heading className="info-single__title" as="h2">
                                  74
                                </Heading>
                                <p>Products</p>
                              </div>
                            </Col>
                          </Row>
                        </div> */}
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
                    {/* <article className="user-info">
                    <h5 className="user-info__title">User Bio 1111</h5>
                    <p>
                      Nam malesuada dolor tellus pretium amet was hendrerit facilisi id vitae enim sed ornare there
                      suspendisse sed orci neque ac sed aliquet risus faucibus in pretium molestie nisl tempor quis odio
                      habitant.
                    </p>
                  </article> */}
                    <address className="user-info">
                      <h5 className="user-info__title">Thông tin cá nhân</h5>
                      <ul className="user-info__contact">
                        <li>
                          {/* <FeatherIcon icon="mail" size={14} />  */}
                          Email cá nhân: &ensp;
                          <span>{dataSource.employee_email}</span>
                        </li>
                        <li>
                          Email Nova:&ensp;<span>{dataSource.employee_email_nova}</span>
                        </li>
                        <li>
                          SĐT:&ensp;<span>{dataSource.employee_phone}</span>
                        </li>
                        <li>
                          Địa chỉ:&ensp;<span>{dataSource.employee_address}</span>
                        </li>
                        <li>
                          CCCD:&ensp;<span>{dataSource.employee_identity}</span>
                        </li>
                        <li>
                          Số tài khoản:&ensp;<span>{dataSource.employee_bank_number}</span>
                        </li>
                      </ul>
                    </address>
                    {/* <div className="user-info">
                      <h5 className="user-info__title">Skills</h5>
                      <div className="user-info__skills">
                        <Button type="light" outlined className="btn-outlined">
                          UI/UX
                        </Button>
                        <Button type="light" outlined className="btn-outlined">
                          Branding
                        </Button>
                        <Button type="light" outlined className="btn-outlined">
                          product design
                        </Button>
                        <Button type="light" outlined className="btn-outlined">
                          web design
                        </Button>
                        <Button type="light" outlined className="btn-outlined">
                          Application
                        </Button>
                      </div>
                    </div>
                    <div className="user-info">
                      <h5 className="user-info__title">Social Profiles</h5>
                      <div className="card__social">
                        <Link className="btn-icon facebook" to="#">
                          <FontAwesome name="facebook" />
                        </Link>
                        <Link className="btn-icon twitter" to="#">
                          <FontAwesome name="twitter" />
                        </Link>
                        <Link className="btn-icon dribble" to="#">
                          <FontAwesome name="dribbble" />
                        </Link>
                        <Link className="btn-icon instagram" to="#">
                          <FontAwesome name="instagram" />
                        </Link>
                      </div>
                    </div> */}
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
                    {/* <Upload {...props}>
                      <Link to="#">
                        <FeatherIcon icon="camera" size={16} /> Change Cover
                      </Link>
                    </Upload> */}
                  </div>
                  <nav className="profileTab-menu">
                    <ul>
                      <li>
                        <NavLink to={`${path}/overview`}>Overview</NavLink>
                      </li>
                      <li>
                        <NavLink to={`${path}/timeline`}>Timeline</NavLink>
                      </li>
                      <NavLink to={`/admin/nhan-su/profile/activity/${employee_id}`} activeClassName="active">
                        Hồ sơ
                      </NavLink>
                    </ul>
                  </nav>
                </div>
              </Suspense>
              <Switch>
                <Suspense
                  fallback={
                    <Cards headless>
                      <Skeleton active paragraph={{ rows: 10 }} />
                    </Cards>
                  }
                >
                  <Route exact path={`${path}/overview`} component={Overview} />
                  <Route path={`${path}/timeline`} component={Timeline} />
                  <Route path={`/admin/nhan-su/profile/activity/:employee_id`} component={EmployeeFile} />
                </Suspense>
              </Switch>
            </SettingWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

MyProfile.propTypes = {
  // match: propTypes.object,
};

export default MyProfile;
