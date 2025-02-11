import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Spin } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { ListUserExams, updateExamScore, deleteExamRecord }  from '../../../apis/employees/exam';

const ListUserExam = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [form] = Form.useForm();
    const [examName, setExamName] = useState('');
    const history = useHistory();
    const { id } = useParams(); 
    console.log('id',id);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await ListUserExams(id);
                setExamName(response.data.exam_name);
                setDataSource(response.data.exam_results);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải danh sách người thi!');
            }
        };

        fetchData();
    }, [id]);

    const handleEdit = (record) => {
        setCurrentRecord(record);
        form.setFieldsValue({
            score: record.score,
        });
        setIsEditModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteExamRecord(id);
            setDataSource(dataSource.filter((item) => item.id !== id));
            toast.success('Xóa thành công!');
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Xóa thất bại!');
        }
    };

    const handleUpdateScore = async (values) => {
        try {
            await updateExamScore(currentRecord.id, values.score);
            setDataSource(dataSource.map((item) => 
                item.id === currentRecord.id ? { ...item, score: values.score } : item
            ));
            toast.success('Cập nhật điểm thành công!');
            setIsEditModalVisible(false);
        } catch (error) {
            console.error('Error updating score:', error);
            toast.error('Cập nhật điểm thất bại!');
        }
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên người thi',
            dataIndex: 'user_name',
            key: 'user_name',
        },
        {
            title: 'Số điểm',
            dataIndex: 'total_points',
            key: 'total_points',
        },
        {
            title: 'Xem chi tiết',
            key: 'detail',
            render: (_, record) => (
                <a onClick={() => history.push(`/admin/nhan-su/ket-qua-bai-thi/${record.id}`)}>Xem chi tiết</a>
            ),
        },
        {
            title: 'Chức năng',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleEdit(record)}>
                        Sửa điểm
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="danger">Xóa</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <>
            <Spin spinning={loading}>
                <Cards>
                    <h3 style={{ marginBottom: '16px', fontSize:'27px'}}>Danh Sách Người Thi - <span style={{fontSize:'27px'}}>Tên đề thi: {examName || 'Đang tải...'}</span></h3>
                    <Table dataSource={dataSource} columns={columns} rowKey="id" />
                </Cards>
            </Spin>

            {/* Modal Sửa Điểm */}
            <Modal
                title="Sửa Điểm"
                visible={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleUpdateScore}>
                    <Form.Item
                        name="score"
                        label="Số điểm"
                        rules={[{ required: true, message: 'Vui lòng nhập số điểm!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <ToastContainer />
        </>
    );
};

export default ListUserExam;
