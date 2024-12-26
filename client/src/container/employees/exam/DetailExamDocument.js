import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Input, Select } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { useParams , useHistory } from 'react-router-dom';
import AddQuestionView from './AddQuestionView';
import './AddQuestionView.css'
import { listQuestionAnswer, destroy, updateQuestion , questionName} from '../../../apis/employees/question';
import TextEditor from "../../../components/TextEditor";

const { Option } = Select;

const DetailExamDocument = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [questionsData, setQuestionsData] = useState([]);
    const [form] = Form.useForm();
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const { id: examId } = useParams();
    const [examName, setExamName] = useState('');
    const [formData, setformData] = useState({});
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const history = useHistory();
    const fetchQuestions = async () => {
        try {
            const response = await listQuestionAnswer(examId);
            setExamName(response.data.data.exam_name);
            const question = response.data.data.questions.map((question) => ({
                key: question.question_id,
                id: question.question_id,
                question_name: question.question_name || 'Tên không hợp lệ',
                answers: question.answers,
            }));
            setQuestionsData(question);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };
    useEffect(() => {
        fetchQuestions();
    }, [examId]);

    const showUpdateModal = () => {

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
            title: 'Câu Hỏi',
            dataIndex: 'question_name',
            key: 'question_name',
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
                    <Button type="primary" onClick={() => history.push(`/admin/nhan-su/them-tai-lieu-de-thi/${examId}`)}>Thêm Câu Hỏi 2</Button>
                </div>
                <Table
                    dataSource={questionsData}
                    columns={columns}
                    rowKey={(record) => record.question_id}
                    pagination={false}
                />
            </Cards>
            <ToastContainer />
        </div>
    );
};

export default DetailExamDocument;
