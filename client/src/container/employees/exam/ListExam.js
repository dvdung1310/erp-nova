import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Select } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { ListExam, destroy, update } from '../../../apis/employees/exam';
import { UploadOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

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
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState(null);
    const history = useHistory();


    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await ListExam();
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
            } catch (error) {
                console.error('Error fetching exams:', error);
            }
        };

        fetchExams();
    }, []);

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
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
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
                    <Button type="success-ch" style={{ marginRight: 8 , background:'#36CF32',color:'#fff' }} onClick={() => history.push(`/admin/nhan-su/de-thi/${record.id}`)}>Câu hỏi</Button>
                    <Button type="lam-thu" onClick={() => history.push(`/admin/nhan-su/lam-bai-thi/${record.id}`)}>Làm thử</Button>
                </>
            ),
        },
    ];

    return (
        <>
            <Cards>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Danh Sách Kho Đề</h3>
            <Button   type="tao-de"  onClick={() => history.push(`/admin/nhan-su/tao-de/1`)}> Tạo đề </Button>
            </div>
            <Table  dataSource={dataSource} columns={columns} rowKey="id"/>
            <ToastContainer />
            </Cards>
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
                    <Form.Item name="time" label="Thời gian" rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}>
                        <Input type="text" />
                    </Form.Item>
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
