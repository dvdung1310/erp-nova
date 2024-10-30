import { Row, Col, Checkbox, Card, Button } from "antd";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useParams, useHistory } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { saveWorkSchedule } from '../../../apis/employees/index';
import '../style.css';

const CreateWorkSchedule = () => {
    const [currentWeek, setCurrentWeek] = useState([]);
    const [checkboxValues, setCheckboxValues] = useState({});
    const history = useHistory();
    const [currentWeekOfMonth, setCurrentWeekOfMonth] = useState(1);
    const getWeekDays = () => {
        const current = new Date();
        const firstDayOfWeek = current.getDate() - current.getDay() + 1; 
        const weekDays = [];
        for (let i = 0; i < 7; i += 1) {
            const day = new Date(current.getFullYear(), current.getMonth(), firstDayOfWeek + i);
            weekDays.push({
                dayName: day.toLocaleDateString('vi-VN', { weekday: 'long' }),
                date: day.toLocaleDateString('vi-VN'),
            });
        }
        return weekDays;
    };

    const getCurrentWeekOfMonth = () => {
        const current = new Date();
        const firstDayOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const currentDay = current.getDate();
        const weekNumber = Math.ceil((currentDay + firstDayOfWeek) / 7);
        return weekNumber;
    };

    useEffect(() => {
        setCurrentWeek(getWeekDays());
        setCurrentWeekOfMonth(getCurrentWeekOfMonth());
    }, []);

    const handleCheckboxChange = (dayName, values) => {
        setCheckboxValues(prevValues => ({
            ...prevValues,
            [dayName]: values,
        }));
    };

    const handleSubmit = async () => {
        const scheduleData = currentWeek.map(day => ({
            date: day.date,
            morning: checkboxValues[day.dayName]?.includes("morning") || false,
            afternoon: checkboxValues[day.dayName]?.includes("afternoon") || false,
            evening: checkboxValues[day.dayName]?.includes("evening") || false,
        }));

        try {
            const accessToken = localStorage.getItem('accessToken');
            const result = await saveWorkSchedule(scheduleData, accessToken);
            toast.success(result.message);
            setTimeout(() => {
                history.push(`/admin/nhan-su/lich-lam-viec`);
            }, 2000);
        } catch (error) {
            console.error('Error submitting schedule:', error);
        }
    };

    return (
        <div>
            <Card>
                <h2 className="text-center mb-25 font-bold">Đăng kí lịch làm việc <span style={{ fontSize:'25px' , fontWeight:'bolder' }}>Tuần {currentWeekOfMonth} của tháng {new Date().getMonth() + 1}</span></h2>
                <Row gutter={25}>
                    {currentWeek.map((day, index) => (
                        <Col lg={6} md={12} xs={24} key={index}>
                            <div className="mb-25 custom-col">
                                <h4>{`${day.dayName} (${day.date})`}</h4>
                                <Checkbox.Group
                                    onChange={(values) => handleCheckboxChange(day.dayName, values)}
                                >
                                    <Checkbox value="morning">Sáng</Checkbox>
                                    <Checkbox value="afternoon">Chiều</Checkbox>
                                    <Checkbox value="evening">Tối</Checkbox>
                                </Checkbox.Group>
                            </div>
                        </Col>
                    ))}
                    <Col lg={6} md={12} xs={24}>
                        <div>
                            <Button type="primary" onClick={handleSubmit}>
                                Lưu
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
            <ToastContainer />
        </div>
        
    );
};

export default CreateWorkSchedule;
