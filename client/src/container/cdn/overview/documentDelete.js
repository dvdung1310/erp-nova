import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink, useRouteMatch } from 'react-router-dom';
import { Row, Col, Popover, Button, Modal, Input, message, Progress, Spin, Form, Select, Checkbox } from 'antd'; // Import Modal và Input
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
import { TfiReload } from 'react-icons/tfi';
import { trashDocument, reStoreFile, removeFile } from '../../../apis/cdn/index';
const { Option, OptGroup } = Select;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { confirm } = Modal;
function All() {
  const { path } = useRouteMatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [fileModalShare, setFileModalShare] = useState(false);
  const [folderModalShare, setFolderModalShare] = useState(false);
  const [detailFileModel, setDetailFileModel] = useState(false);
  const [folders, setFolders] = useState([]);
  const [Files, setFile] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [canDownload, setCanDownload] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [form] = Form.useForm();
  const [allEmployee, setAllEmployee] = useState([]);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await trashDocument();
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
  }, []);
  const handleCancel = () => {
    setDetailFileModel(false);
    setFolderName(''); // Reset tên folder
  };
  const handleReStoreFile = async (file) => {
    confirm({
      title: 'Bạn có chắc chắn muốn khôi phục tệp này?',
      content: `Tệp: ${file.file_name}`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await reStoreFile(file.id);
          if (response.data.success) {
            message.success('Khôi phục thành công!');
            fetchDocument(); // Gọi lại hàm fetch để cập nhật danh sách tài liệu
          } else {
            message.error('Khôi phục thất bại!');
            setLoading(false);
          }
        } catch (error) {
          message.error('Khôi phục thất bại!');
          setLoading(false);
        }
      },
      onCancel: () => {
        message.info('Bạn đã hủy thao tác khôi phục.');
      },
    });
  };
  const handleRemoveFile = async (file) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa tệp này?',
      content: `Tệp: ${file.file_name}`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await removeFile(file.id);
          if (response.data.success) {
            message.success('Khôi phục thành công!');
            fetchDocument(); // Gọi lại hàm fetch để cập nhật danh sách tài liệu
          } else {
            message.error('Khôi phục thất bại!');
            setLoading(false);
          }
        } catch (error) {
          message.error('Khôi phục thất bại!');
          setLoading(false);
        }
      },
      onCancel: () => {
        message.info('Bạn đã hủy thao tác khôi phục.');
      },
    });
  };
  const handleFolderNavigation = (e, folder) => {
    // Kiểm tra trạng thái của thư mục
    if (folder.is_deleted) {
      e.preventDefault(); // Ngăn chặn điều hướng
  
      // Hiện thông báo yêu cầu khôi phục
      alert('Thư mục này đã bị xóa. Vui lòng khôi phục để xem nội dung.');
  
    }
  };

  // Nội dung Popover

  // Nội dung Popover
  const option_folder = (folder) => (
    <div>
      <p>
        <a href="#" onClick={() => handleReStoreFile(folder)}>
          <TfiReload /> Khôi phục
        </a>
      </p>
      <hr />
      <p>
        <a href="#" onClick={() => handleRemoveFile(folder)}>
          <RiDeleteBin5Line />
          Xóa vĩnh viễn
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
  const handleFileClick = (file) => {
    setFolderName(file);
    console.log(file);

    setDetailFileModel(true);
  };
  const renderFileContent = (file) => {
    if (!file || !file.file_name || !file.file_storage_path) {
      return <p>Không thể tải nội dung tệp.</p>;
    }

    const baseUrl = LARAVEL_SERVER; // URL của server Laravel
    const fullPath = `${baseUrl}${file.file_storage_path}`; // Đường dẫn đầy đủ tới file

    const fileExtension = file.file_name.includes('.') ? file.file_name.split('.').pop().toLowerCase() : '';

    if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
      // Hiển thị hình ảnh
      return <img src={fullPath} alt={file.file_name} style={{ width: '100%' }} />;
    }

    if (['pdf'].includes(fileExtension)) {
      // Hiển thị PDF
      return <iframe src={fullPath} title={file.file_name} style={{ width: '100%', height: '500px' }} />;
    }

    if (['doc', 'docx', 'xls', 'xlsx'].includes(fileExtension)) {
      // Hiển thị tệp Word/Excel qua Google Docs Viewer
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${fullPath}&embedded=true`}
          title={file.file_name}
          style={{ width: '100%', height: '500px' }}
        />
      );
    }

    if (['txt', 'csv'].includes(fileExtension)) {
      // Hiển thị tệp văn bản
      return <iframe src={fullPath} title={file.file_name} style={{ width: '100%', height: '500px' }} />;
    }

    if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls style={{ width: '100%' }}>
          <source src={fullPath} type={`video/${fileExtension}`} />
          <track
            src="/path/to/captions.vtt" // Path to your captions file (WebVTT format)
            kind="subtitles"
            srcLang="en"
            label="English"
          />
          Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      );
    }

    if (['mp3', 'wav'].includes(fileExtension)) {
      return (
        <audio controls style={{ width: '100%' }}>
          <source src={fullPath} type={`audio/${fileExtension}`} />
          <track
            src="/path/to/descriptions.vtt" // Path to your description file (WebVTT format)
            kind="descriptions"
            srcLang="en"
            label="English"
          />
          Trình duyệt của bạn không hỗ trợ phát âm thanh.
        </audio>
      );
    }

    // Định dạng không được hỗ trợ
    return <p>Không thể xem trước tệp này.</p>;
  };

  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '20px' }}>
      <div>
        <h4>Thư mục</h4>
      </div>
      {loading ? (
        <div className="spin">
          <Spin />
        </div>
      ) : (
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
                  <NavLink
                    to={`/admin/luu-tru/tai-lieu/${folder.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                    onClick={(e) => handleFolderNavigation(e, folder)} // Thêm hàm xử lý khi click
                  >
                    <FaFolder style={{ marginRight: '10px' }} />
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
      )}
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
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                  onClick={() => handleFileClick(file)}
                >
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
                  <Popover placement="bottomRight" content={option_folder(file)} trigger="click">
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
      <Modal visible={detailFileModel} title={folderName?.file_name} footer={null} onCancel={handleCancel} width={1000}>
        {renderFileContent(folderName)}
      </Modal>
    </div>
  );
}

export default All;
