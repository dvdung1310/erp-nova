import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink, useRouteMatch, useParams, useLocation } from 'react-router-dom';
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
import {
  allDocument,
  storeFolderChild,
  storeFolderFile,
  renameFolder,
  deleteFile,
  checkDownloadFile,
  showFileShare,
  shareFile,
  showFolderShare,
  shareFolder,
  showFolder,
} from '../../../apis/cdn/index';
const { Option, OptGroup } = Select;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
function folder_detail() {
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
    setFileModalShare(false);
    setFolderModalShare(false);
    setDetailFileModel(false);
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
      const response = await storeFolderChild({ file_name: folderName, id });
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
  const showModalShareFile = async (file) => {
    try {
      const response = await showFileShare(file.id);
      setFileModalShare(true);
      setFolderName(file.id);
      setAllEmployee(response.employee);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
    }
  };
  const handleShareFile = async () => {
    try {
      // Lấy dữ liệu từ form
      const formData = form.getFieldsValue();
      const id = folderName; // ID của file
      const { user_id, role } = formData; // user_id và role từ form
      // Gửi yêu cầu chia sẻ file
      const response = await shareFile(id, { user_id, role });
      console.log('Response:', response);
      if (response.success) {
        message.success('Chia sẻ file thành công!');
        setFileModalShare(false);
        setFolderName('');
      } else {
        message.error('Chia sẻ file thất bại!');
      }
    } catch (error) {
      message.error('Chia sẻ file thất bại!');
    }
  };
  const showModalShareFolder = async (folder) => {
    try {
      const response = await showFolderShare(folder.id);
      setFolderModalShare(true);
      setFolderName(folder.id);
      setAllEmployee(response.employee);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
    }
  };
  const handleShareFolder = async () => {
    try {
      // Lấy dữ liệu từ form
      const formData = form.getFieldsValue();
      const id = folderName; // ID của file
      const { user_id, role } = formData; // user_id và role từ form
      // Gửi yêu cầu chia sẻ file
      const response = await shareFolder(id, { user_id, role });
      console.log('Response:', response);
      if (response.success) {
        message.success('Chia sẻ file thành công!');
        setFolderModalShare(false);
        setFolderName('');
      } else {
        message.error('Chia sẻ file thất bại!');
      }
    } catch (error) {
      message.error('Chia sẻ file thất bại!');
    }
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

  const checkDownloadPermission = async (fileId) => {
    try {
      setLoading(true);
      const response = await checkDownloadFile(fileId); // Gọi API kiểm tra quyền tải
      if (response.data.can_download) {
        message.success('Tải file thành công!');
        // Tạo thẻ <a> và kích hoạt sự kiện tải về
        const a = document.createElement('a');
        a.href = response.data.file_url; // URL của file
        // Đảm bảo tên file có trong response
        a.download = response.data.file_name || 'file_download';
        // Thêm thẻ vào DOM để kích hoạt sự kiện tải về
        document.body.appendChild(a);
        // Kích hoạt sự kiện click để tải file
        a.click();
        // Loại bỏ thẻ <a> sau khi tải xong
        document.body.removeChild(a);
        setLoading(false);
      } else {
        message.error(response.data.message || 'Không có quyền tải file');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking download permission:', error);
      message.error('Tải file thất bại');
    }
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
      {/* <p>
        <a href="#">
          <RiFolderUploadFill /> Tải thư mục lên
        </a>
      </p> */}
    </div>
  );
  // Nội dung Popover
  const option_folder = (folder) => (
    <div>
      <p>
        <a href="#" onClick={() => showRenameModal(folder)}>
          <MdDriveFileRenameOutline /> Đổi tên thư mục
        </a>
      </p>
      <p>
        <a href="#" onClick={() => showModalShareFolder(folder)}>
          <FaShareSquare /> Chia sẻ thư mục
        </a>
      </p>
      <hr />
      <p>
        <a href="#" onClick={() => handleDeleteFile(folder)}>
          <RiDeleteBin5Line />
          Chuyển vào thùng rác
        </a>
      </p>
    </div>
  );

  const option_file = (file) => {
    const handleDownloadClick = async (e) => {
      e.preventDefault(); // Ngăn hành động mặc định
      await checkDownloadPermission(file.id); // Kiểm tra và tải file
    };

    return (
      <div>
        <p>
          <a href="#" onClick={handleDownloadClick}>
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
          <a href="#" onClick={() => showModalShareFile(file)}>
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
  };

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

  // const Breadcrumb = ({ folders }) => {
  //   const location = useLocation();

  //   // Log location object to check its structure
  //   console.log('Location Object:', location);

  //   const pathParts = location.pathname.split('/').filter(Boolean); // Split path into parts
  //   let currentPath = '';

  //   // Create breadcrumbs array
  //   const breadcrumbs = pathParts.map((part, index) => {
  //     currentPath += `/${part}`;

  //     // Match the part with the folder ID (last part should be a number, assuming it's the folder ID)
  //     const folder = folders.find((f) => f.id.toString() === part);

  //     return {
  //       name: folder ? folder.file_name : 'Thư mục gốc', // Fallback if folder not found
  //       path: currentPath,
  //     };
  //   });

  //   return (
  //     <div>
  //       {breadcrumbs.map((breadcrumb, index) => (
  //         <span key={index}>
  //           <a href={breadcrumb.path}>{breadcrumb.name}</a>
  //           {index < breadcrumbs.length - 1 && ' > '}
  //         </span>
  //       ))}
  //     </div>
  //   );
  // };
  return (
    <>
      {/* <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <Breadcrumb folders={folders} />
      </div> */}
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
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }} // Optional styling
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
        {/* -----------------------m---------model share file---------------------------------------- */}
        <Modal title={'Chia sẻ File'} visible={fileModalShare} onCancel={handleCancel} onOk={handleShareFile}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Thêm người chia sẻ"
              name="user_id"
              rules={[{ required: true, message: 'Vui lòng chọn người chia sẻ!' }]}
            >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Chọn người chia sẻ"
                showSearch
                optionFilterProp="label" // Dùng 'label' để lọc
              >
                {allEmployee.map((employee) => (
                  <Option key={employee.id} value={employee.id} label={employee.name}>
                    {employee.name} - {employee.level_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Quyền sử dụng"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn quyền sử dụng!' }]}
            >
              <Checkbox.Group style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Checkbox value="0">Chỉ xem</Checkbox>
                <Checkbox value="1">Chỉnh sửa</Checkbox>
                <Checkbox value="2">Tải xuống</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </Modal>

        {/* -----------------------m---------model share folder---------------------------------------- */}
        <Modal title={'Chia sẻ thư mục'} visible={folderModalShare} onCancel={handleCancel} onOk={handleShareFolder}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Thêm người chia sẻ"
              name="user_id"
              rules={[{ required: true, message: 'Vui lòng chọn người chia sẻ!' }]}
            >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Chọn người chia sẻ"
                showSearch
                optionFilterProp="label" // Dùng 'label' để lọc
              >
                {allEmployee.map((employee) => (
                  <Option key={employee.id} value={employee.id} label={employee.name}>
                    {employee.name} - {employee.level_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Quyền sử dụng"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn quyền sử dụng!' }]}
            >
              <Select placeholder="Vui lòng chọn quyền sử dụng">
                <Select.Option value="1">Chỉ xem</Select.Option>
                <Select.Option value="2">Chỉnh sửa</Select.Option>
                <Select.Option value="3">Tải xuống</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          visible={detailFileModel}
          title={folderName?.file_name}
          footer={null}
          onCancel={handleCancel}
          width={1000}
        >
          {renderFileContent(folderName)}
        </Modal>
      </div>
    </>
  );
}

export default folder_detail;
