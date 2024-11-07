import {Main} from "../styled";
import {EmailNav, EmailWrapper, MailSideBar} from "../email/overview/style";
import {Col, Modal, Row, Spin} from "antd";
import {Button} from "../../components/buttons/buttons";
import FeatherIcon from "feather-icons-react";
import {Cards} from "../../components/cards/frame/cards-frame";

import {Link, NavLink, Route, Switch, useHistory} from "react-router-dom";
import React, {Suspense, useEffect, useLayoutEffect, useState} from "react";
import {PageHeader} from "../../components/page-headers/page-headers";

import {ActivityContents} from "../profile/myProfile/overview/style";
import {getNotifications, updateStatusNotification} from "../../apis/work/user";
import moment from "moment/moment";
import {toast} from "react-toastify";

const MainNotification = ({match}) => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [notification, setNotification] = useState([]);
    const [notificationUnread, setNotificationUnread] = useState([]);
    const [notificationRender, setNotificationRender] = useState([]);
    const [loadingClick, setLoadingClick] = useState(false);
    const history = useHistory();
    const [state, setState] = useState({
        responsive: 0,
        collapsed: false,
    });
    const {responsive, collapsed} = state;
    useLayoutEffect(() => {
        function updateSize() {
            const width = window.innerWidth;
            setState({responsive: width});
        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const toggleCollapsed = () => {
        setState({
            ...state,
            collapsed: !collapsed,
        });
    };
    const [activeLink, setActiveLink] = useState('all');

    const handleNavLinkClick = (name) => {
            setActiveLink(name);
            if (name === 'all') {
                setNotificationRender(notification);
            } else if (name === 'other') {
                setNotificationRender(notificationUnread);
            } else {
                setNotificationRender(notification);
            }
        }
    ;
    //
    const getNotify = async () => {
        try {
            setLoadingClick(true);
            const response = await getNotifications();
            setNotification(response?.data);
            setNotificationRender(response?.data);
            setNotificationUnread(response?.data?.filter(item => item?.notification_status === 0));
            setLoadingClick(false);
        } catch (error) {
            setLoadingClick(false);
            console.log(error);
        }
    };
    const handleUpdateStatusNotification = async (item) => {
        try {
            console.log(item)
            const url = new URL(item?.notification_link);
            const pathname = url.pathname;
            if (item.notification_status === 1) {
                history.push(pathname);
            } else {
                setLoadingClick(true);
                const payload = {
                    notification_status: 1
                };
                const res = await updateStatusNotification(item.notification_id, payload);
                if (res.error) {
                    toast.error(res.message, {
                        position: "top-right",
                        autoClose: 1000,
                    });
                }
                const notification_id = res?.data?.notification_id;
                setNotificationUnread(prevUnreadNotifications => prevUnreadNotifications.filter(notification => notification.notification_id !== notification_id));
                setNotification(prevNotifications => prevNotifications.map(notification => {
                    if (notification.notification_id === notification_id) {
                        return {
                            ...notification,
                            notification_status: 1
                        };
                    }
                    return notification;
                }));
                setNotificationRender(prevNotifications => {
                    const updatedNotifications = prevNotifications.map(notification => {
                        if (notification.notification_id === notification_id) {
                            return {
                                ...notification,
                                notification_status: 1
                            };
                        }
                        return notification;
                    });

                    return updatedNotifications.sort((a, b) => a.notification_status - b.notification_status);
                });
                history.push(pathname);
                setLoadingClick(false);
            }
        } catch (error) {
            setLoadingClick(false);
            toast.error(error.response.data.message, {
                position: "bottom-right",
                autoClose: 1000,
            });
            console.log('error', error);
        }
    };


    useEffect(() => {
        getNotify();
    }, []);
    return (
        <div>
            <PageHeader
                ghost
                title='Thông báo'
                buttons={[
                    <div key="1" className="page-header-actions">
                        <Button size="small" type="primary">
                            <FeatherIcon icon="plus" size={14}/>
                            Thêm thông báo mới
                        </Button>
                    </div>,
                ]}
            />
            <Main>
                <EmailWrapper>
                    <Row className="justify-content-center" gutter={25}>
                        <Col className="trigger-col" xxl={5} xl={7} lg={8} xs={24}>
                            {responsive <= 991 && (
                                <Button type="link" className="mail-sidebar-trigger" style={{marginTop: 0}}
                                        onClick={toggleCollapsed}>
                                    <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'}/>
                                </Button>
                            )}

                            {responsive > 991 ? (
                                <div className="mail-sideabr">
                                    <Cards headless>
                                        <div className="mail-sidebar-bottom">
                                            <EmailNav>
                                                <ul>
                                                    <li>
                                                        <NavLink
                                                            to="#"
                                                            name="all"
                                                            style={{
                                                                backgroundColor: activeLink === 'common' ? 'rgba(95, 99, 242, 0.1)' : 'transparent',
                                                                color: activeLink === 'common' ? '#5f63f2' : '#5a5f7d',
                                                            }}
                                                            onClick={() => handleNavLinkClick('common')}
                                                        >
                                                            <FeatherIcon icon="inbox" size={18}/>
                                                            <span className="nav-text">
                                                                <span>Thông báo chung</span>
                                                                <span className="badge badge-primary">3</span>
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            to="#"
                                                            name="all"
                                                            style={{
                                                                backgroundColor: activeLink === 'all' ? 'rgba(95, 99, 242, 0.1)' : 'transparent',
                                                                color: activeLink === 'all' ? '#5f63f2' : '#5a5f7d',
                                                            }}
                                                            onClick={() => handleNavLinkClick('all')}
                                                        >
                                                            <FeatherIcon icon="inbox" size={18}/>
                                                            <span className="nav-text">
                                                                <span>Tất cả thông báo</span>
                                                                <span className="badge badge-primary">3</span>
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            to="#"
                                                            name="other"
                                                            style={{
                                                                backgroundColor: activeLink === 'other' ? 'rgba(95, 99, 242, 0.1)' : 'transparent',
                                                                color: activeLink === 'other' ? '#5f63f2' : '#5a5f7d',
                                                            }}
                                                            onClick={() => handleNavLinkClick('other')}
                                                        >
                                                            <FeatherIcon icon="inbox" size={18}/>
                                                            <span className="nav-text">
                                                                <span>Thông báo chưa đọc</span>
                                                                <span className="badge badge-primary">3</span>
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </EmailNav>
                                        </div>
                                    </Cards>
                                </div>
                            ) : (
                                <MailSideBar className={collapsed ? 'mail-sideabr show' : 'mail-sideabr hide'}>
                                    <Cards headless>
                                        <Button
                                            type="link"
                                            className="mail-sidebar-trigger trigger-close"
                                            style={{marginTop: 0}}
                                            onClick={toggleCollapsed}
                                        >
                                            <FeatherIcon icon="x"/>
                                        </Button>

                                        <div className="mail-sidebar-bottom">
                                            <EmailNav>
                                                <ul>
                                                    <li>
                                                        <NavLink
                                                            to="#"
                                                            name="all"
                                                            style={{
                                                                backgroundColor: activeLink === 'common' ? 'rgba(95, 99, 242, 0.1)' : 'transparent',
                                                                color: activeLink === 'common' ? '#5f63f2' : '#5a5f7d',
                                                            }}
                                                            onClick={() => handleNavLinkClick('common')}
                                                        >
                                                            <FeatherIcon icon="inbox" size={18}/>
                                                            <span className="nav-text">
                                                                <span>Thông báo chung</span>
                                                                <span className="badge badge-primary">3</span>
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            to="#"
                                                            name="all"
                                                            style={{
                                                                backgroundColor: activeLink === 'all' ? 'rgba(95, 99, 242, 0.1)' : 'transparent',
                                                                color: activeLink === 'all' ? '#5f63f2' : '#5a5f7d',
                                                            }}
                                                            onClick={() => handleNavLinkClick('all')}
                                                        >
                                                            <FeatherIcon icon="inbox" size={18}/>
                                                            <span className="nav-text">
                                                                <span>Tất cả thông báo</span>
                                                                <span className="badge badge-primary">3</span>
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            to="#"
                                                            name="other"
                                                            style={{
                                                                backgroundColor: activeLink === 'other' ? 'rgba(95, 99, 242, 0.1)' : 'transparent',
                                                                color: activeLink === 'other' ? '#5f63f2' : '#5a5f7d',
                                                            }}
                                                            onClick={() => handleNavLinkClick('other')}
                                                        >
                                                            <FeatherIcon icon="inbox" size={18}/>
                                                            <span className="nav-text">
                                                                <span>Thông báo chưa đọc</span>
                                                                <span className="badge badge-primary">3</span>
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </EmailNav>
                                        </div>
                                    </Cards>
                                </MailSideBar>
                            )}
                        </Col>
                        <Col xxl={19} xl={17} lg={16}>
                            {
                                loadingClick ? <div className='spin'>
                                    <Spin/>
                                </div> : (
                                    <ActivityContents>
                                        <Cards headless>
                                            <ul className="activity-list">
                                                {
                                                    notificationRender.length > 0 ? notificationRender?.map((item, index) => (
                                                        <li key={index}
                                                            style={{cursor: 'pointer'}}
                                                            onClick={() => handleUpdateStatusNotification(item)}
                                                            className="activity-list__single">
                                                    <span className="activity-icon primary">
                                                      <FeatherIcon icon="inbox" size={14}/>
                                                    </span>
                                                            <div className="activity-content">
                                                                <div className="activity-info">
                                                                    <img
                                                                        src={`${LARAVEL_SERVER}${item?.create_by_user?.avatar}`}
                                                                        alt=""/>
                                                                    <p>
                                                            <span
                                                                className="inline-text color-primary">
                                                                    {`${item?.create_by_user?.name} `}
                                                                </span> {`${item?.notification_title}`}
                                                                        <span
                                                                            className="hour">{moment(item?.created_at).fromNow()} &nbsp;
                                                                            {moment(item?.created_at).format('HH:mm DD/MM/YYYY')}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )) : <>
                                                        <div className="activity-list__single">
                                                            <div className="activity-content">
                                                                <div className="activity-info">
                                                                    <p>
                                                                        Không có thông báo nào
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                }

                                            </ul>
                                        </Cards>
                                    </ActivityContents>
                                )
                            }

                        </Col>
                    </Row>
                </EmailWrapper>
            </Main>
        </div>
    )
        ;
}
export default MainNotification;