import React, {useCallback, useState} from 'react';
import {Form, Input, Button, Spin} from 'antd';
import {useHistory} from "react-router-dom";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import {AuthWrapper} from './style';

import {login} from '../../../../apis/auth';
import Heading from '../../../../components/heading/heading';
import {setItem} from "../../../../utility/localStorageControl";
import {toast} from "react-toastify";


function SignIn() {
    const [isLoading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const history = useHistory();


    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true)
            const data = form.getFieldsValue();
            const res = await login(data);
            setItem('accessToken', res?.accessToken)
            Cookies.set('logedIn', true);
<<<<<<< HEAD
            history.push('/admin');
            window.location.reload();
            toast.success('Đăng nhập thành công', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
=======
            toast.success('Đăng nhập thành công', {
                position:'top-right',
                autoClose:1000
            });
            window.location.reload();
            history.push('/admin')
>>>>>>> 5a5c642919b52b9a68ad4af1d8a5064c246c79d1
            setLoading(false)
        } catch (error) {
            toast.success('Đăng nhập thất bại', {
                position:'top-right',
                autoClose:1000
            });
            setLoading(false)
            toast.error('Đăng nhập thất bại', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
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
                    <Form.Item name="password" label="Mật khẩu">
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
                </Form>
            </div>
        </AuthWrapper>
    );
}

export default SignIn;
