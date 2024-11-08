import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Tag } from 'antd';
import { useParams } from 'react-router-dom';
import { DetailProposal as getDetailProposal } from '../../apis/proposal/proposal';
const { Title, Text } = Typography;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const DetailProposal = () => {
    const { id: proposalId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetailProposal = async () => {
            try {
                const response = await getDetailProposal(proposalId);
                setData(response);
            } catch (error) {
                console.error("Error fetching proposal details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetailProposal();
    }, [proposalId]);

    function getStatusTag(status) {
        switch (String(status)) {
            case '0':
                return <Tag color="gray" style={{ fontSize: '14px', padding: '6px 10px' }}>Chưa xác nhận</Tag>;
            case '1':
                return <Tag color="green" style={{ fontSize: '14px', padding: '6px 10px' }}>Đã duyệt</Tag>;
            case '2':
                return <Tag color="red" style={{ fontSize: '14px', padding: '6px 10px' }}>Không duyệt</Tag>;
            default:
                return null;
        }
    }

    const renderFile = () => {
        const fileUrl = `${LARAVEL_SERVER}/storage/${data.data.file}`;
        const fileExtension = data.data.file.split('.').pop().toLowerCase();
    
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return <img src={fileUrl} alt="Đính kèm" style={{ maxWidth: '100%', marginTop: '20px' }} />;
        }
    
        if (fileExtension === 'pdf') {
            return (
                <iframe
                    src={fileUrl}
                    title="PDF File"
                    style={{
                        width: '100%',
                        height: '600px',
                        border: '1px solid #ddd',
                        marginTop: '20px'
                    }}
                />
            );
        }
    
        return null;  // Return null instead of 0 for no file render
    };
    

    return (
        <div style={{ padding: '20px' }}>
            {loading ? (
                <div className="spin">
                    <Spin />
                </div>
            ) : (
                data && (
                    <Card bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <img src="https://novaedu.vn/frontend/asset/images/logo_ver_new.png" alt="Logo" style={{ maxWidth: '150px' }} />
                            <div className="text-center">
                                <Title level={3}>Cộng hòa xã hội chủ nghĩa Việt Nam</Title>
                                <Text>Độc lập - Tự do - Hạnh phúc</Text>
                            </div>
                        </div>
                        <Title level={3} style={{ textAlign: 'center', marginBottom: '0px' , paddingBottom:'5px' }}>Giấy Xác Nhận Đề xuất </Title>
                        <Title level={3} style={{ textAlign: 'center', marginBottom: '5px' , marginTop:'0' }}>{data.data.title}</Title>
                        <Text strong>Nội dung:</Text> <Text style={{fontSize:'20px'}}>{data.data.description}</Text><br></br>
                        <Text strong>Kính gửi:</Text> <Text>Ban Lãnh Đạo Công ty</Text>
                        <div style={{ marginTop: '10px' }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Text strong>Tôi tên là: <span className="ms-2" style={{ fontSize: '18px', marginLeft: '15px' }}>{data.employee.employee_name}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Mã số nhân viên: <span className="ms-2" style={{ fontSize: '18px', marginLeft: '15px' }}>{data.employee.employee_id}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Bộ phận: <span className="ms-2" style={{ fontSize: '18px', marginLeft: '15px' }}>{data.department_name}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Chức vụ: <span className="ms-2" style={{ fontSize: '18px', marginLeft: '15px' }}>{data.level_name}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Trạng thái: <span className="ms-2" style={{ fontSize: '18px', marginLeft: '15px' }}>{getStatusTag(data.data.status)}</span></Text>
                                </Col>
                            </Row>
                        </div>
                        {/* Hiển thị file ảnh hoặc PDF */}
                        {renderFile()}
                    </Card>
                )
            )}
        </div>
    );
};

export default DetailProposal;
