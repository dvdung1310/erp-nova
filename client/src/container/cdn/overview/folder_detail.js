import React, { useState, useEffect } from 'react';
import { Link,useNavigate,NavLink,useRouteMatch,useParams} from 'react-router-dom';
import { Row, Col, Popover, Button, Modal, Input, message, Progress, Spin } from 'antd'; // Import Modal và Input
import FeatherIcon from 'feather-icons-react';
import {
  FaFolderPlus,
  FaFileUpload,
  FaFolder,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileAudio,
  FaFileVideo,
  FaFileExcel,
  FaCloudDownloadAlt,
  FaShareSquare,
} from 'react-icons/fa';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { RiFolderUploadFill, RiDeleteBin5Line } from 'react-icons/ri';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import { allDocument, storeFolderChild, storeFolderFile, renameFolder, deleteFile,showFolder } from '../../../apis/cdn/index';

function All() {
  const { path } = useRouteMatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [folders, setFolders] = useState([]);
  const [Files, setFile] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { id } = useParams();
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await showFolder(id);
      setFolders(response.data.document_folder || []);
      setFile(response.data.document_file || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // Hiển thị modal
  const showModalCreateFolder = () => {
    setIsModalVisible(true);
  };
  const showModalRenameFolder = (folder) => {
    setSelectedFolder(folder);
    setFolderName(folder.file_name);
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsFileModalVisible(false);
    setFolderName(''); // Reset tên folder
  };

  // Xử lý khi nhấn OK
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      message.error('Tên thư mục không được để trống!');
      return;
    }

    try {
      setLoading(true);
      const response = await storeFolderChild({ file_name: folderName ,id});
      if (response.data.success === true) {
        message.success(`Tạo Folder thành công!`);
        setIsModalVisible(false);
        setFolderName('');
        fetchDocument();
      } else {
        message.error('Tạo Folder thất bại!');
      }
    } catch (error) {
      message.error('Tạo Folder thất bại!');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateFolder = async () => {
    if (!folderName.trim()) {
      message.error('Tên thư mục không được để trống!');
      return;
    }

    try {
      setLoading(true);
      const response = await renameFolder(folderName, selectedFolder.id);
      if (response.data.success) {
        message.success('Cập nhật tên thư mục thành công!');
        setIsModalVisible(false);
        setFolderName('');
        fetchDocument();
      } else {
        message.error('Cập nhật tên thư mục thất bại!');
      }
    } catch (error) {
      message.error('Cập nhật tên thư mục thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files) => {
    try {
        const fileArray = Array.from(files);
        const formData = new FormData();
        fileArray.forEach((file) => {
            formData.append('files[]', file); // Append files to FormData
        });

        // Create a config object to monitor the upload progress
        const config = {
            onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percent); // Update the progress state
            },
        };

        // Send file data to the backend API
        const response = await storeFolderFile(formData, config, id);

        if (response.data.success) {
            message.success('Tải tệp lên thành công!');
            setUploadProgress(0); // Reset progress after success
            fetchDocument();
        } else {
            message.error('Tải tệp lên thất bại!');
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        message.error('Tải tệp lên thất bại!');
        setUploadProgress(0); // Reset progress on error
    }
};
  const showRenameModal = (folder) => {
    setSelectedFolder(folder);
    setFolderName(folder.file_name);
    setIsModalVisible(true);
  };

  const showRenameFileModal = (file) => {
    setSelectedFolder(file);
    // Tách tên file và phần đuôi file, chỉ giữ phần tên
    const fileNameWithoutExtension = file.file_name.replace(/\.[^/.]+$/, '');
    // Cập nhật giá trị vào input mà không có đuôi file
    setFolderName(fileNameWithoutExtension);
    setIsFileModalVisible(true);
  };

  const handleUpdateFileName = async () => {
    try {
      // Đảm bảo chỉ đổi tên file mà không làm mất phần đuôi
      const fileExtension = selectedFolder.file_name.match(/\.[^/.]+$/); // Lấy phần đuôi file từ file gốc
      const newFileName = folderName + (fileExtension ? fileExtension[0] : ''); // Thêm đuôi nếu có

      // Gọi API để đổi tên file
      const response = await renameFolder(newFileName, selectedFolder.id);
      setLoading(true);
      if (response.data.success) {
        message.success('Cập nhật tên thư mục thành công!');
        setIsFileModalVisible(false);
        setFolderName('');
        fetchDocument(); // Tải lại danh sách tài liệu
      } else {
        message.error('Cập nhật tên thư mục thất bại!');
      }
    } catch (error) {
      message.error('Cập nhật tên thư mục thất bại!');
    }
    // Đóng modal sau khi lưu
  };
  const handleDeleteFile = (file) => {
    // Show the confirmation modal
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa file này?',
      content: 'File sẽ được di chuyển vào thùng rác và sẽ bị xóa sau 30 ngày.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Thực hiện xóa file khi người dùng xác nhận
          const response = await deleteFile(file.id);
          if (response.data.success) {
            message.success('Xóa file thành công!');
            setIsModalVisible(false); // Đóng modal sau khi xóa thành công
            fetchDocument(); // Lấy lại danh sách tài liệu sau khi xóa
          } else {
            message.error('Xóa file thất bại!');
          }
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa file!');
        }
      },
      onCancel: () => {
        // Logic nếu người dùng hủy bỏ
        console.log('Hủy bỏ xóa file');
      },
    });
  };

  // Nội dung Popover
  const content = (
    <div>
      <p onClick={showModalCreateFolder}>
        <a href="#">
          <FaFolderPlus /> Thêm mới thư mục
        </a>
      </p>
      <hr />
      <p onClick={() => document.getElementById('fileUploadInput').click()}>
        <a href="#">
          <FaFileUpload /> Tải tệp lên
        </a>
        <input
          id="fileUploadInput"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        {uploadProgress > 0 && (
          <div style={{ marginTop: '10px' }}>
            <Progress percent={uploadProgress} />
          </div>
        )}
      </p>
      <p>
        <a href="#">
          <RiFolderUploadFill /> Tải thư mục lên
        </a>
      </p>
    </div>
  );
  // Nội dung Popover
  const option_folder = (folder) => (
    <div>
      <p>
        <a href="#">
          <FaCloudDownloadAlt /> Tải xuống thư mục
        </a>
      </p>
      <hr />
      <p>
        <a href="#" onClick={() => showRenameModal(folder)}>
          <MdDriveFileRenameOutline /> Đổi tên thư mục
        </a>
      </p>
      <p>
        <a href="#">
          <FaShareSquare /> Chia sẻ thư mục
        </a>
      </p>
      <hr />
      <p>
        <a href="#">
          <RiDeleteBin5Line />
          Chuyển vào thùng rác
        </a>
      </p>
    </div>
  );

  const option_file = (file) => (
    <div>
      <p>
        <a href="#">
          <FaCloudDownloadAlt /> Tải xuống file
        </a>
      </p>
      <hr />
      <p>
        <a href="#" onClick={() => showRenameFileModal(file)}>
          <MdDriveFileRenameOutline /> Đổi tên file
        </a>
      </p>
      <p>
        <a href="#">
          <FaShareSquare /> Chia sẻ file
        </a>
      </p>
      <hr />
      <p>
        <a href="#" onClick={() => handleDeleteFile(file)}>
          <RiDeleteBin5Line /> Chuyển vào thùng rác
        </a>
      </p>
    </div>
  );

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FaFilePdf size={24} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage size={24} />;
      case 'mp4':
        return <FaFileVideo size={24} />;
      case 'mp3':
        return <FaFileAudio size={24} />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel size={24} />;
      default:
        return <FaFileAlt size={24} />;
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ margin: 0 }}>Gần đây</h3>
        <Popover placement="bottomRight" content={content} trigger="click">
          <Button size="small" type="primary">
            <FeatherIcon icon="plus" size={14} />
            Tùy chọn
          </Button>
        </Popover>
      </div>
      <hr />
      <div>
        <h4>Thư mục</h4>
      </div>
      {
        loading?<div className='spin'>
          <Spin/>
        </div>:
      <Row gutter={24} style={{ marginTop: '30px' }}>
    
        {folders.length > 0 ? (
          folders.map((folder, index) => (
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
              <NavLink to={`/admin/luu-tru/all/${folder.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display:'flex', alignItems:'center'}} // Optional styling
                >
                  <FaFolder style={{marginRight:'10px'}}/>
                  <p style={{ marginBottom: '0', fontWeight: '500' }}>{folder.file_name}</p>
              </NavLink>
                <div>
                  <Popover placement="bottomRight" content={option_folder(folder)} trigger="click">
                    <a href="#">
                      <FaEllipsisVertical />
                    </a>
                  </Popover>
                </div>
              </div>
            </Col>
          ))
        ) : (
          <p>Chưa có thư mục nào</p>
        )}
      </Row>
       }
      <div>
        <h4>Tệp</h4>
      </div>
      <Row gutter={24} style={{ marginTop: '30px' }}>
        {Files.length > 0 ? (
          Files.map((file, index) => (
            <Col key={index} xxl={8} xl={8} lg={8} sm={8} xs={12}>
              <div
                style={{
                  background: 'rgb(240,244,249)',
                  padding: '20px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  height: '150px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {getFileIcon(file.file_name)}
                  <p
                    style={{
                      marginBottom: '0',
                      fontWeight: '500',
                      marginTop: '10px',
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '120px',
                    }}
                    title={file.file_name}
                  >
                    {file.file_name}
                    <br />
                    {file.created_at}
                  </p>
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Popover placement="bottomRight" content={option_file(file)} trigger="click">
                    <a href="#">
                      <FaEllipsisVertical />
                    </a>
                  </Popover>
                </div>
              </div>
            </Col>
          ))
        ) : (
          <p>Chưa có tệp nào</p>
        )}
      </Row>

      <Modal
        title={selectedFolder ? 'Cập nhật tên thư mục' : 'Tạo thư mục mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={selectedFolder ? handleUpdateFolder : handleCreateFolder}
          >
            {selectedFolder ? 'Cập nhật' : 'Tạo'}
          </Button>,
        ]}
      >
        <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Nhập tên thư mục" />
      </Modal>
      <Modal
        title={'Cập nhật tên File'}
        visible={isFileModalVisible}
        onCancel={handleCancel}
        onOk={handleUpdateFileName} // Khi nhấn "OK", gọi hàm lưu
      >
        <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Nhập tên File" />
      </Modal>
    </div>
  );
}

export default All;
