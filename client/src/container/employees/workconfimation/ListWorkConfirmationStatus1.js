import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Avatar, Button, Tag, Select } from 'antd';
import { useHistory } from 'react-router-dom';
import { listWorkConfimationStatus1 } from '../../../apis/employees/workconfimation';
import './WorkConfimation.css';

const { Option } = Select;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

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

function ListWorkConfirmationStatus() {
    const [data, setData] = useState([]); 
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [selectedStatus, setSelectedStatus] = useState(null);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await listWorkConfimationStatus1(); 
                if (response) {
                    setData(response); 
                    setFilteredData(response);
                } else {
                    console.error("Dữ liệu không hợp lệ:", response); 
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); 

    const handleStatusChange = (value) => {
      setSelectedStatus(value);
      if (!value) {
          console.log(22);
          setFilteredData(data); 
      } else {
          const filtered = data.filter((user) => String(user.status) === String(value));
          setFilteredData(filtered);
      }
  };

    return (
        <div style={{ padding: '20px' }} className='check-work-confirmation'>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Danh sách nhân sự xác nhận công của nhân sự <span style={{ color: '#5F63F2', fontSize: '25px' }}></span></h2>
                <Button type="primary" onClick={() => history.push(`/admin/nhan-su/danh-sach-xac-nhan-cong`)}>
                    Danh sách xác nhận công
                </Button>
            </div>
            <div style={{ marginBottom: 16 }}>
                <Select
                    allowClear
                    placeholder="Chọn trạng thái"
                    style={{ width: 200 }}
                    value={selectedStatus}
                    onChange={handleStatusChange}
                >
                    <Option value="0">Đang chờ</Option>
                    <Option value="1">Đã duyệt</Option>
                    <Option value="2">Từ chối</Option>
                </Select>
            </div>
            {loading ? <div className='spin'><Spin /></div> : (
                <Row gutter={[16, 16]}>
                    {filteredData.length > 0 ? (
                        filteredData.map((user) => (
                            <Col xs={24} sm={12} md={6} key={user.id}>
                                <div
                                    style={{
                                        boxShadow: 'box-shadow: rgba(146, 153, 184, 0.01) 0px 5px 20px',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        background: 'white',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                        <Avatar
                                            size={120}
                                            src={user?.avatar ? `${LARAVEL_SERVER}${user?.avatar}` : ''}
                                            alt={user.employee_name}
                                            description={user.employee_name}
                                        >
                                            {user.employee_name ? user.employee_name.split(" ").pop()[0] : 'U'}
                                        </Avatar>
                                    </div>
                                    <div style={{textAlign:'center', marginBottom: '10px'}}>
                                        <strong style={{fontSize:'22px'}}>{user.employee_name}</strong> 
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>Ngày tạo:</strong> <span style={{ fontSize:'18px' , marginLeft:'10px'}}>{new Date(user.created_at).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <strong>Trạng thái:</strong> <span style={{ fontSize:'18px' , marginLeft:'10px'}}>{getStatusTag(user.status)}</span>
                                    </div>
                                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                        <Button
                                            type="primary"
                                            onClick={() => history.push(`/admin/nhan-su/quan-ly-xem-xac-nhan-cong/${user.id}`)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        ))
                    ) : (
                        <div>Không có dữ liệu</div> 
                    )}
                </Row>
            )}
        </div>
    );
}

export default ListWorkConfirmationStatus;
