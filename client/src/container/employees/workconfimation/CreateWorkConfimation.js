import { Row, Col, Input, Card, Button, Form, message } from "antd"; 
import { useState } from "react";
import {toast} from "react-toastify";
import {useHistory} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { storeWorkConfimation } from '../../../apis/employees/workconfimation';
import './WorkConfimation.css';

const CreateWorkConfirmation = () => {
    const [formData, setFormData] = useState([{ workDate: '', time: '', workNumber: '', workContent: '', reason: '' }]);
    const history = useHistory();
    const handleAddRowWork = () => {
        setFormData([...formData, { workDate: '', time: '', workNumber: '', workContent: '', reason: '' }]);
    };

    const handleRemoveRow = (index) => {
        const newFormData = formData.filter((_, i) => i !== index);
        setFormData(newFormData);
    };

    const handleChange = (index, event) => {
        const newFormData = [...formData];
        newFormData[index] = {
            ...newFormData[index],
            [event.target.name]: event.target.value
        };
        setFormData(newFormData);
    };

    const handleSubmit = async () => {
        try {
            const response = await storeWorkConfimation(formData);
            toast.success(response.message);
            setTimeout(() => {
                history.push(`/admin/nhan-su/chi-tiet-xac-nhan-cong/${response.workConfirmationId}`);
            }, 2000);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra');
        }
    };

    return (
        <div className="work-confimation-container">
            <Card title="Tạo Giấy Xác Nhận Công" bordered={false}>
                <Form layout="vertical" onFinish={handleSubmit}>
                    {formData.map((row, index) => (
                        <Row key={index} gutter={16}>
                            <Col md={4} xs={12}>
                                <Form.Item name={`workDate[${index}]`} label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                                    <Input 
                                        type="date" 
                                        name="workDate" 
                                        value={row.workDate} 
                                        onChange={(event) => handleChange(index, event)} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={3} xs={12}>
                                <Form.Item name={`time[${index}]`} label="Thời gian" rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}>
                                    <Input 
                                        name="time" 
                                        value={row.time} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập time"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={3} xs={12}>
                                <Form.Item name={`workNumber[${index}]`} label="Số công" rules={[{ required: true, message: 'Vui lòng chọn số công' }]}>
                                    <Input 
                                        type="number" 
                                        name="workNumber" 
                                        value={row.workNumber} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập số công"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={6} xs={12}>
                                <Form.Item name={`workContent[${index}]`} label="Nội dung công việc"  rules={[{ required: true, message: 'Vui lòng nhập nội dung công việc' }]}>
                                    <Input 
                                        name="workContent" 
                                        value={row.workContent} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập nội dung công việc"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={6} xs={12}>
                                <Form.Item name={`reason[${index}]`} label="Lý do cần xác nhận công" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
                                    <Input 
                                        name="reason" 
                                        value={row.reason} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập lý do"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={2} xs={12}>
                                <Button 
                                    type="danger" 
                                    onClick={() => handleRemoveRow(index)} 
                                    style={{ marginTop: '38px' }}
                                >
                                    Xóa
                                </Button>
                            </Col>
                        </Row>
                    ))}
                    <Button type="dashed" onClick={handleAddRowWork} style={{ marginBottom: '20px' }}>
                        Thêm hàng
                    </Button>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateWorkConfirmation;
