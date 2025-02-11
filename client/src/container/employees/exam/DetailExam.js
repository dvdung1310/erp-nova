import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Input, Select } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { useParams } from 'react-router-dom';
import AddQuestionView from './AddQuestionView';
import './AddQuestionView.css'
import { questionOrDocument, destroy, updateQuestion , questionName} from '../../../apis/employees/question';
import TextEditor from "../../../components/TextEditor";

const { Option } = Select;

const DetailExam = () => {
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

    const fetchQuestions = async () => {
        try {
            const response = await questionOrDocument(examId);
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

    const handleSubmitEditer = (e) => {
        async function postInfo() {
          setLoading(true);
          try {
            formData.text = text;
            console.log(formData);
            const response = await questionName(formData);
            console.log(response);
            const data = await response.json();
            console.log(data);
    
            setLoading(false);
    
            setResult(data);
          } catch (error) {
            setError(error);
          }
        }
    
        e.preventDefault();
        postInfo();
      };




    useEffect(() => {
        fetchQuestions();
    }, [examId]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleClose = () => {
        setIsModalVisible(false);
        fetchQuestions();
    };

    const showUpdateModal = (question) => {

        setCurrentQuestion(question);
        const correctAnswerIndex = question.answers.findIndex(answer => answer.result === 1);
        const correctAnswer = correctAnswerIndex !== -1 ? String.fromCharCode(65 + correctAnswerIndex) : null;

        const optionA = question.answers[0]?.answer_name;
        const optionB = question.answers[1]?.answer_name;
        const optionC = question.answers[2]?.answer_name;
        const optionD = question.answers[3]?.answer_name;

        form.setFieldsValue({
            question: question.question_name,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
        });
        setIsUpdateModalVisible(true);
    };

    const handleUpdate = async (values) => {
        try {
            const updatedQuestion = {
                question_id: currentQuestion.id,
                question_name: values.question,
                answers: [
                    { id: currentQuestion.answers[0].answer_id, answer_name: values.optionA, result: values.correctAnswer === 'A' ? 1 : 0 },
                    { id: currentQuestion.answers[1].answer_id, answer_name: values.optionB, result: values.correctAnswer === 'B' ? 1 : 0 },
                    { id: currentQuestion.answers[2].answer_id, answer_name: values.optionC, result: values.correctAnswer === 'C' ? 1 : 0 },
                    { id: currentQuestion.answers[3].answer_id, answer_name: values.optionD, result: values.correctAnswer === 'D' ? 1 : 0 },
                ],
            };
            await updateQuestion(updatedQuestion);
            toast.success('Cập nhật câu hỏi thành công');
            setIsUpdateModalVisible(false);
            fetchQuestions();
        } catch (error) {
            console.error('Error updating question:', error);
            toast.error('Cập nhật câu hỏi thất bại');
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
            title: 'Câu Hỏi',
            dataIndex: 'question_name',
            key: 'question_name',
        },
        {
            title: 'Câu Trả Lời',
            dataIndex: 'answers',
            key: 'answers',
            render: (answers) => (
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {answers.map((answer, index) => (
                        <li
                            key={answer.answer_id}
                            style={{
                                fontWeight: answer.result ? 'bold' : 'normal',
                                color: answer.result ? 'green' : 'inherit',
                                textDecoration: answer.result ? 'none' : 'line-through',
                            }}
                        >
                            {`Câu ${String.fromCharCode(65 + index)}: ${answer.answer_name}`}
                        </li>
                    ))}
                </ul>
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
                        Thêm Câu Hỏi
                    </Button>
                </div>

                {/* <form method="post" onSubmit={handleSubmitEditer}>
                    <h2>CKEditor with image</h2>
                    <TextEditor initData="Helllo" setData={setText} />
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </form> */}
                <Table
                    dataSource={questionsData}
                    columns={columns}
                    rowKey={(record) => record.question_id}
                    pagination={false}
                />
                <Modal
                    title="Thêm Câu Hỏi"
                    visible={isModalVisible}
                    onCancel={handleClose}
                    footer={null}
                >
                    <AddQuestionView examId={examId} onClose={handleClose} />
                </Modal>
                <Modal
                    title="Cập Nhật Câu Hỏi"
                    visible={isUpdateModalVisible}
                    onCancel={() => setIsUpdateModalVisible(false)}
                    footer={null}
                >
                    <Form form={form} layout="vertical" onFinish={handleUpdate}>
                        <Form.Item label="Tên Câu Hỏi" name="question" rules={[{ required: true, message: 'Vui lòng nhập tên câu hỏi!' }]}>
                            <Input placeholder="Nhập tên câu hỏi" />
                        </Form.Item>
                        <div className="options-container">
                            <Form.Item label="Câu A" name="optionA" rules={[{ required: true, message: 'Vui lòng nhập câu A!' }]}>
                                <Input placeholder="Nhập câu A" />
                            </Form.Item>
                            <Form.Item label="Câu B" name="optionB" rules={[{ required: true, message: 'Vui lòng nhập câu B!' }]}>
                                <Input placeholder="Nhập câu B" />
                            </Form.Item>
                        </div>
                        <div className="options-container">
                            <Form.Item label="Câu C" name="optionC" rules={[{ required: true, message: 'Vui lòng nhập câu C!' }]}>
                                <Input placeholder="Nhập câu C" />
                            </Form.Item>
                            <Form.Item label="Câu D" name="optionD" rules={[{ required: true, message: 'Vui lòng nhập câu D!' }]}>
                                <Input placeholder="Nhập câu D" />
                            </Form.Item>
                        </div>
                        <Form.Item label="Chọn Đáp Án Đúng" name="correctAnswer" rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}>
                            <Select placeholder="Chọn đáp án đúng">
                                <Option value="A">A</Option>
                                <Option value="B">B</Option>
                                <Option value="C">C</Option>
                                <Option value="D">D</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Cập Nhật Câu Hỏi
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
