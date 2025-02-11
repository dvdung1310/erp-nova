import {Col, Form, Input, Modal, Row, Spin, Upload} from 'antd';
import {BasicFormWrapper} from '../styled';
import {Button} from '../../components/buttons/buttons';
import React, {useEffect, useState} from 'react';
import './EmployeesInformation.scss'
import Avatar from "../../components/Avatar/Avatar";
import {toast} from "react-toastify";
import {changePassword, getProfile, updateProfile} from "../../apis/work/user";

const EmployeesInformation = () => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [loading, setLoading] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [user, setUser] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [form] = Form.useForm();
    //
    const [show, setShow] = useState(false)
    const [data, setData] = useState({
        old_password: '', new_password: ''
    })
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)
    const handleChangePassword = (e) => {
        setData({
            ...data, [e.target.name]: e.target.value
        })
    }
    const handlePasswordClick = async () => {
        try {
            setLoadingPassword(true)
            if (data.old_password === '' || data.new_password === '') {
                toast.error('Vui lòng nhập đầy đủ thông tin', {
                    position: "bottom-right", autoClose: 1000,
                })
                setLoadingPassword(false)
                return;
            }
            const payload = {
                old_password: data.old_password,
                new_password: data.new_password
            }
            const res = await changePassword(payload);
            if (res.error) {
                toast.error(res.error, {
                    position: "bottom-right", autoClose: 1000,
                })
                setLoadingPassword(false)
                return;
            }

            toast.success('Cập nhật thành công', {
                position: "bottom-right", autoClose: 1000,
            })
            setLoadingPassword(false)
            setShow(false)
            setData({
                old_password: '', new_password: ''
            })
        } catch (error) {
            console.log('error', error)
            toast.error(error.response.data.message, {
                position: "bottom-right", autoClose: 1000,
            })
            setLoadingPassword(false)
        }
    }
    //
    const fetchUser = async () => {
        try {
            setLoading(true)
            const res = await getProfile();
            setUser(res.data);
            form.setFieldsValue({
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
            });
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error('Đã có lỗi xảy ra', {
                autoClose: 1000,
                position: 'top-right'
            });
            console.log(error);
        }
    }
    useEffect(() => {
        fetchUser();
    }, []);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setAvatar(file);
        }
    }
    const handleUpdate = async () => {
        try {
            setLoadingUpdate(true);
            const name = form.getFieldValue('name');
            const email = form.getFieldValue('email');
            const phone = form.getFieldValue('phone');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            if (avatar) {
                formData.append('avatar', avatar);
            }
            const res = await updateProfile(formData);
            if (res.error) {
                toast.error(res?.message, {
                    autoClose: 1000,
                    position: 'top-right'
                });
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật thông tin thành công', {
                autoClose: 1000,
                position: 'top-right'
            });
            form.setFieldsValue({
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
            });
            setLoadingUpdate(false);
        } catch (error) {
            setLoadingUpdate(false);
            toast.error('Đã có lỗi xảy ra', {
                autoClose: 1000,
                position: 'top-right'
            });
            console.log(error);
        }
    };
    return (
        <>
            {loading ? <div className='spin'>
                <Spin/>
            </div> : (
                <div style={{marginBottom: '20px'}}>
                    <Row justify="center" gutter={[16, 16]} style={{marginLeft: '0', marginRight: '0'}}>
                        <Col span={24}>
                            <h1 className='info' style={{textAlign: 'center', fontSize: '24px', margin: '20px 0'}}>Thông
                                tin tài khoản</h1>
                        </Col>
                        <Col xl={16} md={16} xs={24}>
                            <figure className="photo-upload align-center-v">
                                <input type="file" hidden name='avatar' id='avatar' onChange={handleImageChange}/>
                                <label htmlFor="avatar" style={{cursor: "pointer", position: 'relative'}}>
                                    <Avatar name={user?.name}
                                            imageUrl={imagePreview || (user.avatar ? `${LARAVEL_SERVER}${user?.avatar}` : '')}
                                            width={120}
                                            height={120}/>
                                    <div className='edit-label'>Sửa
                                    </div>
                                </label>
                            </figure>
                        </Col>
                        <Col xl={10} md={16} xs={24}>
                            <div className="user-info-form">
                                <BasicFormWrapper>
                                    <Form style={{width: '100%'}} form={form} name="info" onFinish={handleUpdate}>
                                        <Form.Item
                                            label="Họ và tên" name="name"
                                            rules={[{message: 'Vui lòng nhập họ và tên', required: true}]}
                                        >
                                            <Input/>
                                        </Form.Item>

                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[{message: 'Vui lòng nhập email', type: 'email', required: true}]}
                                        >
                                            <Input/>
                                        </Form.Item>

                                        <Form.Item name="phone"
                                                   label="Số điện thoại"
                                                   rules={[{message: 'Vui lòng nhập số điện thoại', required: true}]}
                                        >
                                            <Input/>
                                        </Form.Item>

                                        <Form.Item>
                                            <div className="add-user-bottom text-right d-flex justify-content-between">
                                                <Button htmlType="submit" type="primary" style={{minWidth: '100px'}}>
                                                    {
                                                        loadingUpdate ? <Spin/> : 'Cập nhật'
                                                    }
                                                </Button>
                                                {/* eslint-disable-next-line react/button-has-type */}
                                                <button className='ant-btn ant-btn-primary sc-esYiGF fZPPvY'
                                                        type='button'
                                                        onClick={handleShow}
                                                >
                                                    Đổi mật khẩu
                                                </button>
                                            </div>
                                        </Form.Item>
                                    </Form>
                                </BasicFormWrapper>
                            </div>
                        </Col>
                    </Row>


                </div>
            )}
            <Modal visible={show} onCancel={handleClose} centered footer={null} title="Đổi mật khẩu">
                <Form>
                    <Form.Item label="Mật khẩu cũ" className="form-group">
                        <Input.Password
                            id="input1"
                            onChange={handleChangePassword}
                            name='old_password'
                            value={data.old_password}
                            placeholder="Nhập mật khẩu cũ"
                            className="form-control fs-5"
                        />
                    </Form.Item>
                    <Form.Item label="Mật khẩu mới" className="form-group mt-3">
                        <Input.Password
                            id="input2"
                            onChange={handleChangePassword}
                            name='new_password'
                            value={data.new_password}
                            placeholder="Nhập mật khẩu mới"
                            className="form-control fs-5"
                        />
                    </Form.Item>
                </Form>
                <div className='d-flex justify-content-center'>
                    <Button
                        type="primary"
                        style={{minWidth: '300px'}}
                        onClick={handlePasswordClick}
                        className='btn btn-primary fs-4'
                    >
                        {loadingPassword ? <Spin/> : 'Cập nhật'}
                    </Button>
                </div>
            </Modal>
        </>

    );
};

export default EmployeesInformation;