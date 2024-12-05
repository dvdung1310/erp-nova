import { Row, Col, Input, Card, Button, Form, Upload } from "antd"; 
import { useState } from "react";
import { toast } from "react-toastify";
import { useHistory } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';
import { storeWorkConfimation } from '../../../apis/employees/workconfimation';
import './WorkConfimation.css';

const CreateWorkConfirmation = () => {
    const [formData, setFormData] = useState([{ workDate: '', time: '', workNumber: '', workContent: '', reason: '', image: null }]);
    const history = useHistory();

    const handleAddRowWork = () => {
        setFormData([...formData, { workDate: '', time: '', workNumber: '', workContent: '', reason: '', image: null }]);
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

    const handleUploadChange = (index, { fileList }) => {
        const newFormData = [...formData];
        newFormData[index].image = fileList.length > 0 ? fileList[0].originFileObj : null;
        setFormData(newFormData);
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            formData.forEach((item, index) => {
            data.append(`confirmations[${index}][workDate]`, item.workDate);
            data.append(`confirmations[${index}][time]`, item.time);
            data.append(`confirmations[${index}][workNumber]`, item.workNumber);
            data.append(`confirmations[${index}][workContent]`, item.workContent);
            data.append(`confirmations[${index}][reason]`, item.reason);

            if (item.image) {
                data.append(`confirmations[${index}][image]`, item.image);
            }
            });
            console.log(data);
            const response = await storeWorkConfimation(data);
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
                            <Col md={3} xs={12}>
                                <Form.Item 
                                    name={`workDate[${index}]`} 
                                    label="Ngày" 
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                                >
                                    <Input 
                                        type="date" 
                                        name="workDate" 
                                        value={row.workDate} 
                                        onChange={(event) => handleChange(index, event)} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={3} xs={12}>
                                <Form.Item 
                                    name={`time[${index}]`} 
                                    label="Thời gian" 
                                    rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                                >
                                    <Input 
                                        name="time" 
                                        value={row.time} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập time"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={2} xs={12}>
                                <Form.Item 
                                    name={`workNumber[${index}]`} 
                                    label="Số công" 
                                    rules={[{ required: true, message: 'Vui lòng chọn số công' }]}
                                >
                                    <Input 
                                        type="number" 
                                        name="workNumber" 
                                        value={row.workNumber} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập số công"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={5} xs={12}>
                                <Form.Item 
                                    name={`workContent[${index}]`} 
                                    label="Nội dung công việc"  
                                    rules={[{ required: true, message: 'Vui lòng nhập nội dung công việc' }]}
                                >
                                    <Input 
                                        name="workContent" 
                                        value={row.workContent} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập nội dung công việc"
                                    />
                                </Form.Item>
                            </Col>
                            <Col md={6} xs={12}>
                                <Form.Item 
                                    name={`reason[${index}]`} 
                                    label="Lý do cần xác nhận công" 
                                    rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                                >
                                    <Input 
                                        name="reason" 
                                        value={row.reason} 
                                        onChange={(event) => handleChange(index, event)} 
                                        placeholder="Nhập lý do"
                                    />
                                </Form.Item>
                            </Col>

                            <Col md={3} xs={12}>
                                <Form.Item name={`image[${index}]`} label="Hình ảnh">
                                    <Upload
                                        name={`image[${index}]`}
                                        listType="picture"
                                        beforeUpload={() => false} 
                                        onChange={(info) => handleUploadChange(index, info)}
                                    >
                                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                    </Upload>
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
