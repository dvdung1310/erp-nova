import React, {Suspense, lazy, useEffect} from 'react';
import {Spin} from 'antd';
import {Switch, Route, useRouteMatch, useHistory} from 'react-router-dom';

import Dashboard from './dashboard';
import Ecommerce from './ecommerce';
import Pages from './pages';
import Users from './users';
import Widgets from './widgets';
import Features from './features';
import Axios from './axios';
import Gallery from './gallery';
import Novaup from "./Novaup";
import Employees from "./employees";
import withAdminLayout from '../../layout/withAdminLayout';
import Work from "./work";
import {urlBase64ToUint8Array} from "../../utility/utility";
import {registerDevice} from "../../apis/work/user";
import Recruit from "./Recruit";
import {getItem, removeItem} from "../../utility/localStorageControl";

const Projects = lazy(() => import('./projects'));
const Calendars = lazy(() => import('../../container/Calendar'));
const Inbox = lazy(() => import('../../container/email/Email'));
const Chat = lazy(() => import('../../container/chat/ChatApp'));
const Myprofile = lazy(() => import('../../container/profile/myProfile/Index'));
const Firebase = lazy(() => import('./firebase'));
const ToDo = lazy(() => import('../../container/toDo/ToDo'));
const Note = lazy(() => import('../../container/note/Note'));
const Contact = lazy(() => import('../../container/contact/Contact'));
const ContactGrid = lazy(() => import('../../container/contact/ContactGrid'));
const ContactAddNew = lazy(() => import('../../container/contact/AddNew'));
const Calendar = lazy(() => import('../../container/calendar/Calendar'));
// const FileManager = lazy(() => import('../../container/fileManager/FileManager'));
const Kanban = lazy(() => import('../../container/kanban/Index'));
const Task = lazy(() => import('../../container/task/Index'));
// const Recruit = lazy(() => import('../../container/task/Index'));
import {io} from "socket.io-client";
import {useDispatch} from "react-redux";
import {socketConnect, socketDisconnect} from '../../redux/users/actionCreator';
import {toast} from "react-toastify";

function Admin() {
    const {path} = useRouteMatch();
    const publicVapidKey = 'BFRuISHeTPNFMZv_7-PndFq72gEqCd8tvf1YX7mTYyuXkOa3vdBxtvzxaj3B1B8AsYy0rG1Mg4DsFS51glqBFSM';
    const user_id = getItem('user_id');
    const history = useHistory();
    const dispatch = useDispatch();

    async function send() {
        try {
            // Đăng ký Service Worker
            const register = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            console.log('Service Worker Registered');

            // Đăng ký Push
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
            const payload = {
                endpoint: subscription
            }
            console.log('Push Registered');
            // Gửi Subscription đến Server

            await registerDevice(payload);
            console.log('Push Sent');
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => {
                    send();
                })
                .catch(error => {
                    console.error('Service Worker đăng ký thất bại', error);
                });
        }
        const socketConnection = io(process.env.REACT_APP_NODE_SERVER, {
            auth: {
                user_id,
            },
        });
        if (socketConnection) {
            dispatch(socketConnect(socketConnection));
        }
        return () => {
            socketConnection.disconnect();
            dispatch(socketDisconnect(null));
        }
    }, []);

    return (
        <Switch>
            <Suspense
                fallback={
                    <div className="spin">
                        <Spin/>
                    </div>
                }
            >
                <Route path={path} component={Dashboard}/>
                <Route path={`${path}/dashboard`} component={Dashboard}/>
                <Route path={`${path}/ecommerce`} component={Ecommerce}/>
                <Route path={`${path}`} component={Pages}/>
                <Route path={`${path}`} component={Features}/>
                <Route path={`${path}`} component={Axios}/>
                <Route path={`${path}/users`} component={Users}/>
                <Route path={`${path}/gallery`} component={Gallery}/>
                <Route path={`${path}/project`} component={Projects}/>
                <Route path={`${path}/calendar`} component={Calendars}/>
                <Route path={`${path}/app/kanban`} component={Kanban}/>
                <Route path={`${path}/email/:page`} component={Inbox}/>
                <Route path={`${path}/firestore`} component={Firebase}/>
                <Route path={`${path}/main/chat`} component={Chat}/>
                <Route path={`${path}/profile/myProfile`} component={Myprofile}/>
                <Route path={`${path}/app/to-do`} component={ToDo}/>
                <Route path={`${path}/app/note`} component={Note}/>
                <Route path={`${path}/app/task`} component={Task}/>
                <Route path={`${path}/contact/list`} component={Contact}/>
                <Route path={`${path}/contact/grid`} component={ContactGrid}/>
                <Route path={`${path}/contact/addNew`} component={ContactAddNew}/>
                <Route path={`${path}/app/calendar`} component={Calendar}/>
                <Route path={`${path}/widgets`} component={Widgets}/>
                {/**/}
                <Route path={`${path}/novaup`} component={Novaup}/>
                <Route path={`${path}/nhan-su`} component={Employees}/>
                <Route path={`${path}/lam-viec`} component={Work}/>
                <Route path={`${path}/tuyen-dung`} component={Recruit}/>
            </Suspense>
        </Switch>
    );
}

export default withAdminLayout(Admin);
