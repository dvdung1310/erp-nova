import React, { useState, useEffect } from 'react';
import { Button, Progress, Typography, Modal, Row, Col, Spin } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import { Cards } from '../../../components/cards/frame/cards-frame';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useHistory } from 'react-router-dom';
import { listQuestionAnswer } from '../../../apis/employees/question';
import { storeExamUser } from '../../../apis/employees/exam';
import './AddQuestionView.css';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
const { Title } = Typography;

const StartExam = () => {
    const { id: examId } = useParams();
    const [examData, setExamData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isExamStarted, setIsExamStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const response = await listQuestionAnswer(examId);
                const data = response.data.data;
                setExamData(data);
                setTimeLeft(data.exam_time * 60);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching exam data:', error);
            }
        };
        fetchExamData();
    }, [examId]);

    useEffect(() => {
        if (!isExamStarted || timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [isExamStarted, timeLeft]);

    const startExam = () => setIsExamStarted(true);

    const handleAnswerSelect = (answerId) => {
        setAnswers((prevAnswers) => {
            const newAnswers = [...prevAnswers];
            newAnswers[currentQuestionIndex] = answerId;
            return newAnswers;
        });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < examData.questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const showConfirmSubmit = () => {
        setIsModalVisible(true);
    };

    const confirmSubmitExam = async () => {
        const formData = {
            exam_id: examId,
            list_question: examData.questions.map((question) => question.question_id),
            selected_answers: answers,
        };

        try {
            const response = await storeExamUser(formData);
            if (response.data.status === 'success') {
                setIsModalVisible(false);
                Modal.success({
                    title: 'Bài thi đã nộp',
                    content: 'Kết quả của bạn đã được ghi nhận.',
                });

                const employeeExamUserId = response.data.data.id;
                setTimeout(() => {
                    history.push(`/admin/nhan-su/ket-qua-bai-thi/${employeeExamUserId}`);
                }, 2000);
            } else {
                throw new Error('Lỗi khi nộp bài thi.');
            }
        } catch (error) {
            toast.error(error.message || 'Đã xảy ra lỗi khi nộp bài thi');
        }
    };

    const cancelSubmitExam = () => {
        setIsModalVisible(false);
    };

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!isExamStarted) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    textAlign: 'center',
                }}
            >
                <Title level={2}>{examData?.exam_name}</Title>
                <p style={{ fontSize: '18px' }}>
                    Thời gian làm bài: <b>{examData?.exam_time} phút</b>
                </p>
                <p style={{ fontSize: '18px' }}>
                    Số câu hỏi: <b>{examData?.questions.length}</b>
                </p>
                <Button type="primary" size="large" onClick={startExam} style={{ marginTop: '20px' }}>
                    Bắt đầu bài thi
                </Button>
            </div>
        );
    }

    const currentQuestion = examData.questions[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Cards>
            <div style={{ padding: '20px', position: 'relative', textAlign: 'center' }}>
                <div style={{ position: 'fixed', top: 70, right: 20 }}>
                    <Progress
                        type="circle"
                        percent={(timeLeft / (examData.exam_time * 60)) * 100}
                        format={() => `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
                        status={timeLeft <= 0 ? 'exception' : 'normal'}
                    />
                </div>
                <Title level={2}>Câu hỏi {currentQuestionIndex + 1}/{examData.questions.length}</Title>
                <Title level={4}>{currentQuestion.question_name}</Title>
    
                {currentQuestion.type === 2 ? (
                    <div style={{ margin: '20px 0', textAlign: 'center' }}>
                        {currentQuestion.file != null ? <iframe
                            src={`${LARAVEL_SERVER}/storage/${currentQuestion.file}`}
                            title="PDF Viewer"
                            width="100%"
                            height="900px"
                            style={{ border: '1px solid #ccc' }}
                        ></iframe> : 'File đang bị lỗi'}
                        
                    </div>
                ) : (
                    <div className="answer-container" style={{ margin: '20px 0' }}>
                        <Row gutter={[16, 16]}>
                            {currentQuestion.answers.map((answer, index) => (
                                <Col span={12} key={answer.answer_id}>
                                    <Button
                                        className="btn-answer"
                                        type={answers[currentQuestionIndex] === answer.answer_id ? 'primary' : 'default'}
                                        onClick={() => handleAnswerSelect(answer.answer_id)}
                                        style={{ width: '100%' }}
                                    >
                                        {`${String.fromCharCode(65 + index)}. ${answer.answer_name}`}
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
    
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={prevQuestion} disabled={currentQuestionIndex === 0}>Quay lại</Button>
                    <Button onClick={nextQuestion} disabled={currentQuestionIndex === examData.questions.length - 1}>Tiếp theo</Button>
                    <Button type="primary" danger onClick={showConfirmSubmit}>Nộp bài</Button>
                </div>
    
                <Modal
                    title="Xác nhận nộp bài"
                    visible={isModalVisible}
                    onOk={confirmSubmitExam}
                    onCancel={cancelSubmitExam}
                    okText="Nộp bài"
                    cancelText="Quay lại làm bài"
                >
                    <p>Bạn có chắc chắn muốn nộp bài không?</p>
                </Modal>
    
                <ToastContainer />
            </div>
        </Cards>
    );
};

export default StartExam;
