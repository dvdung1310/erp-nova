import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Card, Button, Modal, Table, Typography, Spin } from 'antd';
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import { detailWorkConfimation , deleteDetailWorkConfimation } from '../../../apis/employees/workconfimation';
const { Title, Text } = Typography;

const DetailWorkConfimation = () => {
    const { id: workConfirmationId } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        employee_name: '',
        department_id: '',
        work_confirmation_details: [],
    });


    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await detailWorkConfimation(workConfirmationId);
            setData(response);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error fetching work confirmation details:', error);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: `Bạn có chắc chắn muốn xóa xác nhận công ?`,
            content: 'Hành động này không thể hoàn tác!',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const delete_detail = await deleteDetailWorkConfimation(id);
                    toast.success(delete_detail.message);
                    fetchData();
                } catch (error) {
                    toast.error('Bạn đã xóa đề thi thất bại');
                }
            },
        });
    };

    useEffect(() => {
        fetchData();
    }, [workConfirmationId]);

    // Hàm xử lý thay đổi input trong bảng chi tiết công việc
    const handleInputChange = (index, field, value) => {
        const updatedDetails = [...data.work_confirmation_details];
        updatedDetails[index][field] = value;
        setData({ ...data, work_confirmation_details: updatedDetails });
    };

    const columns = [
        { title: 'STT', dataIndex: 'stt',width:60, render: (_, __, index) => <Text>{index + 1}</Text> },
        {
            title: 'Ngày',
            dataIndex: 'work_date',
            width:180,
            render: (_, record, index) => (
                <Input
                    type="date"
                    value={record.work_date}
                    onChange={(e) => handleInputChange(index, 'work_date', e.target.value)}
                />
            )
        },
        {
            title: 'Thời gian',
            dataIndex: 'time',
            width:180,
            render: (_, record, index) => (
                <Input
                    value={record.time}
                    onChange={(e) => handleInputChange(index, 'time', e.target.value)}
                />
            )
        },
        {
            title: 'Số Công',
            dataIndex: 'work_number',
            width:100,
            render: (_, record, index) => (
                <Input
                    type="number"
                    value={record.work_number}
                    onChange={(e) => handleInputChange(index, 'work_number', e.target.value)}
                />
            )
        },
        {
            title: 'Nội dung Công việc',
            dataIndex: 'work_content',
            render: (_, record, index) => (
                <Input
                    value={record.work_content}
                    onChange={(e) => handleInputChange(index, 'work_content', e.target.value)}
                />
            )
        },
        {
            title: 'Lý do xác nhận',
            dataIndex: 'reason',
            render: (_, record, index) => (
                <Input
                    value={record.reason}
                    onChange={(e) => handleInputChange(index, 'reason', e.target.value)}
                />
            )
        },

        {
            title: 'Chức năng',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="primary" style={{ marginRight: 8 }}>Sửa</Button>
                    <Button type="danger" onClick={() => handleDelete(record.id)}>Xóa</Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            {
                loading ? <div className='spin'>
                    <Spin/>
                </div> : (
            <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <img src="https://novaedu.vn/frontend/asset/images/logo_ver_new.png" alt="Logo" style={{ maxWidth: '150px' }} />
                    <div className='text-center'>
                        <Title level={3}>Cộng hòa xã hội chủ nghĩa Việt Nam
                        </Title>
                        <Text>Độc lập - Tự do - Hạnh phúc</Text>
                    </div>
                </div>
                <Title level={3} style={{ textAlign: 'center', marginBottom: '5px' }}>Giấy xác nhận công</Title>
                <Text strong>Kính gửi:</Text> <Text>Phòng Hành Chính Nhân Sự</Text>
                <div style={{ marginTop: '0px' }}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Text strong>Tôi tên là:  <span className='ms-2' style={{ fontSize:'18px' , marginLeft:'15px' }}>{data.employee_name}</span></Text>
                        </Col>
                        <Col span={16}>
                            <Text strong>Mã số nhân viên:  <span className='ms-2' style={{ fontSize:'18px' , marginLeft:'15px' }}>{data.employee_id}</span></Text>
                        </Col>
                        <Col span={16}>
                            <Text strong>Bộ phận: <span className='ms-2' style={{ fontSize:'18px' , marginLeft:'15px' }}>{data.department_name}</span></Text>
                        </Col>
                        <Col span={16}>
                            <Text strong>Chức vụ: <span className='ms-2' style={{ fontSize:'18px' , marginLeft:'15px' }}>{data.role_name}</span></Text>
                        </Col>
                    </Row>
                </div>

                <div style={{ marginTop: '30px', marginBottom: '5px' }}>
                    <Text>Đề nghị cấp trên xác nhận giờ công làm việc cho tôi như sau:</Text>
                </div>

                <Table
                    columns={columns}
                    dataSource={data.work_confirmation_details}
                    pagination={false}
                    tableLayout="fixed"
                    rowKey={(record) => record.stt}
                />

                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Button type="primary" onClick={() => console.log('Submit data:', data)}>Gửi xác nhận</Button>
                </div>
            </Card>
            )}
        </div>
    );
};

export default DetailWorkConfimation;
