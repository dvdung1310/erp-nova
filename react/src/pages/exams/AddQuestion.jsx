import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreQuestion } from '../../services/QuestionServices';
import '../../assets/css/exam.css';

const AddQuestion = ({ examId }) => {
  const [questionName, setQuestionName] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']); // Mảng câu trả lời
  const [correctAnswer, setCorrectAnswer] = useState(null); // Đáp án đúng

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Tạo mảng result dựa trên đáp án đúng
      const result = answers.map((_, index) => (index === correctAnswer ? 1 : 0));
        
      const response = await StoreQuestion({
        exam_id: 16,
        name: questionName,
        answers,
        result
      });
      console.log(response);
      if(!response.error){
        toast.success(response.message);
      }else{
        toast.warning(response.message);
      }
    } catch (error) {
        toast.warning(error);
    }
  };

  return (
    <div className="question-form-container">
      <h2>Thêm Câu Hỏi</h2>
      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label>Tên câu hỏi:</label>
          <input
            type="text"
            value={questionName}
            onChange={(e) => setQuestionName(e.target.value)}
            
          />
        </div>

        <div className="form-group">
          <label>Các câu trả lời:</label>
          {answers.map((answer, index) => (
            <div key={index} className="answer-input">
              <input
                type="text"
                value={answer}
                onChange={(e) =>
                  setAnswers(answers.map((a, i) => (i === index ? e.target.value : a)))
                }
                placeholder={`Câu trả lời ${String.fromCharCode(65 + index)}`} // A, B, C, D
                
              />
              <label>
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  onChange={() => setCorrectAnswer(index)}
                  
                />
                Đúng
              </label>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-btn">Thêm câu hỏi</button>
      </form>
    </div>
  );
};

export default AddQuestion;
