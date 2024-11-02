import React, {useState} from 'react';
import {NavLink} from 'react-router-dom/cjs/react-router-dom.min';
import {Form, Input, Button, Spin} from 'antd';
import {AuthWrapper} from './style';
import Heading from '../../../../components/heading/heading';
import {useHistory, useLocation, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {forgotPassword} from "../../../../apis/work/user";

function ForgotPassword() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const handleSubmit = async () => {
        try {
            setLoading(true)
            const data = form.getFieldsValue();
            const payload = {
                email: data.email
            }
            const res = await forgotPassword(payload);
            if (res.error) {
                toast.error(res.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoading(false)
                return;
            }
            toast.success('Gửi yêu cầu thành công', {
                position: "top-right",
                autoClose: 1000,
            })
            history.push('/');
            form.resetFields();
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error('Đã có lỗi xảy ra', {
                position: "top-right",
                autoClose: 1000,
            })
            console.log(error);
        }

    };

    return (
        <AuthWrapper>
            <div className="auth-contents">
                <Form name="forgotPass" onFinish={handleSubmit} form={form} layout="vertical">
                    <Heading as="h3">Quên mật khẩu</Heading>
                    <Form.Item
                        label="Nhập địa chỉ email"
                        name="email"
                        rules={[{required: true, message: 'Vui lòng nhập email!', type: 'email'}]}
                    >
                        <Input placeholder="name@example.com"/>
                    </Form.Item>
                    <Form.Item>
                        <Button className="btn-reset" htmlType="submit" type="primary" size="large">
                            {
                                loading ? <div className=""><Spin/></div> : ' Gửi yêu cầu'
                            }

                        </Button>
                    </Form.Item>
                    <p className="return-text">
                        Quay lại <NavLink to="/">Đăng nhập</NavLink>
                    </p>
                </Form>
            </div>
        </AuthWrapper>
    );
}

export default ForgotPassword;
