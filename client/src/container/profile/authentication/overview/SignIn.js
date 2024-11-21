import React, {useCallback, useState} from 'react';
import {Form, Input, Button, Spin} from 'antd';
import {NavLink, useHistory} from "react-router-dom";
import Cookies from 'js-cookie';
import {toast} from 'react-toastify';
import {AuthWrapper} from './style';

import {login} from '../../../../apis/auth';
import Heading from '../../../../components/heading/heading';
import {setItem} from "../../../../utility/localStorageControl";
import {useDispatch} from "react-redux";
import {setRoleId} from "../../../../redux/users/actionCreator";


function SignIn() {
    const [isLoading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const history = useHistory();
    const dispatch = useDispatch();


    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true)
            const data = form.getFieldsValue();
            const res = await login(data);
            setItem('accessToken', res?.data?.accessToken)
            setItem('role_id', res?.data?.role_id)
            setItem('user_id', res?.data?.user_id)
            dispatch(setRoleId(res?.data?.role_id))
            Cookies.set('logedIn', true);
            history.push('/admin/lam-viec');
            window.location.reload();
            toast.success('Đăng nhập thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error(error?.response?.data?.message, {
                position: "top-right",
                autoClose: 1000,
            });
            console.log(error);
        }
    }, [history]);
    return (
        <AuthWrapper>
            <div className="auth-contents">
                <Form name="login" form={form} onFinish={handleSubmit} layout="vertical">
                    <Heading as="h3" className='text-center'>
                        Đăng nhập hệ thống
                    </Heading>
                    <Form.Item
                        name="email"
                        rules={[{message: 'Vui lòng nhập email', required: true}]}
                        label="Địa chỉ Email"
                    >
                        <Input placeholder="Email"/>
                    </Form.Item>
                    <Form.Item name="password" label="Mật khẩu"
                               rules={[{message: 'Vui lòng nhập mật khẩu', required: true}]}
                    >
                        <Input.Password placeholder="Mật khẩu"/>
                    </Form.Item>
                    <Form.Item className='d-flex justify-content-center'>
                        <Button className="btn-signin"
                                style={{
                                    backgroundColor: isLoading ? "#8c94ff" : "#5f63f2",
                                }}
                                htmlType="submit" type="primary" size="large">
                            {isLoading ? <div>
                                <Spin/>
                            </div> : 'Đăng nhập'}
                        </Button>
                    </Form.Item>
                    <div className='d-flex justify-content-center'>
                        <NavLink className="forgot-pass-link" to="/quen-mat-khau">
                            Quên mật khẩu?
                        </NavLink>
                    </div>

                </Form>
            </div>
        </AuthWrapper>
    );
}

export default SignIn;
