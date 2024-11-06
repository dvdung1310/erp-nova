import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Space, Tag, Upload , Form ,Badge , List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import Avatar from "../../components/Avatar/Avatar";
import {getAllUsers} from '../../apis/employees/employee';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

const dataSource = [
  {
    key: 1,
    title: 'Mua quà',
    description: '20-11',
    managers: ['Huy', 'Hùng', 'Nam'],
    file: 'file.pdf',
  },
  {
    key: 2,
    title: 'Tổ chức team-building',
    description: 'Tháng 12',
    managers: ['Lan', 'Minh', 'Tú'],
    file: 'teambuilding.docx',
  },
];

const ListPropose = () => {
  const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
  const [proposals, setProposals] = useState(dataSource);
  const [form] = Form.useForm();
  const [listUserData, setListUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    try {
        const users = await getAllUsers();
        setListUser(users?.data);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        console.error('Error fetching work confirmation details:', error);
    }
};

useEffect(() => {
    fetchData();
}, []);
  // Hiển thị modal thêm đề xuất
  const showModalAdd = () => {
    setIsModalVisibleAdd(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisibleAdd(false);
  };

  const handleSubmit = () => {
    setIsModalVisibleAdd(false);
  };

  // Xử lý chỉnh sửa đề xuất
  const handleEdit = (key) => {
    
  };

  // Xử lý xóa đề xuất
  const handleDelete = (key) => {
    setProposals(proposals.filter((proposal) => proposal.key !== key));
  };
  const [selectedMembers, setSelectedMembers] = useState([]);
  const handleSelectMember = (member) => {
    if (!selectedMembers.some((selected) => selected.email === member.email)) {
        setSelectedMembers([...selectedMembers, member]);
    }
};


const handleRemoveMember = (email) => {
    setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
};

const [searchTerm, setSearchTerm] = useState('');
const handleSearchChange = (e) => setSearchTerm(e.target.value);
const filteredMembers = listUserData?.filter(
    (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()),
);


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
      title: 'Danh sách người quản lý',
      dataIndex: 'managers',
      key: 'managers',
      render: (managers) => (
        <Space>
          {managers.map((manager, index) => (
            <Tag color="blue" key={index}>
              {manager}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      render: (file) => (
        <a href={`/path/to/files/${file}`} target="_blank" rel="noopener noreferrer">
          {file}
        </a>
      ),
    },
    {
      title: 'Chức năng',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.key)}>
            Sửa
          </Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
      <h2>Danh sách đề xuất</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModalAdd} style={{ marginBottom: '20px' }}>
        Thêm đề xuất
      </Button>
      </div>
      <Table dataSource={proposals} columns={columns} />

      {/* Modal to manage selected members đề xuát */}
            <Modal
                visible={isModalVisibleAdd}
                onCancel={handleCancel}
                centered
                title="Đơn xác nhận công"
                footer={null}
            >
                <Form form={form} layout="vertical">
                    {isModalVisibleAdd && (
                        <>
                            <div style={{marginBottom: '16px'}}>
                                <h6 style={{marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem'}}>Gửi đến</h6>
                                {selectedMembers.length > 0 && (
                                    <>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '20px',
                                            padding: '8px',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '4px',
                                            backgroundColor: '#f9f9f9',
                                        }}>
                                            {selectedMembers.map((member) => (
                                                <Badge key={member.email}
                                                       onClick={() => handleRemoveMember(member.email)}>
                        <span style={{
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#f0f0f0',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                          {member.name}
                            <FeatherIcon icon="x" size={16} color="red" style={{marginLeft: '8px'}}/>
                        </span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm thành viên"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{marginBottom: '16px'}}
                            />
                            <List
                                itemLayout="horizontal"
                                style={{height: '300px', overflowY: 'auto'}}
                                dataSource={filteredMembers}
                                renderItem={(member) => (
                                    <List.Item onClick={() => handleSelectMember(member)} style={{cursor: 'pointer'}}>
                                    <List.Item.Meta
                                        avatar={<Avatar width={40} height={40} name={member?.name}
                                                        imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}/>}
                                        title={member.name}
                                    />
                                </List.Item>
                                )}
                            />
                        </>
                    )}

                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '16px'}}>
                        <Button type="primary" onClick={handleSubmit} style={{minWidth: '300px'}}>
                            Gửi đề xuất
                        </Button>
                    </div>
                </Form>
            </Modal>
    </div>
  );
};

export default ListPropose;
