import React, {useCallback, useState} from 'react';
import {Form, Input, Button, Spin} from 'antd';
import {useHistory} from "react-router-dom";
import Cookies from 'js-cookie';
import {AuthWrapper} from './style';
import {login} from '../../../../apis/auth';
import Heading from '../../../../components/heading/heading';
import {setItem} from "../../../../utility/localStorageControl";

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
            history.push('/admin')
            setLoading(false)
        } catch (error) {
            setLoading(false)
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
