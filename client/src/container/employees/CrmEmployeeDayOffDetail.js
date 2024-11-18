import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, message } from 'antd';
import { format } from 'date-fns';
import userImage from '../../static/img/users/1.png';
import { getdayoffdetail, updatestatusdayoff } from '../../apis/employees/employee';

const CrmEmployeeDayOffDetail = () => {
  const { id } = useParams();
  const [dayOffDetail, setDayOffDetail] = useState(null);

  useEffect(() => {
    const fetchDayOffDetail = async () => {
      try {
        const { data } = await getdayoffdetail(id);
        setDayOffDetail(data);
      } catch (error) {
        console.error('Error fetching day off details:', error);
      }
    };

    fetchDayOffDetail();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const response = await updatestatusdayoff(id, status);
      if (response?.error) {
        message.error(response?.message);
        return;
      }
      setDayOffDetail(response?.data);
      message.success('Cập nhật thành công!');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  if (!dayOffDetail) return <p>Loading...</p>;

  return (
    <div style={{ background: '#fff', marginTop: '30px', padding: '50px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/logo1.jpg" alt="User" width={120} height={120} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2>ĐƠN XIN NGHỈ PHÉP</h2>
        </div>
        <div style={{ marginTop: '50px' }}>
          <h4>Tiêu đề: {dayOffDetail.off_title}</h4>
          <h4>
            Thời gian:
            {format(new Date(dayOffDetail.day_off_start), 'dd/MM/yyyy HH:mm')} -{' '}
            {format(new Date(dayOffDetail.day_off_end), 'dd/MM/yyyy HH:mm')}
          </h4>
          <h4>Nội dung: {dayOffDetail.off_content}</h4>
        </div>

        {/* Conditional rendering based on off_status */}
        {dayOffDetail.off_status === 0 && (
          <div style={{ display: 'flex', justifyContent: 'end', marginTop: '50px' }}>
            <Button
              type="primary" // Sử dụng màu chính của antd
              style={{
                marginRight: '10px',
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
              }} // Thiết lập màu nền
              onClick={() => handleStatusUpdate(1)}
            >
              Xác nhận đơn
            </Button>
            <Button
              type="default" // Sử dụng kiểu nút mặc định
              style={{ backgroundColor: '#ff4d4f', borderColor: '#fff' }} // Thiết lập màu nền
              onClick={() => handleStatusUpdate(2)}
            >
              Không xác nhận đơn
            </Button>
          </div>
        )}
        {dayOffDetail.off_status === 1 && (
          <Button
            type="primary" // Sử dụng màu chính của antd
            disabled
            style={{
              marginTop: '50px',
              display: 'block',
              marginLeft: 'auto',
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
            }} // Thiết lập màu nền
          >
            Đã Xác nhận đơn
          </Button>
        )}
        {dayOffDetail.off_status === 2 && (
          <Button
            type="default" // Sử dụng kiểu nút mặc định
            disabled
            style={{
              marginTop: '50px',
              display: 'block',
              marginLeft: 'auto',
              backgroundColor: '#ff4d4f',
              borderColor: '#fff',
            }} // Thiết lập màu nền
          >
            Đã xác nhận không duyệt đơn
          </Button>
        )}
      </div>
    </div>
  );
};

export default CrmEmployeeDayOffDetail;
