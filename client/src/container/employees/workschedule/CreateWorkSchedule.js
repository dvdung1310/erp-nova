import React, { useState, useEffect } from "react";
import { Row, Col, Checkbox, Card, Button, Tabs } from "antd";
import { toast } from "react-toastify";
import { useHistory } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { saveWorkSchedule, getWorkScheduleForWeekByUserId } from '../../../apis/employees/index';
import { startOfMonth, addDays, getDay, eachDayOfInterval } from "date-fns";
import '../style.css';

const { TabPane } = Tabs;

const CreateWorkSchedule = () => {
    const [weeks, setWeeks] = useState([]);
    const [checkboxValues, setCheckboxValues] = useState({});
    const history = useHistory();
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);

    // Hàm lấy các tuần trong tháng bắt đầu từ thứ Hai đầu tiên
    const getWeeksOfMonthStartingFromMonday = (month) => {
        const firstDayOfMonth = startOfMonth(new Date(new Date().getFullYear(), month - 1));
        
        let firstMonday = firstDayOfMonth;
        const dayOfWeek = getDay(firstDayOfMonth);
        if (dayOfWeek !== 1) {
            firstMonday = addDays(firstDayOfMonth, (8 - dayOfWeek) % 7);
        }

        const weeks = [];
        let currentWeekStart = firstMonday;
        
        while (currentWeekStart.getMonth() === firstDayOfMonth.getMonth()) {
            const weekDays = eachDayOfInterval({ 
                start: currentWeekStart, 
                end: addDays(currentWeekStart, 6) 
            });

            weeks.push(weekDays.map(day => ({
                dayName: day.toLocaleDateString('vi-VN', { weekday: 'long' }),
                date: day.toLocaleDateString('en-GB'),
            })));

            currentWeekStart = addDays(currentWeekStart, 7);
        }
        
        return weeks;
    };

    // Hàm lấy lịch làm việc của người dùng cho tuần
    const fetchUserWorkSchedule = async (weekIndex) => {
        try {
            const response = await getWorkScheduleForWeekByUserId(weekIndex);
            const scheduleData = response.data;
            const initialCheckboxValues = {};
            scheduleData.forEach(day => {
                const checkedValues = [];
                if (day.morning) checkedValues.push("morning");
                if (day.afternoon) checkedValues.push("afternoon");
                if (day.evening) checkedValues.push("evening");
                initialCheckboxValues[day.date] = checkedValues;
            });
            setCheckboxValues(initialCheckboxValues);
        } catch (error) {
            console.error('Error fetching work schedule:', error);
        }
    };

    // Kiểm tra hạn chót đăng ký lịch làm việc
    const checkRegistrationDeadline = () => {
        const now = new Date();
        const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
        const mondayMorningDeadline = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate(), 21, 0, 0); // 21h sáng thứ 2
        if (now > mondayMorningDeadline) {
            setIsRegistrationClosed(true);
            toast.warn('Đã hết hạn đăng ký lịch làm việc cho tuần này', {
                autoClose: 1000,
                position: 'top-right'
            });
        } else {
            setIsRegistrationClosed(false);
        }
    };

    useEffect(() => {
        const month = new Date().getMonth() + 1;
        setWeeks(getWeeksOfMonthStartingFromMonday(month));
        fetchUserWorkSchedule();
        checkRegistrationDeadline();
    }, []);

    const handleCheckboxChange = (date, values) => {
        setCheckboxValues(prevValues => ({
            ...prevValues,
            [date]: values,
        }));
    };

    const handleSubmit = async () => {
        if (isRegistrationClosed) {
            return;
        }

        const selectedWeek = weeks[selectedWeekIndex];
        const scheduleData = selectedWeek.map(day => ({
            date: day.date,
            morning: checkboxValues[day.date]?.includes("morning") || false,
            afternoon: checkboxValues[day.date]?.includes("afternoon") || false,
            evening: checkboxValues[day.date]?.includes("evening") || false,
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
                <h2 className="text-center mb-25 font-bold">Đăng Kí Lịch Làm Việc</h2>
                <Tabs activeKey={selectedWeekIndex.toString()} onChange={(key) => setSelectedWeekIndex(Number(key))}>
                    {weeks.map((week, index) => (
                        <TabPane tab={`Tuần ${index + 1}`} key={index.toString()}>
                            <Row gutter={25}>
                                {week.map((day, idx) => (
                                    <Col lg={6} md={12} xs={24} key={idx}>
                                        <div className="mb-25 custom-col">
                                            <h4>{`${day.dayName} (${day.date})`}</h4>
                                            <Checkbox.Group
                                                value={checkboxValues[day.date] || []}
                                                onChange={(values) => handleCheckboxChange(day.date, values)}
                                                disabled={isRegistrationClosed}
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
                                        <Button type="primary" onClick={handleSubmit} disabled={isRegistrationClosed}>
                                            Lưu
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </TabPane>
                    ))}
                </Tabs>
            </Card>
        </div>
    );
};

export default CreateWorkSchedule;
