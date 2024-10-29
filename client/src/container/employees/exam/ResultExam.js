import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getExamUser } from '../../../apis/employees/exam';
import { Card, Row, Col } from 'antd';
import { Cards } from '../../../components/cards/frame/cards-frame';
import './AddQuestionView.css';

const ResultExam = () => {
    const { id: examUserId } = useParams();
    const [examData, setExamData] = useState(null);

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const response = await getExamUser(examUserId);
                setExamData(response.data.data);
            } catch (error) {
                console.error("Error fetching exam data:", error);
            }
        };
        fetchExamData();
    }, [examUserId]);

    if (!examData) return <p>Đang tải dữ liệu...</p>;

    return (
        <Cards >
            <h2>Kết quả bài thi: <span style={{ color:'#5F63F2' , fontSize:'25px' }}>{examData.exam_name}</span></h2>
            <p style={{fontSize:'20px' , fontWeight:'bolder' }}>Tổng điểm: {examData.total_points}</p>
            {examData.questions.map((question, index) => (
                <Cards key={index} className="question-card">
                    <h4 style={{fontSize:'18px' }}>{`Câu hỏi ${index + 1}: ${question.question_name}`}</h4>
                    <Row gutter={16}>
                        {question.answers.map((answer , answerIndex) => {
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
                                            boxShadow:'0px 0px 20px 0px #6C2C9126',
                                        }}
                                    >
                                        {`${String.fromCharCode(65 + answerIndex)}. ${answer.name}`}
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </Cards>
            ))}
        </Cards>
    );
};

export default ResultExam;
