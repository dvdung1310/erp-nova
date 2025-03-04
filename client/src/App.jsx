import React, {useEffect, useState} from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {hot} from 'react-hot-loader/root';
import {Provider, useSelector} from 'react-redux';
import {ThemeProvider} from 'styled-components';
import {BrowserRouter as Router, Redirect, Route} from 'react-router-dom';
import {ReactReduxFirebaseProvider, isLoaded} from 'react-redux-firebase';
import {ConfigProvider, Spin} from 'antd';
import {ToastContainer} from "react-toastify";
import store, {rrfProps} from './redux/store';
import Admin from './routes/admin';
import Auth from './routes/auth';
import {getToken} from './utility/localStorageControl';
import './static/css/style.css';
import config from './config/config';
import ProtectedRoute from './components/utilities/protectedRoute';
import 'antd/dist/antd.less';
import '@mui/material/styles';
import '@mui/material/Tooltip';
import './styles/customcss.scss'
import 'react-toastify/dist/ReactToastify.css';

const {theme} = config;
const ProviderConfig = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const accessToken = getToken();
        if (accessToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);
    const {rtl, topMenu, darkMode, auth} = useSelector(state => {
        return {
            darkMode: state.ChangeLayoutMode.data,
            rtl: state.ChangeLayoutMode.rtlData,
            topMenu: state.ChangeLayoutMode.topMenu,
            auth: state.fb.auth,
        };
    });

    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        let unmounted = false;
        if (!unmounted) {
            setPath(window.location.pathname);
        }
        // eslint-disable-next-line no-return-assign
        return () => (unmounted = true);
    }, [setPath]);

    return (
        <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
            <ThemeProvider theme={{...theme, rtl, topMenu, darkMode}}>
                <ReactReduxFirebaseProvider {...rrfProps}>
                    {!isLoaded(auth) ? (
                        <div className="spin">
                            <Spin/>
                        </div>
                    ) : (
                        <Router basename={process.env.PUBLIC_URL}>
                            {!isLoggedIn ? <Route path="/" component={Auth}/> :
                                <ProtectedRoute path="/admin" component={Admin} isLoggedIn={isLoggedIn}/>}
                            {isLoggedIn && (path === process.env.PUBLIC_URL || path === `${process.env.PUBLIC_URL}/`) && (
                                <Redirect to="/admin"/>
                            )}
                        </Router>
                    )}
                </ReactReduxFirebaseProvider>
            </ThemeProvider>
        </ConfigProvider>
    );
}

function App() {
    return (
        <Provider store={store}>
            <ProviderConfig/>
            <ToastContainer/>
        </Provider>
    );
}

export default hot(App);
