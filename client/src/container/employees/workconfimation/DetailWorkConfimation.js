import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Card, Button, Modal, Table, Typography, Spin, Form, Badge, List, Tag } from 'antd';
import Avatar from "../../../components/Avatar/Avatar";
import { toast } from "react-toastify";
import FeatherIcon from 'feather-icons-react';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import {
    detailWorkConfimation,
    deleteDetailWorkConfimation,
    storeWorkConfimationManager,
    updateDetailWorkConfimation
} from '../../../apis/employees/workconfimation';
import { getAllUsers } from '../../../apis/employees/employee';

const { Title, Text } = Typography;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import { checkRole, checkStatus } from '../../../utility/checkValue';
import './WorkConfimation.css';

const DetailWorkConfimation = () => {
    const { id: workConfirmationId } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        employee_name: '',
        department_id: '',
        work_confirmation_details: [],
    });
    const [listUserData, setListUser] = useState([]);
    const [showModalUpdateMembers, setShowModalUpdateMembers] = useState(false);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const handleCancel = () => {
        setShowModalUpdateMembers(false);
    };
    const opentModelDayOff = () => {
        setShowModalUpdateMembers(true);
    }

    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [selectedMembers, setSelectedMembers] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await detailWorkConfimation(workConfirmationId);
            setData(response);

            const [users] = await Promise.all([getAllUsers()]);
            setListUser(users?.data);

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


    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleSelectMember = (member) => {
        if (!selectedMembers.some((selected) => selected.email === member.email)) {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const handleRemoveMember = (email) => {
        setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
    };
    const handleInputChange = (index, field, value) => {
        const updatedDetails = [...data.work_confirmation_details];
        updatedDetails[index][field] = value;
        setData({ ...data, work_confirmation_details: updatedDetails });
    };

    const filteredMembers = listUserData?.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleSubmit = async () => {
        const members = selectedMembers.map((member) => member?.id);
        const formData = await form.validateFields();
        const data = {
            workConfirmationId: formData.workConfirmationId,
            list_members: members,
            pathname: '/admin/nhan-su/quan-ly-check-xac-nhan-cong'
        };
        const response = await storeWorkConfimationManager(data);
        handleCancel();
        toast.success(response.message);
    }

    const handleUpdateRow = async (index) => {
        const updatedDetail = data.work_confirmation_details[index];
        try {
            const response = await updateDetailWorkConfimation(updatedDetail);
            toast.success(response.message);
            fetchData();
        } catch (error) {
            toast.error('Cập nhật không thành công');
        }
    };

    function getStatusTag(status) {
        const statusStr = String(status);
        switch (statusStr) {
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

    const columns = [
        { title: 'STT', dataIndex: 'stt', width: 60, render: (_, __, index) => <Text>{index + 1}</Text> },
        {
            title: 'Ngày',
            dataIndex: 'work_date',
            width: 180,
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
            width: 180,
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
            width: 110,
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
            width: 300,
            render: (_, record, index) => (
                <Input.TextArea
                    style={{
                        maxHeight: '120px',
                        overflowY: 'auto',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                    }}
                    value={record.work_content}
                    onChange={(e) => handleInputChange(index, 'work_content', e.target.value)}
                />
            )
        },
        {
            title: 'Lý do xác nhận',
            dataIndex: 'reason',
            width: 300,
            render: (_, record, index) => (
                <Input.TextArea
                    style={{
                        maxHeight: '120px',
                        overflowY: 'auto',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                    }}
                    value={record.reason}
                    onChange={(e) => handleInputChange(index, 'reason', e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                />
            )
        },

        {
            title: 'Ảnh',
            dataIndex: 'image',
            with: 80,
            render: (text, record) => {
                const hasImage = record.image && record.image.trim() !== "";
                return hasImage ? (
                    <a
                        onClick={() => {
                            setSelectedImage(`${LARAVEL_SERVER}/storage/${record.image}`);
                            setIsImageModalVisible(true);
                        }}
                    >
                        Xem ảnh
                    </a>
                ) : (
                    <span style={{ color: '#999' }}>Không có ảnh</span>
                );
            }
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status_detail',
            width: 150,
            render: (_, record, index) => {
                if (record.status_detail === 1) {
                    return <Tag color="green">Đã duyệt</Tag>;
                }
                if (record.status_detail === 0) {
                    return <Tag color="red">Không duyệt</Tag>;
                }

                if (record.status_detail === null) {
                    return <Tag color="gray">Đang chờ</Tag>;
                }
            }
        },

        {
            title: 'Chức năng',
            width: 180,
            key: 'action',
            render: (_, record, index) => (
                <>
                    {
                        record.status_detail !== 0 && record.status_detail !== 1 && <>
                            <Button type="primary" onClick={() => handleUpdateRow(index)}
                                style={{ marginRight: 8 }}>Sửa</Button>
                            <Button type="danger"
                                onClick={() => handleDelete(data.work_confirmation_details[index].id)}>Xóa</Button>
                        </>
                    }
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            {
                loading ? <div className='spin'>
                    <Spin />
                </div> : (
                    <Card bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <img src="https://novaedu.vn/frontend/asset/images/logo_ver_new.png" alt="Logo"
                                style={{ maxWidth: '150px' }} />
                            <div className='text-center'>
                                <Title level={3}>Cộng hòa xã hội chủ nghĩa Việt Nam
                                </Title>
                                <Text>Độc lập - Tự do - Hạnh phúc</Text>
                            </div>
                        </div>
                        <Title level={3} style={{ textAlign: 'center', marginBottom: '5px' }}>Giấy xác nhận công</Title>
                        <Text strong style={{ fontSize: '18px' }}>Kính gửi:</Text> <Text
                            style={{ fontSize: '18px', marginLeft: '15px' }}>Phòng Hành Chính Nhân Sự</Text>
                        <div style={{ marginTop: '0px' }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Text strong>Tôi tên là: <span className='ms-2' style={{
                                        fontSize: '18px',
                                        marginLeft: '15px'
                                    }}>{data.employee_name}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Mã số nhân viên: <span className='ms-2' style={{
                                        fontSize: '18px',
                                        marginLeft: '15px'
                                    }}>{data.employee_id}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Bộ phận: <span className='ms-2' style={{
                                        fontSize: '18px',
                                        marginLeft: '15px'
                                    }}>{data.department_name}</span></Text>
                                </Col>
                                <Col span={16}>
                                    <Text strong>Chức vụ: <span className='ms-2' style={{
                                        fontSize: '18px',
                                        marginLeft: '15px'
                                    }}>{data.level_name}</span></Text>
                                </Col>

                                {/* <Col span={16}>
                                    <Text strong>Trạng thái: <span className='ms-2' style={{
                                        fontSize: '18px',
                                        marginLeft: '15px'
                                    }}>{getStatusTag(data.status)}</span></Text>
                                </Col> */}
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
                            scroll={{ x: 'max-content' }}
                            style={{ borderRadius: "8px", overflow: "hidden" }}
                        />


                        {data.status_detail !== 0 && data.status_detail !== 1 && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <Button type="primary" onClick={opentModelDayOff}>Gửi xác nhận</Button>
                            </div>
                        )}

                        {/* Modal to manage selected members */}
                        <Modal
                            visible={showModalUpdateMembers}
                            onCancel={handleCancel}
                            centered
                            title="Đơn xác nhận công"
                            footer={null}
                        >
                            <Form form={form} layout="vertical">
                                <Form.Item name="workConfirmationId" initialValue={workConfirmationId} hidden>
                                    <Input type="hidden" />
                                </Form.Item>
                                {showModalUpdateMembers && (
                                    <>
                                        <div style={{ marginBottom: '16px' }}>
                                            <h6 style={{
                                                marginBottom: '8px',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem'
                                            }}>Gửi đến</h6>
                                            {selectedMembers.length > 0 && (
                                                <>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '20px',
                                                        padding: '8px',
                                                        border: '1px solid #e8e8e8',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#f9f9f9',
                                                    }}>
                                                        {selectedMembers.map((member) => (
                                                            <Badge key={member.email}
                                                                onClick={() => handleRemoveMember(member.email)}>
                                                                <span style={{
                                                                    cursor: 'pointer',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    backgroundColor: '#f0f0f0',
                                                                    color: '#000',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    {member.name}
                                                                    <FeatherIcon icon="x" size={16} color="red" style={{ marginLeft: '8px' }} />
                                                                </span>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm thành viên"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            style={{ marginBottom: '16px' }}
                                        />
                                        <List
                                            itemLayout="horizontal"
                                            style={{ height: '300px', overflowY: 'auto' }}
                                            dataSource={filteredMembers}
                                            renderItem={(member) => (
                                                <List.Item onClick={() => handleSelectMember(member)}
                                                    style={{ cursor: 'pointer' }}>
                                                    <List.Item.Meta
                                                        avatar={<Avatar width={40} height={40} name={member?.name}
                                                            imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''} />}
                                                        title={member.name}
                                                        description={
                                                            <>
                                                                <small className="text-muted">{member?.email}</small>
                                                                <br />
                                                                <strong
                                                                    className="text-muted">{checkRole(member?.role_id)}</strong>
                                                            </>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                    <Button type="primary" onClick={handleSubmit} style={{ minWidth: '300px' }}>
                                        Gửi đơn
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                        <Modal
                            title="Xem ảnh"
                            visible={isImageModalVisible}
                            footer={null}
                            onCancel={() => setIsImageModalVisible(false)}
                        >
                            {selectedImage ? (
                                <img src={selectedImage} alt="ảnh" style={{ width: '100%' }} />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    Không có ảnh để hiển thị
                                </div>
                            )}
                        </Modal>
                    </Card>
                )}
        </div>
    );
};

export default DetailWorkConfimation;
