import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Select ,Spin} from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { ListExam, destroy, update } from '../../../apis/employees/exam';
import { UploadOutlined } from '@ant-design/icons';
import { useHistory , useParams} from 'react-router-dom';

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { Option } = Select;

const ExamTable = () => {
    const [dataSource, setDataSource] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentExam, setCurrentExam] = useState({
        id: null,
        name: '',
        description: '',
        image: null,
        time: '',
        status: 1,
    });
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState(null);
    const history = useHistory();
    const { type } = useParams(); 
    console.log('type',type);
    useEffect(() => {
        const fetchExams = async () => {
            try {
                setLoading(true);
                const response = await ListExam(type);
                const exams = response.data.exams.map((exam) => ({
                    key: exam.id,
                    id: exam.id,
                    name: exam.name || 'Tên không hợp lệ',
                    image: `${LARAVEL_SERVER}/storage/${exam.image}`,
                    time: `${exam.time || 0} phút`,
                    description: exam.description || 'Không có nội dung',
                    status: exam.status === 1 ? 'Hoạt động' : 'Không hoạt động',
                }));
                setDataSource(exams);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching exams:', error);
               
            }
        };

        fetchExams();
    }, [type]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: `Bạn có chắc chắn muốn xóa đề thi với ID ${id}?`,
            content: 'Hành động này không thể hoàn tác!',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await destroy(id);
                    setDataSource(dataSource.filter((exam) => exam.id !== id));
                    toast.success('Bạn đã xóa đề thi thành công');
                } catch (error) {
                    console.error('Error deleting exam:', error);
                }
            },
        });
    };

    const handleUpdate = (exam) => {
        form.setFieldsValue({
            name: exam.name,
            description: exam.description,
            time: exam.time,
            status: exam.status === 'Hoạt động' ? 1 : 0,
        });
        setCurrentExam({ ...exam }); 
        setIsModalVisible(true); 
        setImageFile(null); 
    };

    const handleUploadChange = ({ fileList }) => {
        setImageFile(fileList.length > 0 ? fileList[0].originFileObj : null);
    };

    const onFinish = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('time', parseInt(values.time, 10));
        formData.append('status', values.status);
        if (imageFile) {
            formData.append('image', imageFile); 
        }
        try {
            const response = await update(formData, currentExam.id);
            setDataSource(dataSource.map((exam) => (
                exam.id === currentExam.id ? {
                    ...exam,
                    ...values,
                    image: imageFile ? URL.createObjectURL(imageFile) : exam.image,
                    status: values.status === 1 ? 'Hoạt động' : 'Không hoạt động'
                } : exam
            )));
            toast.success('Cập nhật đề thi thành công');
            setIsModalVisible(false);
            form.resetFields();
            setImageFile(null);
        } catch (error) {
            console.error('Error updating exam:', error);
            toast.error('Cập nhật đề thi thất bại.');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên đề thi',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => <img src={image} alt="Exam" width={80} />,
        },
        {
            title: 'Nội dung',
            dataIndex: 'description',
            key: 'description',
        },
        
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
        
        {
            title: 'Chức năng',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleUpdate(record)}>Sửa</Button>
                    <Button type="danger" style={{ marginRight: 8 }} onClick={() => handleDelete(record.id)}>Xóa</Button>
                    {parseInt(type, 10) === 1 ? (<Button type="success-ch" style={{ marginRight: 8 , background:'#36CF32',color:'#fff' }} onClick={() => history.push(`/admin/nhan-su/de-thi/${record.id}`)}>Câu hỏi</Button>):
                    parseInt(type, 10) === 3 || parseInt(type, 10) === 4 ? (<Button type="success-ch" style={{ marginRight: 8 , background:'#36CF32',color:'#fff' }} onClick={() => history.push(`/admin/nhan-su/them-tai-lieu-de-thi/${record.id}`)}>Câu hỏi</Button>)
                    :(<Button type="success-ch" style={{ marginRight: 8 , background:'#36CF32',color:'#fff' }} onClick={() => history.push(`/admin/nhan-su/tai-lieu/${record.id}`)}>Tài liệu</Button>)}

                    {parseInt(type, 10) === 3  || parseInt(type, 10) === 4  ? (<Button type="lam-thu" onClick={() => history.push(`/admin/nhan-su/lam-bai-thi/${record.id}`)}>Làm thử</Button>) : ''}
                </>
            ),
        },
    ];

    if (parseInt(type, 10) === 3 || parseInt(type, 10) === 4) {
        columns.splice(columns.findIndex(col => col.key === 'status'), 0, {
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
        });
    }

    if (parseInt(type, 10) === 3 || parseInt(type, 10) === 4) {
        columns.splice(columns.findIndex(col => col.key === 'TIME'), 0, {
            title: 'Lượt làm bài',
            dataIndex: 'time',
            key: 'time',
            render: (_, record) => (
                <a
                    href={`/admin/nhan-su/danh-sach-nguoi-thi/${record.id}`}
                    style={{ color: '#1890ff', textDecoration: 'underline' }}
                >
                    Xem lượt làm bài
                </a>
            ),
        })
    }

    

    return (
        <>
         <Spin spinning={loading}>
            <Cards>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                {
                    parseInt(type, 10) === 1 ? ( <h3 style={{ margin: 0 }}>Danh Sách Kho Đề</h3>) : 
                    parseInt(type, 10) === 2 ? (
                        <h3 style={{ margin: 0 }}>Danh Sách Kho Tài Liệu</h3>
                    ):
                    parseInt(type, 10) === 3 ? (
                        <h3 style={{ margin: 0 }}>Danh Sách Khóa Học</h3>
                    ):
                    parseInt(type, 10) === 4 ? (
                        <h3 style={{ margin: 0 }}>Danh Sách Đề thi</h3>
                    ): null
                }
           
            <Button   type="tao-de"  onClick={() => history.push(`/admin/nhan-su/tao-de/${type}`)}> Tạo đề </Button>
            </div>
            <Table  dataSource={dataSource} columns={columns} rowKey="id"/>
            <ToastContainer />
            </Cards>
            </Spin>
            <Modal
                title="Cập nhật đề thi"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={onFinish}>
                    <Form.Item name="name" label="Tên đề thi" rules={[{ required: true, message: 'Vui lòng nhập tên đề thi!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Nội dung">
                        <Input.TextArea />
                    </Form.Item>
                    {(parseInt(type, 10) === 3 || parseInt(type, 10) === 4) && (
                            <Form.Item name="time" label="Thời gian (phút)" rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}>
                            <Input />
                        </Form.Item>
                            )}
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                        <Select>
                            <Option value={1}>Hoạt động</Option>
                            <Option value={0}>Không hoạt động</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="image">
                        <Upload
                            name="image"
                            listType="picture"
                            beforeUpload={() => false}
                            onChange={handleUploadChange}
                        >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Cập nhật</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ExamTable;
