import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllExams , deleteExam  } from '../../services/ExamServices';
import '../../assets/css/exam.css';

const ListExam = () => {
    const [exams, setExams] = useState([]);

    useEffect(() => {
        // Giả lập gọi API để lấy danh sách exams
        const fetchExams = async () => {
            const response = await getAllExams();
            setExams(response.exams);
        };
        fetchExams();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này không?')) {
            try {
                const response = await deleteExam(id);
                if (!response.error) {
                    toast.success(response.message);
                    setExams(exams.filter((exam) => exam.id !== id)); 
                } else {
                    toast.error("Có lỗi xảy ra khi xóa bài kiểm tra.");
                }
            } catch (error) {
                console.error("Lỗi khi xóa exam:", error);
                toast.error("Lỗi khi xóa bài kiểm tra.");
            }
        }
    };

    const handleEdit = (id) => {
        console.log('Sửa exam có id:', id);
    };

    const handleDetail = (id) => {
        console.log('Chi tiết exam có id:', id);
    };

    const handleAdd = () => {
        // Xử lý thêm mới exam
        console.log('Thêm exam mới');
    };
    
    return (
        <div className="exam-list-container">
            <h2>Danh Sách Đề Thi</h2>
            <table className="exam-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu Đề</th>
                        <th>Nội dung</th>
                        <th>Ảnh</th>
                        <th>Chức Năng</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.length > 0 ? (
                        exams.map((exam) => (
                            <tr key={exam.id}>
                                <td>{exam.id}</td>
                                <td>{exam.name}</td>
                                <td>{exam.description}</td>
                                <td>
                                    <img 
                                        src={`http://127.0.0.1:8000/storage/${exam.image}`} 
                                        alt={exam.name} 
                                        style={{ width: '50px', height: '50px' }} 
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(exam.id)}>Sửa</button>
                                    <button onClick={() => handleDelete(exam.id)}>Xóa</button>
                                    <button onClick={() => handleDetail(exam.id)}>Chi tiết</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">Không có dữ liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <button className="add-btn" onClick={handleAdd}>Thêm Đề Thi Mới</button>
        </div>
    );
};

export default ListExam;
