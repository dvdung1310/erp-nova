import React, {useEffect, useState} from 'react';
import {Badge, Spin} from 'antd';
import FeatherIcon from 'feather-icons-react';
import {Link, useHistory} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Scrollbars} from 'react-custom-scrollbars';
import {useSelector} from 'react-redux';
import {AtbdTopDropdwon} from './auth-info-style';
import {Popover} from '../../popup/popup';
import Heading from '../../heading/heading';
import {PiSealWarning, PiWarningCircleBold} from "react-icons/pi";
import {
    getNotificationAaiFood,
    getNotifications,
    getNotificationWarning,
    updateStatusNotification
} from "../../../apis/work/user";
import {toast} from "react-toastify";
import moment from "moment/moment";
import {motion} from "framer-motion";
import {TbNotification} from "react-icons/tb";

moment.locale('vi');

function AaiFoodNotification() {
    const [activeTab, setActiveTab] = useState('recent');
    const [notification, setNotification] = useState([]);
    const [notificationUnread, setNotificationUnread] = useState([]);
    const [notificationRender, setNotificationRender] = useState([]);
    const history = useHistory();
    const [newNotification, setNewNotification] = useState(false);
    const [loadingClick, setLoadingClick] = useState(false);
    const socketConnection = useSelector(state => state?.userSocket?.socketConnection);
    const {rtl} = useSelector(state => {
        return {
            rtl: state.ChangeLayoutMode.rtlData,
        };
    });
    const notificationIconVariants = {
        initial: {scale: 1},
        animate: {
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 15, -15, 0],
            transition: {duration: 0.5, repeat: Infinity, repeatType: "reverse"}
        }
    };
    const getNotify = async () => {
        try {
            setLoadingClick(true);
            const response = await getNotificationAaiFood();
            setNotification(response?.data);
            setNotificationRender(response?.data);
            setNotificationUnread(response?.data?.filter(item => item?.notification_status === 0));
            setLoadingClick(false);
        } catch (error) {
            setLoadingClick(false);
            console.log(error);
        }
    };


    useEffect(() => {
        getNotify();
    }, []);

    useEffect(() => {
        if (socketConnection) {
            const receiveNotification = async (data) => {
                // setNotification(prevNotifications => [data, ...prevNotifications]);
                // setNotificationRender(prevNotifications => [data, ...prevNotifications]);
                // setNotificationUnread(prevUnreadNotifications => [data, ...prevUnreadNotifications]);
                getNotify();
                setNewNotification(true);
                setTimeout(() => {
                    setNewNotification(false);
                }, 3000)// Trigger animation
            };
            socketConnection.on('notification-aaifood', receiveNotification);
            // Clean up the event listener on component unmount or when socketConnection changes
            return () => {
                socketConnection.off('notification-aaifood');
            };
        }
    }, [socketConnection]);

    const handleUpdateStatusNotification = async (item) => {
        try {
            console.log(item)
            let url = new URL(item?.notification_link);
            let pathname = url.pathname;
            if (item.notification_type === 1) {
                url = new URL(`${item?.notification_link}/${item?.notification_id}`);
                pathname = url.pathname;
            }

            if (item.notification_status === 1) {
                history.push(pathname);
                setActiveTab('recent');
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

                setActiveTab('recent');
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

    function renderThumb({style, ...props}) {
        const thumbStyle = {
            borderRadius: 6,
            backgroundColor: '#F1F2F6',
        };
        return <div style={{...style, ...thumbStyle}} {...props} />;
    }

    const renderTrackVertical = () => {
        const thumbStyle = {
            position: 'absolute',
            width: '6px',
            transition: 'opacity 200ms ease 0s',
            opacity: 0,
            [rtl ? 'left' : 'right']: '2px',
            bottom: '2px',
            top: '2px',
            borderRadius: '3px',
        };
        return <div className="hello" style={thumbStyle}/>;
    };

    function renderView({style, ...props}) {
        const customStyle = {
            marginRight: rtl && 'auto',
            [rtl ? 'marginLeft' : 'marginRight']: '-17px',
        };
        return <div {...props} style={{...style, ...customStyle}}/>;
    }

    renderThumb.propTypes = {
        style: PropTypes.shape(PropTypes.object),
    };

    renderView.propTypes = {
        style: PropTypes.shape(PropTypes.object),
    };

    const content = (
        <AtbdTopDropdwon className="atbd-top-dropdwon">
            {loadingClick && (
                <div className='d-flex justify-content-center'>
                    <Spin/>
                </div>
            )}
            <div style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                padding: '0 10px',
                margin: '10px 0'
            }}>
                <Badge count={notificationUnread?.length > 99 ? '99+' : notificationUnread?.length} offset={[10, -5]}
                       className="custom-badge">
                    <div className={`head-example ${activeTab === 'unread' ? 'active' : ''}`}
                         onClick={() => {
                             setNotificationRender(notificationUnread);
                             setActiveTab('unread');
                         }}
                    >
                        Chưa đọc
                    </div>
                </Badge>
                <Badge offset={[10, -5]} className="custom-badge">
                    <div className={`head-example ${activeTab === 'recent' ? 'active' : ''}`}
                         onClick={() => {
                             setNotificationRender(notification);
                             setActiveTab('recent');
                         }}
                    >
                        Tất cả
                    </div>
                </Badge>
            </div>
            <Scrollbars
                autoHeight
                autoHide
                renderThumbVertical={renderThumb}
                renderView={renderView}
                renderTrackVertical={renderTrackVertical}
            >
                <ul className="atbd-top-dropdwon__nav notification-list">
                    {notificationRender?.length > 0 ?
                        notificationRender?.map((notification, index) => (
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                            <li key={index} onClick={() => handleUpdateStatusNotification(notification)}>
                                <div>
                                    <div className="atbd-top-dropdwon__content notifications">
                                        <div className="notification-icon bg-primary">
                                            <FeatherIcon icon="hard-drive"/>
                                        </div>
                                        <div className="notification-content d-flex">
                                            <div className="notification-text">
                                                <Heading as="h5">
                                                    {notification?.notification_title}
                                                </Heading>
                                                <p> {moment(notification?.created_at).fromNow()} &nbsp;
                                                    {moment(notification?.created_at).format('HH:mm DD/MM/YYYY')}</p>
                                            </div>
                                            <div className="notification-status">
                                                {notification?.notification_status === 0 && <Badge dot/>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                        : <>
                            <Heading as="h5">
                                Không có thông báo mới
                            </Heading>
                        </>
                    }
                </ul>
            </Scrollbars>
            <div style={{marginTop: '10px'}}>
                <Link type='button' style={{textAlign: 'center'}} to="/admin/thong-bao">Xem tất cả thông báo</Link>
            </div>
        </AtbdTopDropdwon>
    );

    return (
        <div className="message">
            <Popover placement="bottomLeft" content={content} action="click">
                <Badge
                    count={notificationUnread?.length > 9 ? '9+' : notificationUnread?.length}
                    offset={[-8, -5]} className="custom-badge">
                    <div className="head-example" style={{marginBottom: '-6px'}}>
                        <motion.div
                            title={"Thông báo aaifood"}
                            variants={notificationIconVariants}
                            initial="initial"
                            animate={newNotification ? "animate" : "initial"} // Apply animation
                            onAnimationComplete={() => setNewNotification(false)} // Reset animation state
                        >
                            <TbNotification size={24}/>
                        </motion.div>

                    </div>
                </Badge>
            </Popover>
        </div>
    );
}

AaiFoodNotification.propTypes = {
    rtl: PropTypes.bool,
};

export default AaiFoodNotification;
