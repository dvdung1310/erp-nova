import React, {useEffect, useState} from 'react';
import {Button, Modal, Spin} from 'antd';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import {InfoWraper, NavAuth, UserDropDwon} from './auth-info-style';
import Avatar from '../../Avatar/Avatar';
import Message from './message';
import Notification from './notification';
import Settings from './settings';
import Support from './support';
import {Popover} from '../../popup/popup';
import {Dropdown} from '../../dropdown/dropdown';
import {logOut} from '../../../redux/authentication/actionCreator';
import {fbAuthLogout} from '../../../redux/firebase/auth/actionCreator';
import Heading from '../../heading/heading';
import {removeItem} from "../../../utility/localStorageControl";
import {logout} from "../../../apis/auth";
import {BasicFormWrapper} from "../../../container/styled";
import {toast} from "react-toastify";
import {getProfile} from "../../../apis/work/user";
import {checkRole} from "../../../utility/checkValue";
import {setRoleId} from "../../../redux/users/actionCreator";

function AuthInfo() {
    const dispatch = useDispatch();
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({})
    const socketConnection = useSelector(state => state?.userSocket?.socketConnection);
    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            dispatch(setRoleId(res?.data?.role_id))
            setProfile(res?.data)
        } catch (error) {
            removeItem('accessToken');
            window.location.href = '/';
            toast.error('Đã có lỗi xảy ra', {
                position: "top-right",
                autoClose: 1000,
            })
            console.log(error);
        }
    }
    useEffect(() => {
        fetchProfile()
    }, [])
    useEffect(() => {
        if (socketConnection) {
            socketConnection.on('update-profile', async (data) => {
                console.log(data)
                setProfile(data)
            })
        }
    }, [socketConnection]);
    const showModalConfirmLogout = () => {
        setShowModalConfirm(true);
    }
    const handleCancel = () => {
        setShowModalConfirm(false);
    }
    const {isAuthenticate} = useSelector(state => {
        return {
            isAuthenticate: state.fb.auth.uid,
        };
    });

    const [state, setState] = useState({
        flag: 'english',
    });
    const {flag} = state;

    const SignOut = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            await logout();
            removeItem('accessToken');
            removeItem('role_id');
            removeItem('user_id');
            window.location.href = '/';
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error('Đăng xuất thất bại', {
                position: "top-right",
                autoClose: 1000,
            })
            console.log(error);
        }
    };

    const userContent = (
        <UserDropDwon>
            <div className="user-dropdwon">
                <figure className="user-dropdwon__info">
                    <Avatar name={profile?.name}
                            imageUrl={profile?.avatar ? `${LARAVEL_SERVER}${profile?.avatar}` : ''}
                            width={46} height={46}/>
                    <figcaption style={{marginLeft: '10px'}}>
                        <Heading as="h5">{profile?.name}</Heading>
                        <p>{checkRole(profile?.role_id)}</p>
                    </figcaption>
                </figure>
                <ul className="user-dropdwon__links">
                    <li>
                        <Link to={`/admin/nhan-su/thong-tin`}>
                            <FeatherIcon icon="user"/> Trang cá nhân
                        </Link>
                    </li>
                    {/*<li>*/}
                    {/*    <Link to="#">*/}
                    {/*        <FeatherIcon icon="settings"/> Settings*/}
                    {/*    </Link>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*    <Link to="#">*/}
                    {/*        <FeatherIcon icon="dollar-sign"/> Billing*/}
                    {/*    </Link>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*    <Link to="#">*/}
                    {/*        <FeatherIcon icon="users"/> Activity*/}
                    {/*    </Link>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                    {/*    <Link to="#">*/}
                    {/*        <FeatherIcon icon="bell"/> Help*/}
                    {/*    </Link>*/}
                    {/*</li>*/}
                </ul>
                <Link className="user-dropdwon__bottomAction" onClick={showModalConfirmLogout} to="#">
                    <FeatherIcon icon="log-out"/> Đăng xuất
                </Link>
            </div>
        </UserDropDwon>
    );

    const onFlagChangeHandle = value => {
        setState({
            ...state,
            flag: value,
        });
    };

    const country = (
        <NavAuth>
            <Link onClick={() => onFlagChangeHandle('english')} to="#">
                <img src={require('../../../static/img/flag/english.png')} alt=""/>
                <span>English</span>
            </Link>
            <Link onClick={() => onFlagChangeHandle('germany')} to="#">
                <img src={require('../../../static/img/flag/germany.png')} alt=""/>
                <span>Germany</span>
            </Link>
            <Link onClick={() => onFlagChangeHandle('spain')} to="#">
                <img src={require('../../../static/img/flag/spain.png')} alt=""/>
                <span>Spain</span>
            </Link>
            <Link onClick={() => onFlagChangeHandle('turky')} to="#">
                <img src={require('../../../static/img/flag/turky.png')} alt=""/>
                <span>Turky</span>
            </Link>
        </NavAuth>
    );

    return (
        <InfoWraper>
            {/*<Message/>*/}
            <Notification/>
            {/*<Settings/>*/}
            {/*<Support/>*/}
            {/*<div className="nav-author">*/}
            {/*    <Dropdown placement="bottomRight" content={country} trigger="click">*/}
            {/*        <Link to="#" className="head-example">*/}
            {/*            <img src={require(`../../../static/img/flag/${flag}.png`)} alt=""/>*/}
            {/*        </Link>*/}
            {/*    </Dropdown>*/}
            {/*</div>*/}

            <div className="nav-author">
                <Popover placement="bottomRight" content={userContent} action="click">
                    <Link to="#" className="head-example">
                        <Avatar name={profile?.name}
                                imageUrl={profile?.avatar ? `${LARAVEL_SERVER}${profile?.avatar}` : ''}
                                width={30}
                                height={30}/>
                    </Link>
                </Popover>
            </div>
            {/*modal confirm logout*/}
            <Modal
                type='primary'
                title="Xác nhận đăng xuất"
                visible={showModalConfirm}
                onCancel={handleCancel}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" key="submit" className='btn' onClick={SignOut}
                                style={{
                                    backgroundColor: "#dc3545",
                                    minWidth: '150px',
                                }}
                        >
                            {loading ? <div>
                                <Spin/>
                            </div> : 'Đăng xuất'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <p>Bạn có chắc chắn muốn đăng xuất?</p>
                    </BasicFormWrapper>
                </div>
            </Modal>
        </InfoWraper>
    );
}

export default AuthInfo;
