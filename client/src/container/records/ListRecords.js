import React, {useState, useEffect} from 'react';
import {
    Table,
    Button,
    Modal,
    Input,
    Space,
    Tag,
    List,
    Badge,
    Form,
    Row,
    Col,
    Tooltip,
    Spin,
    DatePicker,
    Select
} from 'antd';
import {PlusOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useHistory} from 'react-router-dom';
import {Cards} from '../../components/cards/frame/cards-frame';
import Avatar from "../../components/Avatar/Avatar";
import {getAllUsers} from '../../apis/employees/employee';
import {storeProposal, ListProposal, DeleteProposal, updateProposal} from '../../apis/proposal/proposal';
import "./proposal.css";
import {createRecord, deleteRecord, getRecordsByUserId} from "../../apis/work/records";
import {htmlToText} from 'html-to-text';

const dateFormat = 'MM/DD/YYYY';
import RichTextEditor from 'react-rte';
import moment from "moment";

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

const ListRecords = () => {
    const [isModalVisibleAdd, setIsModalVisibleAdd] = useState(false);
    const history = useHistory();
    const [state, setState] = useState({
        records: [],
        proposals: [],
        current: 1,
        pageSize: 10,
    });
    const [form] = Form.useForm();
    const [listUserData, setListUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [canCreate, setCanCreate] = useState(false);
    const [canDelete, setCanDelete] = useState(false);
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
            const records = await getRecordsByUserId();
            console.log(records);
            setState((prevState) => ({
                ...prevState,
                records: records?.data?.records || [],
            }));
            setCanDelete(records?.data?.canDeleteRecord);
            setCanCreate(records?.data?.canCreateRecord);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching work confirmations:', error);
            toast.error('Có lỗi xảy ra khi lấy dữ liệu');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
        fetchData();
    }, []);


    const {records} = state;
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
        setSelectedMembers(member)
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
            const values = await form.getFieldsValue();
            const user_id = selectedMembers?.id;
            const formData = new FormData();
            formData.append('record_date', values.record_date?.format('YYYY-MM-DD'));
            formData.append('record_level', values.record_level);
            formData.append('user_id', user_id);
            formData.append('file', selectedFile);
            const response = await createRecord(formData);

            toast.success(response.message);
            await fetchProposals();
            setIsModalVisibleAdd(false);
            form.resetFields();
            setSelectedMembers([]);
            setSelectedFile(null);
        } catch (error) {
            console.log(error)
            toast.error('Có lỗi báo đội IT');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: `Bạn có chắc chắn muốn xóa biên bản ?`,
            content: 'Hành động này không thể hoàn tác!',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = deleteRecord(id);
                    toast.success('Xóa dữ liệu thành công');
                    fetchProposals();
                } catch (error) {
                    toast.error('Lỗi xóa xác nhận công');
                }
            },
        });
    };


    function getStatusTag(status) {
        switch (String(status)) {
            case '0':
                return <Tag color="gray" style={{fontSize: '14px', padding: '6px 10px'}}>Chưa xác nhận</Tag>;
            case '1':
                return <Tag color="green" style={{fontSize: '14px', padding: '6px 10px'}}>Đã xác nhận</Tag>;
            default:
                return null;
        }
    }

    const dataSource = records?.map((record, index) => ({
        key: record.record_id,
        stt: index + 1,
        title: 'Biên bản vị phạm',
        record_date: moment(record.record_date).format('DD/MM/YYYY'),
        status: getStatusTag(record.record_status),
        sender: (
            <div>
                <Tooltip key={record?.record_sender.id} title={record?.record_sender.name}>
                    <img
                        src={record?.record_sender?.avatar ? `${LARAVEL_SERVER}${record?.record_sender.avatar}` : ''}
                        alt={record?.record_sender.name}
                        style={{width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px'}}
                    />
                </Tooltip>
            </div>
        ),
        user: (
            <div>
                <Tooltip key={record?.employee.id} title={record?.employee.name}>
                    <img
                        src={record?.employee?.avatar ? `${LARAVEL_SERVER}${record?.employee.avatar}` : ''}
                        alt={record?.employee.name}
                        style={{width: '40px', height: '40px', borderRadius: '50%', marginRight: '8px'}}
                    />
                </Tooltip>
            </div>
        ),
        record_file: record?.record_file,
    }));

    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            width: 60,
        },
        {
            title: 'Tên biên bản',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },

        {
            title: 'Ngày lập biên bản',
            dataIndex: 'record_date',
            key: 'record_date',
        },
        {
            title: 'Người lập biên bản',
            dataIndex: 'sender',
            key: 'sender',
        },
        {
            title: 'Nhân viên',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'File',
            dataIndex: 'record_file',
            key: 'record_file',
            render: (file) => {
                return (
                    <a href={`${LARAVEL_SERVER}/storage/${file}`} target="_blank" rel="noopener noreferrer">
                        Xem file
                    </a>
                )
            }
        },
        {
            title: 'Chức năng',
            key: 'action',
            render: (_, record) => {

                return (
                    <Space size="middle">
                        <Button type="primary" onClick={() => history.push(`/admin/bien-ban/chi-tiet/${record.key}`)}>Chi
                            tiết</Button>
                        {
                            record?.status?.props?.color === 'gray' && <>
                                {
                                    canDelete &&
                                    <Button icon={<DeleteOutlined/>} danger onClick={() => handleDelete(record.key)}>
                                        Xóa
                                    </Button>
                                }
                            </>
                        }
                    </Space>
                )
            }
        },
    ];

    return (
        <div style={{padding: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h2>Danh sách biên bản</h2>
                {
                    canCreate && <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={showModalAdd}
                        style={{marginBottom: '20px'}}
                    >
                        Thêm biên bản
                    </Button>
                }

            </div>
            <Spin spinning={loading}>
                <Row gutter={25} className='table-xacnhancong'>
                    <Col xs={24}>
                        <Cards headless>
                            <div className="table-responsive">
                                <Table pagination={false} dataSource={dataSource} columns={columns}/>
                            </div>
                        </Cards>
                    </Col>
                </Row>
            </Spin>

            {/* Modal to manage selected members đề xuất */}
            <Modal
                visible={isModalVisibleAdd}
                onCancel={handleCancel}
                centered
                className='modal-project'
                title="Tạo Biên bản"
                footer={null}
            >
                <Form form={form} layout="vertical" className='form-add'>
                    <Form.Item name="record_date" label="Ngày lập biên bản"
                               rules={[{required: true, message: 'Vui lòng nhập ngày lập biên bản!'}]}
                    >
                        <DatePicker placeholder="mm/dd/yyyy" format={dateFormat}/>
                    </Form.Item>

                    <Form.Item label="File đính kèm">
                        <input style={{border: 'none'}} type="file" onChange={handleFileUpload}/>
                    </Form.Item>
                    <Form.Item name="record_level" label="Mức độ"
                               rules={[{required: true, message: 'Vui lòng chọn mức độ biên bản!'}]}>
                        <Select
                            placeholder="Chọn mức độ biên bản"
                        >
                            <Select.Option value={1}>
                                Mức độ 1( trừ 1 điểm kpi)
                            </Select.Option>
                            <Select.Option value={2}>
                                Mức độ 2( trừ 2 điểm kpi)
                            </Select.Option>
                            <Select.Option value={3}>
                                Mức độ 3( trừ 3 điểm kpi)
                            </Select.Option>
                            <Select.Option value={4}>
                                Mức độ 4( trừ 4 điểm kpi)
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="leader" label="Gửi đến nhân viên">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm thành viên"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{marginBottom: '16px'}}
                        />
                        <List
                            itemLayout="horizontal"
                            style={{height: '200px', overflowY: 'auto'}}
                            dataSource={filteredMembers}
                            renderItem={(member) => (
                                <List.Item onClick={() => handleSelectMember(member)} style={{cursor: 'pointer'}}>
                                    <List.Item style={{
                                        borderBottom: 'none',
                                        padding: '4px 8px',
                                    }}>
                                        <input type="radio" value={member?.id}
                                               checked={member?.id === selectedMembers?.id}/>
                                    </List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar width={40} height={40} name={member?.name}
                                                        imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}/>}
                                        title={member.name}
                                        description={
                                            <>
                                                <small className="text-muted">{member.email} </small>
                                                <br/>
                                                <strong
                                                    className="text-muted">{member?.department_name} - {member?.level_name}</strong>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                    </Form.Item>

                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '16px'}}>
                        <Button type="primary" onClick={handleSubmit} style={{minWidth: '100px'}}>
                            Thêm
                        </Button>
                        <Button onClick={handleCancel} style={{marginLeft: '8px', minWidth: '100px'}}>
                            Hủy
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ListRecords;
