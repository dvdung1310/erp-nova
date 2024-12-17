import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Input, Select ,Col , Upload} from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import { UploadOutlined } from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { useParams } from 'react-router-dom';
import AddQuestionView from './AddQuestionView';
import './AddQuestionView.css'
import { questionOrDocument, destroy, updateQuestionDocument , storeQuestionDocument} from '../../../apis/employees/question';
import TextEditor from "../../../components/TextEditor";
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { Option } = Select;

const DetailExam = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [questionsData, setQuestionsData] = useState([]);
    const [form] = Form.useForm();
    const [updateForm] = Form.useForm(); 
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const { id: examId } = useParams();
    const [examName, setExamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [isFileModalVisible, setIsFileModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [examData, setExamData] = useState({
        image: null,
    });
    

    const handleUploadChange = ({ fileList }) => {
        setExamData((prevData) => ({
            ...prevData,
            image: fileList.length > 0 ? fileList[0].originFileObj : null,
        }));
    };
    const fetchQuestions = async () => {
        try {
            const response = await questionOrDocument(examId);
            setExamName(response.data.data.exam_name);
            const question = response.data.data.questions.map((question) => ({
                key: question.question_id,
                id: question.question_id,
                question_name: question.question_name || 'Tên không hợp lệ',
                answers: question.answers,
                file: question.file || '',
            }));
            setQuestionsData(question);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const dataToSend = new FormData();
            dataToSend.append("name", values.question);
            dataToSend.append("exam_id", examId);
            if (examData.image) {
                dataToSend.append('image', examData.image);
            }
            console.log('dataToSend',dataToSend);
            const response = await storeQuestionDocument(dataToSend); 
            console.log('response',response);
            if (response.status === 201) {
                toast.success(response.data.message);
                form.resetFields();
                setIsModalVisible(false);
                fetchQuestions(); // Refresh danh sách câu hỏi
            } else {
                toast.error("Thêm tài liệu thất bại!");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            toast.error("Đã xảy ra lỗi khi thêm tài liệu.");
        } finally {
            setLoading(false);
        }
    };




    useEffect(() => {
        fetchQuestions();
    }, [examId]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const showFileModal = (file) => {
        setSelectedFile(file);  
        setIsFileModalVisible(true); 
    };

   

    const handleClose = () => {
        setIsModalVisible(false);
        fetchQuestions();
    };

    const handleFileModalClose = () => {
        setIsFileModalVisible(false);
    };

    const showUpdateModal = (question) => {
        setCurrentQuestion(question); 
        updateForm.setFieldsValue({
            question_name: question.question_name,
            image: null,
        });
        setIsUpdateModalVisible(true);
    };

    const handleUpdateSubmit = async (values) => {
        const dataToSend = new FormData();
        dataToSend.append("question_id", currentQuestion.id);
        dataToSend.append("name", values.question_name);
    
        if (values.image) {
            dataToSend.append("image", values.image);
        }
    
        console.log("FormData to send:", dataToSend);
        try {
            const response = await updateQuestionDocument(dataToSend);
            if (response.status === 200) {
                toast.success("Cập nhật thành công!");
                setIsUpdateModalVisible(false);
                fetchQuestions();
            } else {
                toast.error("Cập nhật thất bại!");
            }
        } catch (error) {
            console.error("Error updating question:", error);
            toast.error("Đã xảy ra lỗi khi cập nhật câu hỏi.");
        }
    };


    const handleDelete = (id) => {
        Modal.confirm({
            title: `Bạn có chắc chắn muốn xóa câu hỏi với ID ${id}?`,
            content: 'Hành động này không thể hoàn tác!',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await destroy(id);
                    setQuestionsData(questionsData.filter((question) => question.id !== id));
                    toast.success('Bạn đã xóa đề thi thành công');
                } catch (error) {
                    console.error('Error deleting exam:', error);
                    toast.error('Bạn đã xóa đề thi thất bại');
                }
            },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên tài liệu',
            dataIndex: 'question_name',
            key: 'question_name',
        },
        {
            title: 'Xem tài liệu',
            dataIndex: 'file',
            key: 'file',
            render: (file) => (
                <Button type="primary" onClick={() => showFileModal(file)}>
                    Xem tài liệu
                </Button>
            ),
        },
        {
            title: 'Chức năng',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="primary" style={{ marginRight: 8 }} onClick={() => showUpdateModal(record)}>Sửa</Button>
                    <Button type="danger" style={{ marginRight: 8 }} onClick={() => handleDelete(record.id)}>Xóa</Button>
                </>
            ),
        },
    ];

    if (result)
        return (
          <div className="App">
            <div
              className="editor"
              dangerouslySetInnerHTML={{ __html: result.text }}
            />
          </div>
        );

    return (
        <div>
            <Cards>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2>Danh sách câu hỏi <span style={{ color: '#5F63F2', fontSize: '25px' }}>{examName}</span></h2>
                    <Button type="primary" onClick={showModal}>
                        Thêm tài liệu
                    </Button>
                </div>
                <Table
                    dataSource={questionsData}
                    columns={columns}
                    rowKey={(record) => record.question_id}
                    pagination={false}
                />
                <Modal
                    title="Thêm tài liệu"
                    visible={isModalVisible}
                    onCancel={handleClose}
                    footer={null}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item label="Tên tài liệu" name="question" rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu!' }]}>
                            <Input placeholder="Nhập tên tài liệu" />
                        </Form.Item>

                        <Form.Item name="image">
                                        <Upload
                                            name="image"
                                            listType="picture"
                                            beforeUpload={() => false} 
                                            onChange={handleUploadChange} 
                                        >
                                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                                        </Upload>
                        </Form.Item>
                      
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Thêm tài liệu
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="Xem tài liệu"
                    visible={isFileModalVisible}
                    onCancel={handleFileModalClose}
                    footer={null}
                    width={800}
                >
                    <iframe
                        title="File preview"
                        src={`${process.env.REACT_APP_LARAVEL_SERVER}/storage/${selectedFile}`}
                        style={{ width: '100%', height: '500px' }}
                        frameBorder="0"
                    />
                </Modal>

                <Modal
    title="Sửa câu hỏi"
    visible={isUpdateModalVisible}
    onCancel={() => setIsUpdateModalVisible(false)}
    footer={null}
                >
    <Form form={updateForm} layout="vertical" onFinish={handleUpdateSubmit}>
        <Form.Item
            label="Tên câu hỏi"
            name="question_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên câu hỏi!' }]}
        >
            <Input placeholder="Nhập tên câu hỏi" />
        </Form.Item>

        <Form.Item label="Tải lên file mới (nếu cần)" name="image">
    <Upload
        listType="picture"
        maxCount={1}
        beforeUpload={() => false} // Ngăn upload tự động
        onChange={(info) => {
            const file = info.fileList[0]?.originFileObj || null;
            updateForm.setFieldsValue({ image: file });
        }}
    >
        <Button icon={<UploadOutlined />}>Chọn file</Button>
    </Upload>
</Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit">
                Lưu thay đổi
            </Button>
        </Form.Item>
    </Form>
</Modal>
            </Cards>
            <ToastContainer />
        </div>
    );
};

export default DetailExam;
