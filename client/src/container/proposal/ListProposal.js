import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Space, Tag, List, Badge, Form , Row, Col , Tooltip , Spin   } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useHistory } from 'react-router-dom';
import { Cards } from '../../components/cards/frame/cards-frame';
import Avatar from "../../components/Avatar/Avatar";
import { getAllUsers } from '../../apis/employees/employee';
import { storeProposal , ListProposal , DeleteProposal , updateProposal} from '../../apis/proposal/proposal';
import "./proposal.css";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

const ListPropose = () => {
  const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
  const history = useHistory();
  const [state, setState] = useState({
    proposals: [],
    current: 1,
    pageSize: 10,
  });
  const [form] = Form.useForm();
  const [listUserData, setListUser] = useState([]);
  const [isModalVisibleEdit, setIsModalVisibleEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [editForm] = Form.useForm();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      setListUser(users?.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await ListProposal();
      setState((prevState) => ({
        ...prevState,
        proposals: response || [],
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching work confirmations:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    fetchData();
  }, []);


  


  const { proposals } = state;
  const showModalAdd = () => {
    setIsModalVisibleAdd(true);
  };

  const handleCancel = () => {
    setIsModalVisibleAdd(false);
    form.resetFields();
    setSelectedMembers([]);
    setSelectedFile(null);
  };

  const handleSelectMember = (member) => {
    if (!selectedMembers.some((selected) => selected.email === member.email)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (email) => {
    setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredMembers = listUserData?.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const members = selectedMembers.map((member) => member?.id);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('file', selectedFile);
      formData.append('members', JSON.stringify(members));
      formData.append('pathname', '/admin/de-xuat/leader-xac-nhan-de-xuat')
      const response = await storeProposal(formData);
      toast.success(response.message);
      fetchProposals();
      setIsModalVisibleAdd(false);
      form.resetFields();
      setSelectedMembers([]);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Có lỗi báo đội IT');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa xác nhận công ?`,
      content: 'Hành động này không thể hoàn tác!',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
          try {
            const response = DeleteProposal(id);
            toast.success('Xóa dữ liệu thành công');
            fetchProposals();
          } catch (error) {
            toast.error('Lỗi xóa xác nhận công');
          }
      },
  });
  };

  const showModalEdit = (record) => {
    setEditingData(record); 
    editForm.setFieldsValue(record); 
    setIsModalVisibleEdit(true);
  };

  const handleSubmitEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const members = selectedMembers.map((member) => member?.id);
      const formData = new FormData();
      formData.append('key', values.key);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('file', selectedFile);
      formData.append('members', JSON.stringify(members));
      const response = await updateProposal(formData);
      toast.success('Cập nhật thành công');

      fetchProposals(); 
      setIsModalVisibleEdit(false);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsModalVisibleEdit(false);
    setEditingData(null);
    editForm.resetFields();
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="gray">Đang chờ</Tag>;
      case 1:
        return <Tag color="green">Đã duyệt</Tag>;
      case 2:
        return <Tag color="red">Từ chối</Tag>;
      default:
        return null;
    }
  };
 
  const dataSource = proposals?.map((confirmation, index) => ({
    key: confirmation.id,
    stt: index + 1,
    title : confirmation.title,
    description : confirmation.description,
    createdAt: new Date(confirmation.created_at).toLocaleDateString(),
    status: getStatusTag(confirmation.status),
    invitedAvatars: (
      <div>
      {confirmation.managers && confirmation.managers.map((manager) => (
        <Tooltip key={manager.id} title={manager.name}>
          <img
            src={manager?.avatar ? `${LARAVEL_SERVER}${manager.avatar}` : ''}
            alt={manager.name}
            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px' }}
          />
        </Tooltip>
      ))}
    </div>
    ),
    file: confirmation.file,
  }));

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      width: 60,
    },
    {
      title: 'Tên đề xuất',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Danh sách người quản lý',
      dataIndex: 'invitedAvatars',
      key: 'invitedAvatars',
      
    },
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      render: (file) => (
        <a href={`${LARAVEL_SERVER}/storage/${file}`} target="_blank" rel="noopener noreferrer">
          Xem file
        </a>
      ),
    },
    {
      title: 'Chức năng',
      key: 'action',
      render: (_, record) => {
        console.log(record);
        
        return (
          <Space size="middle">
           <Button type="primary" onClick={() => history.push(`/admin/de-xuat/chi-tiet/${record.key}`)}>Chi tiết</Button>
            {
              record.status.props.color === 'gray' &&  <>
              <Button icon={<EditOutlined />} onClick={() => showModalEdit(record)}>Sửa</Button>
              <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)}>
              Xóa
            </Button>
            </>
            }
          </Space>
        )
      } 
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Danh sách đề xuất</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModalAdd}
          style={{ marginBottom: '20px' }}
        >
          Thêm đề xuất
        </Button>
      </div>
      <Spin spinning={loading}>
      <Row gutter={25} className='table-xacnhancong'>
      <Col xs={24}>
        <Cards headless>
            <div className="table-responsive">
              <Table pagination={false} dataSource={dataSource} columns={columns} />
            </div>
        </Cards>
      </Col>
    </Row>
    </Spin>

    <Button type="primary" onClick={() => history.push(`/admin/de-xuat/kiem-tra-danh-sach`)}>
        Kiểm tra đề xuất của nhân viên
    </Button>

      {/* Modal to manage selected members đề xuất */}
      <Modal
        visible={isModalVisibleAdd}
        onCancel={handleCancel}
        centered
        title="Tạo đề xuất"
        footer={null}
      >
        <Form form={form} layout="vertical" className='form-add'>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item label="File đính kèm">
            <input style={{border:'none'}} type="file" onChange={handleFileUpload} />
          </Form.Item>

          <div style={{ marginBottom: '16px' }}>
            <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Gửi đến (có thể gửi cho nhiều Leader)</h6>
            {selectedMembers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                {selectedMembers.map((member) => (
                  <Badge key={member.email} onClick={() => handleRemoveMember(member.email)}>
                    <span style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f0f0f0', color: '#000', display: 'flex', alignItems: 'center' }}>
                      {member.name}
                      <FeatherIcon icon="x" size={16} color="red" style={{ marginLeft: '8px' }} />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Input
            type="text"
            placeholder="Tìm kiếm thành viên"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginBottom: '16px' }}
          />
          <List
            itemLayout="horizontal"
            style={{ height: '300px', overflowY: 'auto' }}
            dataSource={filteredMembers}
            renderItem={(member) => (
              <List.Item onClick={() => handleSelectMember(member)} style={{ cursor: 'pointer' }}>
                <List.Item.Meta
                  avatar={<Avatar width={40} height={40} name={member?.name} imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''} />}
                  title={member.name}
                />
              </List.Item>
            )}
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <Button type="primary" onClick={handleSubmit} style={{ minWidth: '100px' }}>
              Thêm
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: '8px', minWidth: '100px' }}>
              Hủy
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal sửa đề xuất */}
      <Modal visible={isModalVisibleEdit} onCancel={handleCancelEdit} title="Sửa đề xuất" footer={null}>
        <Form form={editForm} layout="vertical" onFinish={handleSubmitEdit}>
        <Form.Item style={{display:'none'}} name="key" rules={[{ required: true }]}>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          
          <Form.Item label="File đính kèm">
            <input style={{border:'none'}} type="file" onChange={handleFileUpload} />
          </Form.Item>

          <div style={{ marginBottom: '16px' }}>
            <h6 style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Gửi đến (có thể gửi cho nhiều Leader)</h6>
            {selectedMembers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '8px', border: '1px solid #e8e8e8', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                {selectedMembers.map((member) => (
                  <Badge key={member.email} onClick={() => handleRemoveMember(member.email)}>
                    <span style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f0f0f0', color: '#000', display: 'flex', alignItems: 'center' }}>
                      {member.name}
                      <FeatherIcon icon="x" size={16} color="red" style={{ marginLeft: '8px' }} />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Input
            type="text"
            placeholder="Tìm kiếm thành viên"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginBottom: '16px' }}
          />
          <List
            itemLayout="horizontal"
            style={{ height: '300px', overflowY: 'auto' }}
            dataSource={filteredMembers}
            renderItem={(member) => (
              <List.Item onClick={() => handleSelectMember(member)} style={{ cursor: 'pointer' }}>
                <List.Item.Meta
                  avatar={<Avatar width={40} height={40} name={member?.name} imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''} />}
                  title={member.name}
                />
              </List.Item>
            )}
          />

          <Button style={{marginTop:'15px'}} type="primary" onClick={() => editForm.submit()}>
            Cập nhật
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ListPropose;
