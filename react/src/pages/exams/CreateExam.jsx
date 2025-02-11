import React, { useState } from 'react';
import axios from 'axios';
import '../../assets/css/exam.css';
import { toast } from 'react-toastify';
import { ExamServices } from '../../services/ExamServices';

const CreateExam = () => {
    const [examData, setExamData] = useState({
        name: '',
        description: '',
        image: null,
        time: '',
        status: 1,
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setExamData((prevData) => ({
            ...prevData,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await ExamServices(examData);
            if(response.error){
                toast.error(response.message)
                return
            }
            toast.success(response.message)
        }catch(e){
            toast.error(e.response.data.message)
        }
    };

    return (
        <div className="create-exam-container">
            <h2>Tạo Đề Thi Mới</h2>
            <form onSubmit={handleSubmit} encType='multipart/form-data'>
                <div>
                    <label>Tên Đề Thi:</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nhập tên đề thi"
                        value={examData.name}
                        onChange={handleChange}
                        
                    />
                </div>
                <div>
                    <label>Mô Tả:</label>
                    <textarea
                        name="description"
                        placeholder="Nhập mô tả"
                        value={examData.description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Ảnh:</label>
                    <input type="file" name="image" onChange={handleChange} />
                </div>
                <div>
                    <label>Thời Gian (phút):</label>
                    <input
                        type="number"
                        name="time"
                        placeholder="Nhập thời gian"
                        value={examData.time}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Trạng Thái:</label>
                    <select name="status" onChange={handleChange} value={examData.status}>
                        <option value={1}>Kích Hoạt</option>
                        <option value={0}>Không Kích Hoạt</option>
                    </select>
                </div>
                <button type="submit">Tạo Đề Thi</button>
            </form>
        </div>
    );
};

export default CreateExam;
