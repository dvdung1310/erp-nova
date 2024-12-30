import React, {lazy, Suspense} from 'react';
import {Row, Col, Skeleton} from 'antd';
import FeatherIcon from 'feather-icons-react';
import {NavLink, Switch, Route, useRouteMatch} from 'react-router-dom';
import {SettingWrapper} from './overview/style';
import {PageHeader} from '../../../components/page-headers/page-headers';
import {Main} from '../../styled';
import {Cards} from '../../../components/cards/frame/cards-frame';
import {Button} from '../../../components/buttons/buttons';
import {ShareButtonPageHeader} from '../../../components/buttons/share-button/share-button';
import {ExportButtonPageHeader} from '../../../components/buttons/export-button/export-button';
import {CalendarButtonPageHeader} from '../../../components/buttons/calendar-button/calendar-button';
import {useSelector} from "react-redux";

const UserCards = lazy(() => import('../../pages/overview/UserCard'));
const CoverSection = lazy(() => import('../overview/CoverSection'));
const UserBio = lazy(() => import('./overview/UserBio'));
const Overview = lazy(() => import('./overview/Overview'));
const Timeline = lazy(() => import('./overview/Timeline'));
const Activity = lazy(() => import('./overview/Activity'));

function News() {
    const userLogin = useSelector(state => state?.userLogin);
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const {path} = useRouteMatch();
    return (
        <>
            <PageHeader
                ghost
                title="BẢNG TIN NỘI BỘ"
            />

            <Main>
                <Row gutter={25}>
                    <Col xxl={6} lg={6} md={8} xs={24}>
                        <Suspense
                            fallback={
                                <Cards headless>
                                    <Skeleton avatar active paragraph={{rows: 3}}/>
                                </Cards>
                            }
                        >
                            <UserCards
                                user={{
                                    name: userLogin?.name,
                                    designation: 'UI/UX Designer',
                                    img: LARAVEL_SERVER + userLogin?.avatar,
                                }}
                            />
                        </Suspense>
                        <Suspense
                            fallback={
                                <Cards headless>
                                    <Skeleton active paragraph={{rows: 10}}/>
                                </Cards>
                            }
                        >
                            <UserBio/>
                        </Suspense>
                    </Col>
                    <Col xxl={18} lg={18} md={16} xs={24}>
                        <SettingWrapper>
                            <Suspense
                                fallback={
                                    <Cards headless>
                                        <Skeleton active/>
                                    </Cards>
                                }
                            >
                                <div className="coverWrapper">
                                    <CoverSection/>
                                    <nav className="profileTab-menu">
                                        <ul>
                                            <li>
                                                <NavLink to={`${path}/trang-ca-nhan`}>Trang cá nhân</NavLink>
                                            </li>
                                            <li>
                                                <NavLink to={`${path}/trang-chu`}>Trang chủ</NavLink>
                                            </li>
                                            <li>
                                                <NavLink to={`${path}/thong-bao`}>Thông báo</NavLink>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Suspense>
                            <Switch>
                                <Suspense
                                    fallback={
                                        <Cards headless>
                                            <Skeleton active paragraph={{rows: 10}}/>
                                        </Cards>
                                    }
                                >
                                    <Route exact path={`${path}/trang-ca-nhan`} component={Overview}/>
                                    <Route path={`${path}/trang-chu`} component={Timeline}/>
                                    <Route path={`${path}/thong-bao`} component={Activity}/>
                                </Suspense>
                            </Switch>
                        </SettingWrapper>
                    </Col>
                </Row>
            </Main>
        </>
    );
}

News.propTypes = {
    // match: propTypes.object,
};

export default News;
