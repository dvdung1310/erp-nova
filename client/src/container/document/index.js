import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Spin, Row, Col, Popover, Modal, message } from 'antd';
import { FaFileAlt, FaShareSquare } from 'react-icons/fa';
import { InstructionalDocument, deleteInstructionalDocument } from '../../apis/document/index';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { RiFolderUploadFill, RiDeleteBin5Line } from 'react-icons/ri';
import { MdDriveFileRenameOutline } from 'react-icons/md';
const index = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await InstructionalDocument();
      setDataSource(response.data.data || []);
      if (response.data.success) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);
  const option_file = (document) => {
    console.log('Document:', document); // Kiểm tra giá trị của document
    return (
      <div>
        <p style={{ marginBottom: '0' }}>
          <a href="#" onClick={() => handleDelete(document)}>
            <RiDeleteBin5Line /> Chuyển vào thùng rác
          </a>
        </p>
        <hr/>
        <p style={{ marginBottom: '0' }}>
          <NavLink  to={`/admin/tai-lieu/sua-tai-lieu/${document.id}`}>
            <MdDriveFileRenameOutline /> Đổi tên thư mục
          </NavLink>
        </p>
      </div>
    );
  };
  const handleDelete = (document) => {
    console.log('Document ID:', document.id); // Kiểm tra giá trị id
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa file này?',
      content: 'Fime tài liệu sẽ bị xóa vĩnh viễn',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await deleteInstructionalDocument(document.id);
          if (response.success) {
            message.success('Xóa file thành công!');
            fetchDocument(); // Lấy lại danh sách tài liệu sau khi xóa
          } else {
            message.error('Xóa file thất bại!');
          }
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa file!');
        }
      },
      onCancel: () => {
        console.log('Hủy bỏ xóa file');
      },
    });
  };
  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Danh sách tài liệu</h3>
        <NavLink to="/admin/tai-lieu/tao-tai-lieu" style={{ textDecoration: 'none' }}>
          <Button type="primary" style={{ marginBottom: 16 }}>
            Thêm tài liệu
          </Button>
        </NavLink>
      </div>
      <hr />
      <div>
        {loading ? (
          <div className="spin">
            <Spin />
          </div>
        ) : (
          <Row gutter={24} style={{ marginTop: '30px' }}>
            {dataSource.length > 0 ? (
              dataSource.map((document, index) => (
                <Col key={index} xxl={8} xl={12} lg={12} sm={12} xs={24}>
                  <div
                    style={{
                      background: 'rgb(240,244,249)',
                      padding: '20px',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    <NavLink
                      to={`/admin/tai-lieu/chi-tiet/${document.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }} // Optional styling
                    >
                      <FaFileAlt style={{ marginRight: '10px' }} />
                      <p style={{ marginBottom: '0', fontWeight: '500' }}>{document.doc_title}</p>
                    </NavLink>
                  </div>
                  <div style={{ position: 'absolute', top: '40%', right: '20px', transform: 'translateY(-50%)' }}>
                    <Popover placement="bottomRight" content={option_file(document)} trigger="click">
                      <a href="#">
                        <FaEllipsisVertical />
                      </a>
                    </Popover>
                  </div>
                </Col>
              ))
            ) : (
              <p>Chưa có tệp nào</p>
            )}
          </Row>
        )}
      </div>
      
    </div>
  );
};

export default index;
