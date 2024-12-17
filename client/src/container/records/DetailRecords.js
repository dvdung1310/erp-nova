import React, {useEffect, useState} from 'react';
import {Row, Col, Card, Typography, Spin, Tag, Button} from 'antd';
import {useParams} from 'react-router-dom';
import {DetailProposal as getDetailProposal} from '../../apis/proposal/proposal';
import {getRecordById, updateRecordSenderConfirm, updateRecordUserConfirm} from "../../apis/work/records";
import {getItem} from "../../utility/localStorageControl";

const {Title, Text} = Typography;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const DetailRecords = () => {
    const {id} = useParams();
    const user_id = getItem('user_id');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        const fetchDetailProposal = async () => {
            try {
                setLoading(true)
                const response = await getRecordById(id);
                setData(response?.data);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching proposal details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetailProposal();
    }, [id]);

    function getStatusTag(status) {
        switch (String(status)) {
            case '0':
                return <Tag color="gray" style={{fontSize: '14px', padding: '6px 10px'}}>Chưa xác nhận</Tag>;
            case '1':
                return <Tag color="green" style={{fontSize: '14px', padding: '6px 10px'}}>Đã xác nhận</Tag>;
            default:
                return null;
        }
    }

    const handleUpdateRecordUserConfirm = async () => {
        try {
            setLoadingUpdate(true)
            await updateRecordUserConfirm(id);
            const response = await getRecordById(id);
            setData(response?.data);
            setLoadingUpdate(false)
        } catch (error) {
            setLoadingUpdate(false)
            console.error("Error updating record user confirm:", error);
        }
    }
    const handleUpdateRecordSenderConfirm = async () => {
        try {
            setLoadingUpdate(true)
            await updateRecordSenderConfirm(id);
            const response = await getRecordById(id);
            setData(response?.data);
            setLoadingUpdate(false)
        } catch (error) {
            setLoadingUpdate(false)
            console.error("Error updating record sender confirm:", error);
        }
    }

    const renderFile = () => {
        const fileUrl = `${LARAVEL_SERVER}/storage/${data?.record_file}`;
        const fileExtension = data?.record_file.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return <img src={fileUrl} alt="Đính kèm" style={{maxWidth: '100%', marginTop: '20px'}}/>;
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
        <div style={{padding: '20px'}}>
            {(loading || loadingUpdate) ? (
                <div className="spin">
                    <Spin/>
                </div>
            ) : (
                data && (
                    <Card bordered={false}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <img src="https://novaedu.vn/frontend/asset/images/logo_ver_new.png" alt="Logo"
                                 style={{maxWidth: '150px'}}/>
                            <div className="text-center"
                                 style={{flex: '1 1 100%', textAlign: 'center', marginTop: '10px'}}>
                                <Title level={3}>Cộng hòa xã hội chủ nghĩa Việt Nam</Title>
                                <Text>Độc lập - Tự do - Hạnh phúc</Text>
                            </div>
                        </div>
                        <Title level={3} style={{
                            textAlign: 'center',
                            marginBottom: '0px',
                            paddingBottom: '5px',
                            textTransform: 'uppercase'
                        }}>
                            Biên bản vi phạm
                        </Title>
                        <Title level={3} style={{
                            textAlign: 'center',
                            marginBottom: '5px',
                            marginTop: '0',
                            fontSize: '16px',
                            fontWeight: 'normal'
                        }}>
                            {`(Mức độ ${data?.record_level})`}
                        </Title>

                        <div style={{marginTop: '10px'}}>
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong style={{
                                            fontSize: '24px', flex: '1 1 100%', textAlign: 'center',
                                            display: 'block',
                                            width: '100%',
                                            marginBottom: '20px'
                                        }}>Thông tin nhân sự</Text>
                                    </Col>

                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong>Họ và tên: <span className="ms-2" style={{
                                            fontSize: '18px',
                                            marginLeft: '15px'
                                        }}>{data?.employee.employee_name}</span></Text>
                                    </Col>
                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong>Mã số nhân viên: <span className="ms-2" style={{
                                            fontSize: '18px',
                                            marginLeft: '15px'
                                        }}>{data?.employee.employee_id}</span></Text>
                                    </Col>
                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong>Bộ phận: <span className="ms-2" style={{
                                            fontSize: '18px',
                                            marginLeft: '15px'
                                        }}>{data?.employee?.department_name}</span></Text>
                                    </Col>
                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong>Chức vụ: <span className="ms-2" style={{
                                            fontSize: '18px',
                                            marginLeft: '15px'
                                        }}>{data?.employee?.level_name}</span></Text>
                                    </Col>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong style={{
                                            fontSize: '24px',
                                            flex: '1 1 100%',
                                            textAlign: 'center',
                                            display: 'block',
                                            width: '100%',
                                            marginBottom: '20px'
                                        }}>Thông tin biên bản</Text>
                                    </Col>
                                    <Col span={24} style={{margin: '10px 0'}}>
                                        <Text strong>Trạng thái nhân sự: <span className="ms-2" style={{
                                            fontSize: '18px',
                                            marginLeft: '15px'
                                        }}>
                        {getStatusTag(data?.record_user_confirm)}
                                            {(data?.record_user_confirm === 0 && data?.user_id === user_id) && (
                                                <Button type="primary" style={{marginLeft: '10px'}}
                                                        onClick={handleUpdateRecordUserConfirm}>Xác nhận</Button>
                                            )}
                    </span></Text>
                                    </Col>
                                    <Col span={24}>
                                        <Text strong>Trạng thái người lập biên bản: <span className="ms-2" style={{
                                            fontSize: '18px',
                                            marginLeft: '15px'
                                        }}>
                        {getStatusTag(data?.record_sender_confirm)}
                                            {(data?.record_sender_confirm === 0 && data?.record_sender_id === user_id) && (
                                                <Button type="primary" onClick={handleUpdateRecordSenderConfirm}
                                                        style={{marginLeft: '10px'}}>Xác nhận</Button>
                                            )}
                    </span></Text>
                                    </Col>
                                </Col>
                            </Row>
                            <Row gutter={24}>
            <span style={{
                fontSize: '24px',
                marginTop: '20px',
                marginBottom: '10px',
                display: 'block',
                width: '100%',
                textAlign: 'center'
            }}>
                Nội dung biên bản
            </span>
                            </Row>
                        </div>
                        {renderFile()}
                    </Card>
                )
            )}
        </div>
    );
};

export default DetailRecords;
