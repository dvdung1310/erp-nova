import React, { useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import { toast } from 'react-toastify';
import './AddQuestionView.css';
import { storeQuestion } from '../../../apis/employees/question';

const { Option } = Select;

const AddQuestionView = ({examId ,onClose}) => {
    const [form] = Form.useForm();
   
    const onFinish = async (values) => {
        try {
            const formData = new FormData();
            formData.append('exam_id', examId );
            formData.append('name', values.question);
            formData.append('answers[]', values.optionA);
            formData.append('answers[]', values.optionB);
            formData.append('answers[]', values.optionC);
            formData.append('answers[]', values.optionD);
            const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(values.correctAnswer);
            const resultArray = [0, 0, 0, 0];
            if (correctAnswerIndex !== -1) {
                resultArray[correctAnswerIndex] = 1;
            }
            formData.append('result[]', resultArray[0]);
            formData.append('result[]', resultArray[1]);
            formData.append('result[]', resultArray[2]);
            formData.append('result[]', resultArray[3]);

            const response = await storeQuestion(formData);
            if (!response.data.error) {
                toast.success(response.data.message);
                form.resetFields();
                onClose();
            } else {
                toast.error('Đã xảy ra lỗi!');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Tên Câu Hỏi" name="question" rules={[{ required: true, message: 'Vui lòng nhập tên câu hỏi!' }]}>
                <Input placeholder="Nhập tên câu hỏi" />
            </Form.Item>
            <div className="options-container">
                <Form.Item label="Câu A" name="optionA" rules={[{ required: true, message: 'Vui lòng nhập câu A!' }]}>
                    <Input placeholder="Nhập câu A" />
                </Form.Item>
                <Form.Item label="Câu B" name="optionB" rules={[{ required: true, message: 'Vui lòng nhập câu B!' }]}>
                    <Input placeholder="Nhập câu B" />
                </Form.Item>
            </div>
            <div className="options-container">
                <Form.Item label="Câu C" name="optionC" rules={[{ required: true, message: 'Vui lòng nhập câu C!' }]}>
                    <Input placeholder="Nhập câu C" />
                </Form.Item>
                <Form.Item label="Câu D" name="optionD" rules={[{ required: true, message: 'Vui lòng nhập câu D!' }]}>
                    <Input placeholder="Nhập câu D" />
                </Form.Item>
            </div>
            <Form.Item label="Chọn Đáp Án Đúng" name="correctAnswer" rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}>
                <Select placeholder="Chọn đáp án đúng">
                    <Option value="A">A</Option>
                    <Option value="B">B</Option>
                    <Option value="C">C</Option>
                    <Option value="D">D</Option>
                </Select>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Thêm Câu Hỏi
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AddQuestionView;
