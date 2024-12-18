import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select } from 'antd';
import { OrderDetail, storeAgency, updateAgency } from '../../../apis/aaifood/index';
const order_detail = () => {
  const { order_id } = useParams(); 
  const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);

   const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await OrderDetail(order_id);
        console.log('====================================');
        console.log(response);
        console.log('====================================');
        setDataSource(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ListSource:', error);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchDocument();
    }, []);

    const columns = [
        { title: 'Sản phẩm', dataIndex: 'product_name', key: 'product_name' },
        { title: 'Số lượng', dataIndex: 'product_quantity', key: 'product_quantity' },
        { title: 'Giá bán', 
            dataIndex: 'product_output_price', 
            key: 'product_output_price',
            render: (text) => `${text.toLocaleString()}`, },
        { title: 'Hạn sử dụng', dataIndex: 'product_shelf_life', key: 'product_shelf_life' },
      ];
  return (
    <div>
        <Row gutter={15}>
        <Col xs={24}>
          <Cards title="Chi tiết phiếu thu">
            {loading ? (
              <div className="spin">
                <Spin />
              </div>
            ) : (
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                rowKey="order_id"
              />
            )}
          </Cards>
        </Col>
      </Row>
    </div>
  );
};

export default order_detail;
