import { Col, Form, Input, Modal, Row, Spin, Upload, DatePicker } from 'antd';
import { BasicFormWrapper } from '../../../styled';
import { Button } from '../../../../components/buttons/buttons';
import React, { useEffect, useState } from 'react';
import '../../EmployeesInformation.scss';
import Avatar from '../../../../components/Avatar/Avatar';
import { toast } from 'react-toastify';
import { changePassword, getProfile, updateProfile } from '../../../../apis/work/user';
import { employeeLogin, updatEployeeLogin } from '../../../../apis/employees/employee';
import moment from 'moment';
const EmployeesInformation = ({ dataSource, setDataSource }) => {
  const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [user, setUser] = useState(dataSource);
  const [imagePreview, setImagePreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [form] = Form.useForm();
  //
  const [show, setShow] = useState(false);
  const [data, setData] = useState({
    old_password: '',
    new_password: '',
  });
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleChangePassword = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  const handlePasswordClick = async () => {
    try {
      setLoadingPassword(true);
      if (data.old_password === '' || data.new_password === '') {
        toast.error('Vui lòng nhập đầy đủ thông tin', {
          position: 'bottom-right',
          autoClose: 1000,
        });
        setLoadingPassword(false);
        return;
      }
      const payload = {
        old_password: data.old_password,
        new_password: data.new_password,
      };
      const res = await changePassword(payload);
      if (res.error) {
        toast.error(res.error, {
          position: 'bottom-right',
          autoClose: 1000,
        });
        setLoadingPassword(false);
        return;
      }

      toast.success('Cập nhật thành công', {
        position: 'bottom-right',
        autoClose: 1000,
      });
      setLoadingPassword(false);
      setShow(false);
      setData({
        old_password: '',
        new_password: '',
      });
    } catch (error) {
      console.log('error', error);
      toast.error(error.response.data.message, {
        position: 'bottom-right',
        autoClose: 1000,
      });
      setLoadingPassword(false);
    }
  };
  //
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await employeeLogin();
      
      // Ensure employee_date_join is parsed as a moment object
      const formattedDateJoin = res?.data?.employee_date_join 
        ? moment(res.data.employee_date_join) 
        : null;
  
      form.setFieldsValue({
        employee_name: res?.data?.employee_name,
        employee_email: res?.data?.employee_email,
        employee_email_nova: res?.data?.employee_email_nova,
        employee_phone: res?.data?.employee_phone,
        employee_address: res?.data?.employee_address,
        employee_identity: res?.data?.employee_identity,
        employee_bank_number: res?.data?.employee_bank_number,
        employee_date_join: formattedDateJoin, // Set formatted date here
      });
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Đã có lỗi xảy ra', {
        autoClose: 1000,
        position: 'top-right',
      });
      console.log(error);
    }
  };
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
  };
  const handleUpdate = async () => {
    try {
      setLoadingUpdate(true);
      const values = form.getFieldsValue();

      // Chuyển đổi `employee_date_join` sang chuỗi nếu cần
      if (values.employee_date_join) {
        values.employee_date_join = values.employee_date_join.format('YYYY-MM-DD');
      }

      const res = await updatEployeeLogin(values);

      if (res.error) {
        toast.error(res?.message, {
          autoClose: 1000,
          position: 'top-right',
        });
        setLoadingUpdate(false);
        return;
      }

      // Cập nhật giao diện sau khi lưu thành công
      toast.success('Cập nhật thông tin thành công', {
        autoClose: 1000,
        position: 'top-right',
      });

      form.setFieldsValue({
        ...res.data,
        employee_date_join: res.data.employee_date_join ? moment(res.data.employee_date_join) : null,
      });
      setImagePreview(user.avatar ? `${LARAVEL_SERVER}${user.avatar}` : null);
      setDataSource(res?.data);
      setLoadingUpdate(false);
    } catch (error) {
      setLoadingUpdate(false);
      toast.error('Đã có lỗi xảy ra', {
        autoClose: 1000,
        position: 'top-right',
      });
      console.log(error);
    }
  };

  return (
    <>
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <Row justify="center" gutter={[25, 25]} style={{ marginLeft: '0', marginRight: '0' }}>
            {/* <Col xl={16} md={16} xs={24}>
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
                        </Col> */}
            <Col xl={24} md={24} xs={24}>
              <div className="user-info-form">
                <BasicFormWrapper>
                  <Form style={{ width: '100%' }} form={form} name="info" onFinish={handleUpdate}>
                    <Row justify="center" gutter={[25, 25]} style={{ marginLeft: '0', marginRight: '0' }}>
                      <Col xl={12} md={12} xs={24}>
                        <Form.Item
                          label="Họ và tên"
                          name="employee_name"
                          rules={[{ message: 'Vui lòng nhập họ và tên', required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xl={12} md={12} xs={24}>
                        <Form.Item
                          label="SĐT"
                          name="employee_phone"
                          rules={[{ message: 'Vui lòng nhập số điện thoại', required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xl={12} md={12} xs={24}>
                        <Form.Item
                          label="Email cá nhân"
                          name="employee_email"
                          rules={[{ message: 'Vui lòng nhập email cá nhân', required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xl={12} md={12} xs={24}>
                        <Form.Item
                          label="Email Nova"
                          name="employee_email_nova"
                          rules={[{ message: 'Vui lòng nhập email Nova', required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xl={24} md={24} xs={24}>
                        <Form.Item
                          label="Địa chỉ"
                          name="employee_address"
                          rules={[{ message: 'Vui lòng nhập họ và tên', required: true }]}
                        >
                          <Input.TextArea />
                        </Form.Item>
                      </Col>
                      <Col xl={12} md={12} xs={24}>
                        <Form.Item label="Căn cước công dân" name="employee_identity">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xl={12} md={12} xs={24}>
                        <Form.Item label="Số tài khoản" name="employee_bank_number">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xl={24} md={24} xs={24}>
                        <Form.Item
                          label="Ngày vào làm"
                          name="employee_date_join"
                          rules={[{ message: 'Vui lòng nhập ngày vào làm', required: true }]}
                        >
                          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Chọn ngày vào làm" />
                        </Form.Item>
                      </Col>
                      <Col xl={24} md={24} xs={24}>
                        <Form.Item>
                          <div className="add-user-bottom text-right d-flex justify-content-between">
                            <Button htmlType="submit" type="primary" style={{ minWidth: '100px' }}>
                              {loadingUpdate ? <Spin /> : 'Cập nhật'}
                            </Button>
                            {/* eslint-disable-next-line react/button-has-type */}
                            <button
                              className="ant-btn ant-btn-primary sc-esYiGF fZPPvY"
                              type="button"
                              onClick={handleShow}
                            >
                              Đổi mật khẩu
                            </button>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
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
              name="old_password"
              value={data.old_password}
              placeholder="Nhập mật khẩu cũ"
              className="form-control fs-5"
            />
          </Form.Item>
          <Form.Item label="Mật khẩu mới" className="form-group mt-3">
            <Input.Password
              id="input2"
              onChange={handleChangePassword}
              name="new_password"
              value={data.new_password}
              placeholder="Nhập mật khẩu mới"
              className="form-control fs-5"
            />
          </Form.Item>
        </Form>
        <div className="d-flex justify-content-center">
          <Button
            type="primary"
            style={{ minWidth: '300px' }}
            onClick={handlePasswordClick}
            className="btn btn-primary fs-4"
          >
            {loadingPassword ? <Spin /> : 'Cập nhật'}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default EmployeesInformation;
