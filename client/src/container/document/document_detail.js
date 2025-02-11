import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row, Spin, Button, Layout, Menu } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { detailInstructionalDocument } from '../../apis/document/index';
import './style.css';

const { Sider, Content } = Layout;

const DocumentDetail = () => {
  const { id } = useParams();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0); // Trang hiện tại

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await detailInstructionalDocument(id);
      setDataSource(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching document:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // Handle navigation to next page
  const handleNextPage = () => {
    if (selectedPageIndex < dataSource.length - 1) {
      setSelectedPageIndex(selectedPageIndex + 1);
    }
  };

  // Handle navigation to previous page
  const handlePreviousPage = () => {
    if (selectedPageIndex > 0) {
      setSelectedPageIndex(selectedPageIndex - 1);
    }
  };

  // Handle click on sidebar item to navigate to a page
  const handlePageClick = (index) => {
    setSelectedPageIndex(index);
  };

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
        <Layout className="document-layout">
          {/* Sidebar */}
          <Sider className="document-sider" width={250}>
            <Menu
              mode="inline"
              selectedKeys={[String(selectedPageIndex)]}
              onClick={(e) => handlePageClick(Number(e.key))}
            >
              {dataSource.map((document, index) => (
                <Menu.Item key={index}>{document.page_title}</Menu.Item>
              ))}
            </Menu>
          </Sider>

          {/* Content */}
          <Layout className="document-content">
            <Content style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
              <Col span={24} className="box_content_page">
                {dataSource.length > 0 && (
                  <div key={selectedPageIndex} style={{ marginBottom: '20px', background: '#fff', padding: '20px' }}>
                    <h1>{dataSource[selectedPageIndex]?.page_title}</h1>
                    <div
                      className="box_des_page"
                      dangerouslySetInnerHTML={{
                        __html: dataSource[selectedPageIndex]?.page_description,
                      }}
                    />
                    <div
                      dangerouslySetInnerHTML={{
                        __html: dataSource[selectedPageIndex]?.page_content,
                      }}
                      className="box_content"
                    />
                  </div>
                )}
              </Col>

              {/* Navigation Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '40px',
                }}
              >
                <Button
                  type="default"
                  icon={<LeftOutlined />}
                  onClick={handlePreviousPage}
                  disabled={selectedPageIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  type="default"
                  icon={<RightOutlined />}
                  onClick={handleNextPage}
                  disabled={selectedPageIndex === dataSource.length - 1}
                >
                  Next
                </Button>
              </div>
            </Content>
          </Layout>
        </Layout>
      )}
    </div>
  );
};

export default DocumentDetail;
