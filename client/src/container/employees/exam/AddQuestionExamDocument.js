import React, { useState, useEffect } from 'react'; 
import { Row, Col, Card, List, Button, Spin, message } from 'antd';
import { getAllQuestion , storeQuestionExamDocument } from '../../../apis/employees/question';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
const initialExam = [];

const App = () => {
  const [questions, setQuestions] = useState([]); 
  const [exam, setExam] = useState([]); // Lưu câu hỏi đã chọn
  const [loading, setLoading] = useState(false);
  const { id: examId } = useParams();
  const [nameExam, setNameExam] = useState('');
  // Hàm lấy câu hỏi từ API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllQuestion(examId); 
      const data = response.data;
      setNameExam(data.nameExam);
      const groupedQuestions = data.exams.reduce((acc, exam) => {
        if (exam.questions && exam.questions.length > 0) {
          const examCategory = exam.name;
          exam.questions.forEach((question) => {
            if (!acc[examCategory]) {
              acc[examCategory] = [];
            }
            acc[examCategory].push({
              id: question.id,
              content: question.name,
              category: examCategory,
            });
          });
        }
        return acc;
      }, {});

      // Tách câu hỏi đã tồn tại trong questionExamDocument
      const existingQuestions = data.questionExamDocument.map(q => q.question);
      setExam(existingQuestions);

      // Loại bỏ câu hỏi đã có khỏi danh sách câu hỏi
      const filteredQuestions = Object.keys(groupedQuestions).reduce((acc, category) => {
        acc[category] = groupedQuestions[category].filter(
          question => !existingQuestions.some(ex => ex.id === question.id)
        );
        return acc;
      }, {});

      setQuestions(filteredQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu câu hỏi:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);
  console.log('exam',exam);
  // Xử lý khi click câu hỏi từ 2 cột
  // Hàm để di chuyển câu hỏi giữa các cột
const handleQuestionClick = (question, fromColumn) => {
  if (fromColumn === 'questions') {
    // Di chuyển từ cột trái sang cột phải
    setQuestions((prevState) => {
      const updatedQuestions = { ...prevState };
      // Loại bỏ câu hỏi khỏi cột 'questions'
      for (const category in updatedQuestions) {
        if (Object.prototype.hasOwnProperty.call(updatedQuestions, category)) {
          updatedQuestions[category] = updatedQuestions[category].filter(q => q.id !== question.id);
        }
      }
      return updatedQuestions;
    });
    // Thêm câu hỏi vào cột 'exam'
    setExam((prevState) => [...prevState, question]);
  } else {
    // Di chuyển từ cột phải sang cột trái
    setExam((prevState) => prevState.filter(q => q.id !== question.id)); // Loại bỏ câu hỏi khỏi 'exam'
    
    // Thêm câu hỏi trở lại đúng category trong cột 'questions'
    setQuestions((prevState) => {
      const updatedQuestions = { ...prevState };
      if (!updatedQuestions[question.category]) {
        updatedQuestions[question.category] = []; // Khởi tạo category nếu chưa có
      }
      updatedQuestions[question.category].push(question);
      return updatedQuestions;
    });
  }
};

// Xử lý việc hiển thị dữ liệu khi chọn câu hỏi
const getItemContent = (item) => {
  if (item?.name) {
    return item.name; // Nếu có name thì hiển thị name
  } else if (item?.content) {
    return item.content; // Nếu không có name thì hiển thị content
  }
  return ''; // Trả về chuỗi rỗng nếu không có gì
};


  

  // Hàm để lưu đề thi mới
  const handleCreateExam = async () => {
    if (exam.length === 0) {
      message.error("Bạn chưa chọn câu hỏi nào để tạo đề thi!");
      return;
    }
    const selectedQuestionIds = exam.map(question => question.id);
    try {
      const response = await storeQuestionExamDocument(examId, selectedQuestionIds); 
      if (response.status === 200) {
        toast.success('Lưu đề thành công');
        fetchQuestions(); // Làm mới dữ liệu
      } else {
        toast.error('Lưu đề thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi lưu đề:', error);
      toast.error('Lưu đề thất bại');
    }
  };

  return (
    <Spin spinning={loading}>
      <Row gutter={16}>
      <Col xs={24} sm={12}>
                    <Card title="Danh sách câu hỏi">
              {Object.keys(questions)
                .sort((a, b) => {
                  // Kiểm tra nếu a là undefined thì sẽ đẩy nó lên đầu tiên
                  if (a === 'undefined') return -1;
                  if (b === 'undefined') return 1;
                  return 0;
                })
                .map((category) => {
                  const displayCategory = category === 'undefined' ? "Câu hỏi vừa bỏ" : category;
                  return (
                    <div key={displayCategory}>
                      <h3>{displayCategory}</h3>
                      <List
                        dataSource={questions[category]}
                        renderItem={(item) => (
                          <List.Item>
                            <Button
                              style={{ width: '100%' }}
                              onClick={() => handleQuestionClick(item, 'questions')}
                            >
                              {getItemContent(item)}
                            </Button>
                          </List.Item>
                        )}
                      />
                    </div>
                  );
                })}
            </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title={"Đề thi " + nameExam}>
            {exam.length > 0 && (
              <Button type="primary" onClick={handleCreateExam} style={{ marginBottom: '16px' }}>
                Tạo đề thi
              </Button>
            )}
            <List
              dataSource={exam}
              renderItem={(item) => (
                <List.Item>
                  <Button
                    style={{ width: '100%' }}
                    onClick={() => handleQuestionClick(item, 'exam')}
                  >
                    {item?.name ? item.name : item.content}
                  </Button>
                </List.Item>
              )}
            />
          </Card>
          <ToastContainer />
        </Col>
      </Row>
    </Spin>
  );
};

export default App;
