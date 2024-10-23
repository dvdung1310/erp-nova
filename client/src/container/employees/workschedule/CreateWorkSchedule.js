import { Row, Col, Checkbox, Card, Button } from "antd";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveWorkSchedule } from '../../../services/EmpoyeesServices';
import '../style.css';

const CreateWorkSchedule = () => {
    const [currentWeek, setCurrentWeek] = useState([]);
    const [checkboxValues, setCheckboxValues] = useState({});

    const getWeekDays = () => {
        const current = new Date();
        const firstDayOfWeek = current.getDate() - current.getDay() + 1;
        const weekDays = [];
        for (let i = 0; i < 7; i += 1) {
            const day = new Date(current.setDate(firstDayOfWeek + i));
            weekDays.push({
                dayName: day.toLocaleDateString('vi-VN', { weekday: 'long' }),
                date: day.toLocaleDateString('vi-VN'),
            });
        }
        return weekDays;
    };

    useEffect(() => {
        setCurrentWeek(getWeekDays());
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
            const result = await saveWorkSchedule(scheduleData);
            toast.success(result.message);
        } catch (error) {
            console.error('Error submitting schedule:', error);
        }
    };

    return (
        <div>
            <Card>
                <h2 className="text-center mb-25 font-bold">Đăng kí lịch làm việc</h2>
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
