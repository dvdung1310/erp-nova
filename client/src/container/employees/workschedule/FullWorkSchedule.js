import React, { useState, useEffect } from "react";
import { startOfMonth, eachDayOfInterval, addDays, getDay } from "date-fns/esm";
import { fullWorkSchedule } from '../../../services/EmpoyeesServices';
import '../FullWorkSchedule.css';

const FullWorkSchedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Lấy tháng hiện tại
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const response = await fullWorkSchedule(selectedMonth);
        setScheduleData(response.data);
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      }
    };

    fetchScheduleData();
  }, [selectedMonth]);

  // Tạo tuần cho tháng đã chọn
  useEffect(() => {
    const generateWeeks = () => {
      const firstDayOfMonth = startOfMonth(new Date(2024, selectedMonth - 1));
      let firstMonday = firstDayOfMonth;

      const dayOfWeek = getDay(firstDayOfMonth);
      if (dayOfWeek !== 1) {
        firstMonday = addDays(firstDayOfMonth, (8 - dayOfWeek) % 7);
      }

      const weeksArray = [];
      const firstTuesday = addDays(firstMonday, 1);
      const days = eachDayOfInterval({ start: firstTuesday, end: addDays(firstTuesday, 27) });

      let week = [];
      days.forEach((day) => {
        week.push(day.toISOString().split('T')[0]);
        if (week.length === 7) {
          weeksArray.push(week);
          week = []; // Reset tuần
        }
      });

      if (week.length) {
        weeksArray.push(week); // Thêm tuần cuối nếu chưa đủ
      }

      setWeeks(weeksArray);
    };

    generateWeeks();
  }, [selectedMonth]);

  const formatScheduleCode = (code) => {
    const scheduleMap = {
      '0': 'x',
      '1': '0,5'
    };

    return `${scheduleMap[code[0]] || 'x'} ${scheduleMap[code[1]] || 'x'} ${scheduleMap[code[2]] || 'x'}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 mb-4">
        <thead className="sticky top-0 bg-white">
          <tr>
            <th rowSpan={2} className="px-4 border name-class">Họ Và Tên</th>
            {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map((day, idx) => (
              <th key={idx} colSpan={3} className="px-4 border text-center date-class">{day}</th>
            ))}
            <th rowSpan={2} className="px-4 border text-center">Tổng</th>
          </tr>
          <tr>
            {Array(7).fill().map((_, idx) => (
              <>
                <th key={`S${idx}`} className="px-4 border sang">S</th>
                <th key={`C${idx}`} className="px-4 border chieu">C</th>
                <th key={`T${idx}`} className="px-4 border toi">T</th>
              </>
            ))}
          </tr>
        </thead>
      </table>

      <div style={{ marginTop: '70px' }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="mb-4">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 border name-class">Tuần {weekIndex + 1} tháng {selectedMonth}</th>
                  {week.map((date, idx) => (
                    <th key={idx} colSpan={3} className="px-4 border text-center date-class">
                      {new Date(date).toLocaleDateString()}
                    </th>
                  ))}
                  <th className="px-4 border text-center">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.length > 0 ? (
                  scheduleData.map((user, idx) => {
                    let totalDays = 0; // Biến tổng số ngày đã đăng ký
                    return (
                      <tr key={idx} className="text-center">
                        <td className="border px-4">{user.name}</td>
                        {week.map((date) => {
                          const schedule = user.schedule[date];
                          const formattedCode = schedule ? formatScheduleCode(schedule).split(" ") : ["x", "x", "x"];
                          const registeredDays = formattedCode.filter(item => item === '0,5').length;

                          totalDays += registeredDays / 2; // Cộng dồn số ngày đã đăng ký

                          return (
                            <>
                              <td key={`${date}-S`} className="border px-4">{formattedCode[0]}</td>
                              <td key={`${date}-C`} className="border px-4">{formattedCode[1]}</td>
                              <td key={`${date}-T`} className="border px-4">{formattedCode[2]}</td>
                            </>
                          );
                        })}
                        <td className="border px-4">{totalDays}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={week.length * 3 + 2} className="border px-4 text-center">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Nút chọn tháng */}
      <div className="flex justify-center my-4 footer-schedule">
        {[...Array(12).keys()].map((month) => (
          <button
            type="button"
            key={month}
            onClick={() => setSelectedMonth(month + 1)}
            className={`mx-2 p-2 ${selectedMonth === month + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Tháng {month + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FullWorkSchedule;
