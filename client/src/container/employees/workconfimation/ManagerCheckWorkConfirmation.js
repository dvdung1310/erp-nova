import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Card, Button, Table, Typography, Spin  ,Modal , Tag } from 'antd';
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import { detailWorkConfimation  , updateDetailWorkConfimation , updateStatus , updateStatusDetail} from '../../../apis/employees/workconfimation';
import {getAllUsers} from '../../../apis/employees/employee';
const { Title, Text } = Typography;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import './WorkConfimation.css';

function getStatusTag(status) {
    const statusStr = String(status);
  switch (statusStr) {
    case '0':
      return <Tag color="gray" style={{ fontSize:'14px', padding:'6px 10px'}}>Đang chờ</Tag>;
    case '1':
      return <Tag color="green" style={{ fontSize:'14px', padding:'6px 10px'}}>Đã duyệt</Tag>;
    case '2':
      return <Tag color="red" style={{ fontSize:'14px', padding:'6px 10px'}}>Từ chối</Tag>;
    default:
      return null;
  }
}

const ManagerCheckWorkConfirmation = () => {
    const { id: workConfirmationId } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        employee_name: '',
        department_id: '',
        work_confirmation_details: [],
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [listUserData, setListUser] = useState([]);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
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

    const handleUpdateStatus = async (id , status) => {
                try {
                    const update_status = await updateStatus(id , status);
                    toast.success(update_status.message);
                    fetchData();
                } catch (error) {
                    toast.error('Lỗi');
                }
    };

    useEffect(() => {
        fetchData();
    }, [workConfirmationId]);

    const handleInputChange = (index, field, value) => {
        const updatedDetails = [...data.work_confirmation_details];
        updatedDetails[index][field] = value;
        setData({ ...data, work_confirmation_details: updatedDetails });
    };

    const handleModel = (index) => {
        const recordId = data.work_confirmation_details[index]?.id;
        console.log('recordId',recordId);
        setSelectedId(recordId); // Lưu id vào state
        setIsModalVisible(true); // Hiển thị modal
    };

    const handleModalAction = async (status) => {
        try {
            await updateStatusDetail(selectedId, status); // Gửi API với ID và trạng thái
            toast.success(`Cập nhật trạng thái thành công`);
            fetchData(); // Cập nhật lại danh sách
            setIsModalVisible(false); // Đóng modal
        } catch (error) {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

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
            width:110,
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
                />
            )
        },
        {
            title : 'Ảnh',
            dataIndex:'image',
            with:300,
            render: (_,record, index) => (
                <div style={{width:'50px'}}
                  onClick={() => {
                    setSelectedImage(`${LARAVEL_SERVER}/storage/${record.image}`);
                    setIsImageModalVisible(true);
                  }}
                >
                  Xem ảnh
                </div>
              ),
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status_detail',
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
            width: 300,
            key: 'action',
            render: (_, record, index) => {
                return(
                <>
                    <Button 
                        type="primary"
                        onClick={() => handleUpdateRow(index)}
                        style={{ marginRight: 8, marginBottom:'10px'}}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => handleModel(index)}
                        style={{ marginRight: 8 }}
                    >
                        Xác nhận
                    </Button>
                </>)
                    
            },
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
                <Text strong style={{ fontSize:'18px' }}>Kính gửi:</Text> <Text style={{ fontSize:'18px' , marginLeft:'15px' }}>Phòng Hành Chính Nhân Sự</Text>
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
                            <Text strong>Chức vụ: <span className='ms-2' style={{ fontSize:'18px' , marginLeft:'15px' }}>{data.level_name}</span></Text>
                        </Col>
                        {/* <Col span={16}>
                            <Text strong>Trạng thái: <span className='ms-2' style={{ fontSize:'18px' , marginLeft:'15px' }}>{getStatusTag(data.status)}</span></Text>
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
                    scroll={{x: 'max-content'}}
                    style={{borderRadius: "8px", overflow: "hidden"}}
                />

                <div style={{ marginTop: '10px', textAlign: 'end' , display:'none'}}>
                    <Button style={{marginRight:'15px'}} onClick={() => handleUpdateStatus(data.work_confirmation_id,1)} type="primary">Duyệt</Button>
                    <Button type="danger" onClick={() => handleUpdateStatus(data.work_confirmation_id,2)}>Không duyệt</Button>
                </div>
                <Modal title="Xác nhận" visible={isModalVisible} onCancel={() => setIsModalVisible(false)}  footer={null} >
                <div style={{ textAlign: 'right' }}>
                <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleModalAction(1)}  > Duyệt</Button>
                <Button type="danger" onClick={() => handleModalAction(0)}>Không duyệt</Button>
                </div>
                </Modal>

                <Modal title="Xem ảnh"  visible={isImageModalVisible} footer={null}  onCancel={() => setIsImageModalVisible(false)} >
                        <img src={selectedImage}  alt="Preview" style={{ width: '100%' }}  />
                </Modal>
            </Card>

            
            )}
        </div>
    );
};

export default ManagerCheckWorkConfirmation;
