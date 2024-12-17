import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getExamUser } from '../../../apis/employees/exam';
import { Card, Row, Col, Spin } from 'antd';
import { Cards } from '../../../components/cards/frame/cards-frame';
import './AddQuestionView.css';

const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

const ResultExam = () => {
    const { id: examUserId } = useParams();
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const response = await getExamUser(examUserId);
                setExamData(response.data.data);
            } catch (error) {
                console.error("Error fetching exam data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExamData();
    }, [examUserId]);

    if (loading) {
        return (
            <Spin spinning={true}>
                <div style={{ minHeight: '200px' }}></div>
            </Spin>
        );
    }

    if (!examData) {
        return <p>Không có dữ liệu để hiển thị.</p>;
    }

    return (
        <Spin spinning={loading}>
            <Cards>
                <h2>
                    Kết quả bài thi: <span style={{ color: '#5F63F2', fontSize: '25px' }}>{examData.exam_name}</span>
                </h2>
                <p style={{ fontSize: '20px', fontWeight: 'bolder' }}>Tổng điểm: {examData.total_points}</p>
                {examData.questions.map((question, index) => (
                    <Cards key={index} className="question-card">
                        <h4 style={{ fontSize: '18px' }}>{`Câu hỏi ${index + 1}: ${question.question_name}`}</h4>
                        {question.question_type === 2 ? (
                            question.question_file != null ? (<iframe
                                src={`${LARAVEL_SERVER}/storage/${question.question_file}`}
                                style={{
                                    width: '100%',
                                    height: '500px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                }}
                                title={`PDF Question ${index + 1}`}
                            />) : 'File bị lỗi'
                            
                        ) : (
                            <Row gutter={16}>
                                {question.answers.map((answer, answerIndex) => {
                                    const isCorrect = answer.result === 1;
                                    const isSelected = examData.selected_answers.includes(answer.id);
                                    let bgColor = 'white';
                                    let textColor = 'black';
                                    if (isSelected) {
                                        bgColor = isCorrect ? 'green' : 'red';
                                        textColor = 'white';
                                    } else if (isCorrect) {
                                        bgColor = 'lightgreen';
                                    }

                                    return (
                                        <Col span={12} key={answer.id}>
                                            <div
                                                className="answer-option"
                                                style={{
                                                    backgroundColor: bgColor,
                                                    color: textColor,
                                                    padding: '10px',
                                                    borderRadius: '5px',
                                                    marginBottom: '10px',
                                                    boxShadow: '0px 0px 20px 0px #6C2C9126',
                                                }}
                                            >
                                                {`${String.fromCharCode(65 + answerIndex)}. ${answer.name}`}
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Cards>
                ))}
            </Cards>
        </Spin>
    );
};

export default ResultExam;
