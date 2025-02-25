import React, { useState, useEffect, useRef } from "react";
import { startOfMonth, eachDayOfInterval, addDays, getDay } from "date-fns/esm";
import { fullWorkScheduleTimekeeping, fullWorkScheduleTimekeepingExportExcel } from "../../../apis/employees/index";
import "../FullWorkSchedule.css";
import { Spin, Button , Input  } from "antd";
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';

const FullWorkScheduleTimekeeping = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [weeks, setWeeks] = useState([]);
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const currentDate = new Date().toISOString().split("T")[0];
    const currentDayIndex = (getDay(new Date(currentDate)) + 6) % 7;
    const currentWeekRef = useRef(null);
    const [searchName, setSearchName] = useState("");
    const toRomanNumeral = (num) => {
        const romanNumerals = [
            ["X", 10],
            ["IX", 9],
            ["VIII", 8],
            ["VII", 7],
            ["VI", 6],
            ["V", 5],
            ["IV", 4],
            ["III", 3],
            ["II", 2],
            ["I", 1],
        ];

        const found = romanNumerals.find(([_, value]) => value === num);
        return found ? found[0] : "";
    };

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                setLoading(true);
                const response = await fullWorkScheduleTimekeeping(selectedMonth);
                setScheduleData(response.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching schedule data:", error);
            }
        };

        fetchScheduleData();
    }, [selectedMonth]);

    useEffect(() => {
        if (weeks.length > 0 && currentWeekRef.current) {
            currentWeekRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [weeks, currentDate]);

    useEffect(() => {
        const generateWeeks = () => {
            const firstDayOfMonth = startOfMonth(new Date(2025, selectedMonth - 1));
            let firstMonday = firstDayOfMonth;

            const dayOfWeek = getDay(firstDayOfMonth);
            if (dayOfWeek !== 1) {
                firstMonday = addDays(firstDayOfMonth, (8 - dayOfWeek) % 7);
            }

            const weeksArray = [];
            if (selectedMonth === 1) {
                const extraWeekStart = new Date(2024, 11, 31);
                const extraWeekEnd = new Date(2024, 12, 6);
                const extraDays = eachDayOfInterval({ start: extraWeekStart, end: extraWeekEnd });
                weeksArray.push(extraDays.map(day => day.toISOString().split("T")[0]));
            }
            const firstTuesday = addDays(firstMonday, 1);
            const days = eachDayOfInterval({ start: firstTuesday, end: addDays(firstTuesday, 27) });

            let week = [];
            days.forEach((day) => {
                week.push(day.toISOString().split("T")[0]);
                if (week.length === 7) {
                    weeksArray.push(week);
                    week = [];
                }
            });

            if (week.length) {
                weeksArray.push(week);
            }

            setWeeks(weeksArray);
        };

        generateWeeks();
    }, [selectedMonth]);

    const handleSearch = () => {
        if (searchName.trim()) {
            history.push(`tong-cong-nhan-vien/${selectedMonth}/${searchName}`);
        }
    };


    const handleExportExcel = async () => {
        try {
            setLoading(true);
            const response = await fullWorkScheduleTimekeepingExportExcel(selectedMonth);
            // năm 2025
            const year = 2025;
            const month = selectedMonth;
            const daysInMonth = new Date(year, month, 0).getDate();

            const worksheetData = [
                ['Tên', 'Phòng Ban', 'Ngày', 'Thứ', 'Giờ Vào', 'Giờ Ra', 'Ghi chú', 'Chấm công', 'Đăng ký', 'Báo cáo', 'Tổng']
            ];

            response.data.forEach((employee) => {
                for (let day = 1; day <= daysInMonth; day+=1) {
                    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const scheduleInfo = employee.schedule[date] || 'N/A-N/A-0-0-0';
                    const [checkIn, checkOut, workingHours, registered, reported] = scheduleInfo.split('-');
                    let note = '';
                    if (checkIn === 'N/A' && checkOut === 'N/A') {
                        note = ''; 
                    } else if (checkIn !== 'N/A' && checkOut === 'N/A') {
                        note = 'Quên checkout'; // Có giờ vào nhưng không có giờ ra
                    } else if (checkIn === 'N/A' && checkOut !== 'N/A') {
                        note = 'Quên checkin'; // Có giờ ra nhưng không có giờ vào
                    }

                    let sumCong = '';
                    if(registered === '1' && reported === '1'){
                        sumCong = workingHours;
                    } else {
                        sumCong = 0;
                    }
                    worksheetData.push([
                        employee.name,
                        employee.department_name,
                        date,
                        new Date(date).toLocaleDateString('vi-VN', { weekday: 'long' }),
                        checkIn !== 'N/A' ? checkIn : '',
                        checkOut !== 'N/A' ? checkOut : '',
                        note,
                        workingHours,
                        registered === '1' ? 'Có' : 'Không',
                        reported === '1' ? 'Có' : 'Không',
                        sumCong
                    ]);
                }
            });

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            worksheet['!cols'] = [
                { wch: 25 }, // Tên
                { wch: 15 }, // Phòng Ban
                { wch: 12 }, // Ngày
                { wch: 12 }, // Thứ
                { wch: 10 }, // Giờ Vào
                { wch: 10 }, // Giờ Ra
                { wch: 20 }, // Ghi chú
                { wch: 12 }, // Chấm công
                { wch: 12 }, // Đăng ký
                { wch: 12 }, // Báo cáo
                { wch: 10 }, // Tổng
            ];
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Schedule');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `work_schedule_${year}_${month}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error exporting Excel:", error);
        }
    };

    const formatScheduleCode = (code) => {
        if (!code) return ['-', '-', '-'];
        return code.split('-');
    };

    return (
        <div className="overflow-x-auto">
            {
                loading ? <div className='spin'>
                    <Spin />
                </div> : (
                    <>
                        <table className="min-w-full bg-white border border-gray-200 mb-4">
                            <thead className="sticky top-0 bg-white">
                                <tr>
                                    <th rowSpan={2} className="px-4 border text-center">STT</th>
                                    <th rowSpan={2} className="px-4 border name-class">Họ Và Tên</th>
                                    {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map((day, idx) => (
                                        <th key={idx} colSpan={4} className={`px-4 border text-center date-class ${currentDayIndex === idx ? "bg-blue font-bold" : ""}`}>{day}</th>
                                    ))}
                                    <th rowSpan={2} style={{ background: 'blue', color: '#fff' }} className="px-4 border text-center">Tổng</th>
                                </tr>
                                <tr>
                                    {Array(7).fill().map((_, idx) => (
                                        <>
                                            <th style={{ width: '25px' }} key={`S${idx}`} className="px-4 border sang">Chấm công</th>
                                            <th style={{ width: '25px' }} key={`C${idx}`} className="px-4 border chieu">Đăng ký</th>
                                            <th style={{ width: '25px' }} key={`T${idx}`} className="px-4 border toi">Báo cáo</th>
                                            <th style={{ width: '25px', background: 'rgb(141 141 200)', color: 'white' }} key={`T${idx}`} className="px-4 border">Số công</th>
                                        </>
                                    ))}
                                </tr>
                            </thead>
                        </table>

                        <div style={{ marginTop: '70px', marginBottom: '30px' }}>
                            {weeks.map((week, weekIndex) => (
                                <div ref={week.includes(currentDate) ? currentWeekRef : null} key={weekIndex} className="mb-4">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr className="week-tr">
                                                <th className="px-4 border text-center">STT</th>
                                                <th className="px-4 border name-class">Tuần {weekIndex + 1} tháng {selectedMonth}</th>
                                                {week.map((date, idx) => (
                                                    <th key={idx} colSpan={4} className={`px-4 border text-center date-class ${date === currentDate ? "bg-blue font-bold" : ""
                                                        }`}>
                                                        {new Date(date).toLocaleDateString()}
                                                    </th>
                                                ))}
                                                <th className="px-4 border text-center">Tổng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduleData.length > 0 ? (
                                                Object.entries(
                                                    scheduleData.reduce((acc, user) => {
                                                        if (!acc[user.department_name]) {
                                                            acc[user.department_name] = [];
                                                        }
                                                        acc[user.department_name].push(user);
                                                        return acc;
                                                    }, {})
                                                ).map(([departmentName, users], deptIdx) => (
                                                    <React.Fragment key={departmentName}>
                                                        <tr className="department-row">
                                                            <td colSpan={week.length * 3 + 3} className="px-4 py-2 bg-gray-200 text-left font-semibold" style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                                                {toRomanNumeral(deptIdx + 1)}. BP {departmentName}
                                                            </td>
                                                        </tr>
                                                        {users.map((user, idx) => {
                                                            let totalDays = 0;
                                                            return (
                                                                <tr key={user.name} className="text-center table-row-hover">
                                                                    <td className="border px-4 text-center">{idx + 1}</td>
                                                                    <td className="border px-4 aa">{user.name}</td>
                                                                    {week.map((date) => {
                                                                        const schedule = user.schedule?.[date];
                                                                        const formattedCode = formatScheduleCode(schedule);
                                                                        let cong = 0;
                                                                        if (formattedCode[1]?.toString() === '1' && formattedCode[2]?.toString() === '1') {
                                                                            cong = Number(formattedCode[0]) || 0;
                                                                        } else {
                                                                            cong = 0;
                                                                        }
                                                                        totalDays += cong;
                                                                        return (
                                                                            <>
                                                                                <td key={`${date}-S`} style={{ width: '25px' }} className="border px-4">{formattedCode[0]}</td>
                                                                                <td key={`${date}-C`} style={{ width: '25px' }} className="border px-4">{formattedCode[1]}</td>
                                                                                <td key={`${date}-T`} style={{ width: '25px' }} className="border px-4">{formattedCode[2]}</td>
                                                                                <td key={`${date}-T`} style={{ width: '25px', background: 'rgb(141 141 200)', color: 'white' }} className="border px-4">{cong}</td>
                                                                            </>
                                                                        );
                                                                    })}
                                                                    <td className="border px-4" style={{ background: 'blue', color: '#fff' }}>{totalDays}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={week.length * 3 + 3} className="border px-4 text-center">Không có dữ liệu</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center my-4 footer-schedule">
                            {[...Array(12).keys()].map((month) => (
                                <button
                                    type="button"
                                    key={month}
                                    onClick={() => setSelectedMonth(month + 1)}
                                    className={`mx-2 p-2 ${selectedMonth === month + 1 ? "bg-blue-500 active" : "bg-gray-200"}`}
                                >
                                    Tháng {month + 1}
                                </button>
                            ))}

                            <Button style={{ textAlign: 'end', color: '#000', backgroundColor: '#00FF00', fontSize: '18px', border: 'none', marginLeft: '10px' }} type="primary" onClick={() => history.push(`/admin/nhan-su/import-file/kiem-tra-cham-cong`)}>
                                Thêm bảng công
                            </Button>

                            <Button onClick={handleExportExcel} style={{ textAlign: 'end', color: '#000', backgroundColor: '#00FF00', fontSize: '18px', border: 'none', marginLeft: '10px' }} type="primary">
                                Xuất Excel
                            </Button>

                           
                            <Input 
                                placeholder="Nhập tên nhân sự" 
                                value={searchName} 
                                onChange={(e) => setSearchName(e.target.value)} 
                                style={{ width: 200, marginRight: 10 }} 
                            />
                            <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
                           
                        </div>
                    </>
                )
            }
        </div>
    );
};

export default FullWorkScheduleTimekeeping;
