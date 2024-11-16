import React, { useState } from 'react';
import { Form, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './style.css';

const DataImport = () => {
  const [file, setFile] = useState(null); // Lưu file được chọn

  const handleFileChange = ({ file }) => {
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (!isExcel) {
      message.error('Chỉ chấp nhận file Excel (.xls, .xlsx)!');
      setFile(null);
      return;
    }

    setFile(file); // Lưu file vào state
    message.success(`${file.name} đã được chọn thành công!`);
  };

  const handleImport = () => {
    if (!file) {
      message.error('Vui lòng chọn file trước khi import!');
      return;
    }

    // Thực hiện xử lý import file tại đây
    message.success(`File ${file.name} đã được import thành công!`);
  };

  return (
    <div style={{background:'#fff',padding:'30px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h3 style={{marginBottom:'0px'}}>Danh sách Data Import</h3>
        <div>
          <Form layout="vertical">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Item style={{width:'150px',height:'40px'}}>
                <Upload
                  name="file"
                  accept=".xls,.xlsx"
                  beforeUpload={() => false} // Ngăn upload tự động
                  showUploadList={false} // Không hiển thị danh sách file
                  onChange={handleFileChange}
                >
                  <Button icon={<UploadOutlined />}>Chọn File</Button>
                </Upload>
              </Form.Item>
              <Form.Item style={{height:'40px'}}>
                <Button type="primary" onClick={handleImport}>
                  Import File
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default DataImport;
