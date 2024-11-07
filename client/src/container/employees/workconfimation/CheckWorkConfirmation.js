import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Avatar, Button, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { listEmployee } from '../../../apis/employees/workconfimation';
import './WorkConfimation.css';
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

function CheckWorkConfirmation() {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await listEmployee(); 
        console.log(response);
        if (response) {
          setData(response); 
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

  return (

    <div style={{ padding: '20px' }} className='check-work-confirmation'>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <h2>Danh sách nhân sự xác nhận công <span style={{ color: '#5F63F2', fontSize: '25px' }}></span></h2>
                          <Button type="primary" onClick={() => history.push(`/admin/nhan-su/danh-sach-xac-nhan-cong`)}>
                              Danh sách xác nhận công
                          </Button>
      </div>
      {loading ? <div className='spin'>
                    <Spin/>
                </div> : (
        <Row gutter={[16, 16]}>
          {data.length > 0 ? (
            data.map((user) => (
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
                      onClick={() => history.push(`/admin/nhan-su/quan-ly-check-xac-nhan-cong/${user.id}`)}
                    >
                      Kiểm tra
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

export default CheckWorkConfirmation;
