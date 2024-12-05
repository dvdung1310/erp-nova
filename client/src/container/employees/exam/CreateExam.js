import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HorizontalFormStyleWrap } from './Style';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { BasicFormWrapper } from '../../styled';
import { storeExam }  from '../../../apis/employees/exam';
import { useHistory , useParams } from 'react-router-dom';
const CreateExam = () => {
    const [form] = Form.useForm(); 
    const [examData, setExamData] = useState({
        name: '',
        description: '',
        image: null,
        time: '',
        status: 1,
    });

    const handleUploadChange = ({ fileList }) => {
        setExamData((prevData) => ({
            ...prevData,
            image: fileList.length > 0 ? fileList[0].originFileObj : null,
        }));
    };
    const history = useHistory();
    const { type: type_exam } = useParams();
    console.log('type',type_exam);
    const onFinish = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('time', values.time);
            formData.append('status', examData.status);

            if (examData.image) {
                formData.append('image', examData.image);
            }
            const response = await storeExam(formData);
            if (!response.data.error) {
                toast.success(response.data.message);
            }else{
                toast.error('lỗi rồi');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center'>
            <BasicFormWrapper className='create-exam' style={{ width: '45%' }}>
                <HorizontalFormStyleWrap>
                    <Cards>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Tạo kho đề</h3>
                    <Button   type="primary"  onClick={() => history.push(`/admin/nhan-su/danh-sach-de`)}> Danh sách Kho đề</Button>
                     </div>
                        <Form
                            form={form}
                            name="create_exam"
                            layout="horizontal"
                            onFinish={onFinish} 
                        >
                            <Row align="middle">
                                <Col lg={8} md={9} xs={24}>
                                    <label htmlFor="name">Tên đề thi</label>
                                </Col>
                                <Col lg={16} md={15} xs={24}>
                                    <Form.Item
                                        name="name"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}
                                    >
                                        <Input type="text" id="name" placeholder="Nhập tên đề thi" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row align="middle">
                                <Col lg={8} md={9} xs={24}>
                                    <label htmlFor="description">Nội dung</label>
                                </Col>
                                <Col lg={16} md={15} xs={24}>
                                    <Form.Item
                                        name="description"
                                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                    >
                                        <Input.TextArea id="description" placeholder="Nội dung" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row align="middle">
                                <Col lg={8} md={9} xs={24}>
                                    <label htmlFor="time">Thời gian</label>
                                </Col>
                                <Col lg={16} md={15} xs={24}>
                                    <Form.Item
                                        name="time"
                                        rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                                    >
                                        <Input id="time" placeholder="Nhập thời gian (phút)" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row align="middle">
                                <Col lg={8} md={9} xs={24}>
                                    <label>Thêm ảnh</label>
                                </Col>
                                <Col lg={16} md={15} xs={24}>
                                    <Form.Item name="image">
                                        <Upload
                                            name="image"
                                            listType="picture"
                                            beforeUpload={() => false} 
                                            onChange={handleUploadChange} 
                                        >
                                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={{ span: 16, offset: 8 }} md={{ span: 15, offset: 9 }} xs={{ span: 24, offset: 0 }}>
                                    <div className="sDash_form-action">
                                        <Button className="btn-signin" htmlType="button" type="light" size="large">
                                            Cancel
                                        </Button>
                                        <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                                            Tạo
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Cards>
                </HorizontalFormStyleWrap>
            </BasicFormWrapper>
            <ToastContainer />
        </div>
    );
};

export default CreateExam;
