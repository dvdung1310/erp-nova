import React from 'react';
import { Row, Col } from 'antd';

const AuthLayout = (WraperContent) => {
  return function () {
    return (
      <Row style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f3f6',
      }}>
        <Col xxl={24} xl={24} lg={24} md={24} xs={24}>
          <WraperContent />
        </Col>
      </Row>
    );
  };
};

export default AuthLayout;
