import {Row, Col, Checkbox, Card, Button, message} from "antd"; 
import {useState, useEffect} from "react";
import {toast} from "react-toastify";
import {useHistory} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import {saveWorkSchedule, getWorkScheduleForWeekByUserId} from '../../../apis/employees/index';
import '../style.css';

const CreateWorkSchedule = () => {
    const [currentWeek, setCurrentWeek] = useState([]);
    const [checkboxValues, setCheckboxValues] = useState({});
    const history = useHistory();
    const [currentWeekOfMonth, setCurrentWeekOfMonth] = useState(1);
    const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);

    const getWeekDays = () => {
        const current = new Date();
        const firstDayOfWeek = current.getDate() - current.getDay() + 1;
        const weekDays = [];
        for (let i = 0; i < 7; i += 1) {
            const day = new Date(current.getFullYear(), current.getMonth(), firstDayOfWeek + i);
            const formattedDate = day.toLocaleDateString('en-GB'); // Định dạng dd-mm-yyyy
            weekDays.push({
                dayName: day.toLocaleDateString('vi-VN', {weekday: 'long'}),
                date: formattedDate,
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

    const fetchUserWorkSchedule = async () => {
        try {
            const response = await getWorkScheduleForWeekByUserId();
            const scheduleData = response.data;
            console.log('Schedule Data:', scheduleData);
            const initialCheckboxValues = {};
            scheduleData.forEach(day => {
                const checkedValues = [];
                if (day.morning) checkedValues.push("morning");
                if (day.afternoon) checkedValues.push("afternoon");
                if (day.evening) checkedValues.push("evening");
                initialCheckboxValues[day.date] = checkedValues;
            });
            console.log(initialCheckboxValues);
            setCheckboxValues(initialCheckboxValues);
        } catch (error) {
            console.error('Error fetching work schedule:', error);
        }
    };

    const checkRegistrationDeadline = () => {
        const now = new Date();
        const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
        const mondayMorningDeadline = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate(), 21, 0, 0); // 9h sáng thứ 2
        // console.log('ngay hien tại :' ,now);
        // console.log('ngày hết hạn :' ,mondayMorningDeadline);
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
        setCurrentWeek(getWeekDays());
        setCurrentWeekOfMonth(getCurrentWeekOfMonth());
        fetchUserWorkSchedule();
        checkRegistrationDeadline();
    }, []);

    const handleCheckboxChange = (date, values) => {
        console.log(`Checkbox values for ${date}:`, values);
        setCheckboxValues(prevValues => ({
            ...prevValues,
            [date]: values,
        }));
    };

    const handleSubmit = async () => {
        if (isRegistrationClosed) {
            return; // Ngăn không cho gửi nếu đã hết hạn đăng ký
        }

        const scheduleData = currentWeek.map(day => ({
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
                <h2 className="text-center mb-25 font-bold">
                    Đăng Kí Lịch Làm Việc
                    {/* <span style={{ fontSize: '25px', fontWeight: 'bolder' }}>Tuần {currentWeekOfMonth} của tháng {new Date().getMonth() + 1}</span> */}
                </h2>
                <Row gutter={25}>
                    {currentWeek.map((day, index) => (
                        <Col lg={6} md={12} xs={24} key={index}>
                            <div className="mb-25 custom-col">
                                <h4>{`${day.dayName} (${day.date})`}</h4>
                                <Checkbox.Group
                                    value={checkboxValues[day.date] || []}
                                    onChange={(values) => handleCheckboxChange(day.date, values)}
                                    // disabled={isRegistrationClosed} // Vô hiệu hóa checkbox nếu hết hạn
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
            </Card>
        </div>
    );
};

export default CreateWorkSchedule;
