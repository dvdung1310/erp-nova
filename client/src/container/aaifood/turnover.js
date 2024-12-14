import React, { useEffect, useState, lazy, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { Tabs, Table, Spin, Button, Row, Col } from 'antd';
import { reportProfit } from '../../apis/aaifood/index';
import moment from 'moment';
const list_order_agency = () => {
  const [profitToday, setProfitToday] = useState(null);
  const [profitWeek, setProfitWeek] = useState(null);
  const [profitMonth, setProfitMonth] = useState(null);
  const [profitAll, setProfitAll] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await reportProfit();
      setProfitToday(response.profit_today);
      setProfitWeek(response.profit_this_week);
      setProfitMonth(response.profit_this_month);
      setProfitAll(response.profit_all);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '0' }}>Doanh thu</h3>
        <div style={{ display: 'flex', alignContent: 'center' }}>
          <NavLink
            to={`/admin/aaifood/phieu-chi`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Button type="primary">Phiếu chi</Button>
          </NavLink>
        </div>
      </div>
      <hr />
      <div>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col className="gutter-row" span={6}>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Hôm nay</h5>
              <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitToday)}
              </h4>
            </div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Tuần này</h5>
              <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitWeek)}
              </h4>
            </div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Tháng này</h5>
              <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitMonth)}
              </h4>
            </div>
          </Col>
          <Col className="gutter-row" span={6}>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <h5 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Tất cả</h5>
              <h4 style={{ fontSize: '2rem', color: '#4CAF50', fontWeight: 'bold' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profitAll)}
              </h4>
            </div>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default list_order_agency;
