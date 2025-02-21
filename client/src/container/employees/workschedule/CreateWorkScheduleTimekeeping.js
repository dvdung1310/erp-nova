import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Button } from 'antd';
import {saveWorkScheduleTimekeepingExcel} from '../../../apis/employees/index';

const ExcelImport = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Vui lòng chọn một file Excel trước.');
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const formattedData = jsonData.map(item => ({
        manv: item['Mã N.Viên'],
        name: item['Tên N.Viên'],
        date: excelDateToJSDate(item['Ngày']),
        time_in: excelTimeToJS(item['Vào']),
        time_out: excelTimeToJS(item['Giờ Ra'])
      }));
  
      setData(formattedData);
  
      try {
        const result = await saveWorkScheduleTimekeepingExcel(formattedData);
        alert('Dữ liệu đã được lưu thành công!');
      } catch (error) {
        alert('Có lỗi xảy ra khi lưu dữ liệu.');
      }
    };
  
    reader.readAsBinaryString(file);
  };

  // Hàm chuyển đổi ngày từ serial number của Excel
  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
  };

  // Hàm chuyển đổi giờ từ số thập phân của Excel
  const excelTimeToJS = (excelTime) => {
    if (!excelTime) return null; // Xử lý khi giá trị bị null hoặc undefined
  
    // Nếu dữ liệu là dạng số (thập phân), xử lý như cũ
    if (typeof excelTime === 'number') {
      const totalSeconds = Math.round(86400 * excelTime);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  
    // Nếu dữ liệu là dạng text (ví dụ "08:30" hoặc "8:30 AM")
    if (typeof excelTime === 'string') {
      // Kiểm tra định dạng HH:mm
      const timeMatch = excelTime.match(/^(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        const [ , hours, minutes ] = timeMatch;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
  
      // Kiểm tra định dạng có AM/PM
      const amPmMatch = excelTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (amPmMatch) {
        const  [ , hours, minutes, period ] = amPmMatch;
        hours = parseInt(hours, 10);
        if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }
  
    // Trường hợp không xác định được định dạng
    return 'NaN:NaN';
  };

  return (
    <div className="p-6 max-w-xl mx-auto" style={{ padding:'20px' }}>
      <h2 className="text-2xl font-bold mb-4">Import File Excel</h2>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileChange}
        className="mb-4"
      />
      <Button 
        onClick={handleFileUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Tải Lên
      </Button>

      {data.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Dữ liệu đã import:</h3>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Tên</th>
                <th className="border px-4 py-2">Ngày</th>
                <th className="border px-4 py-2">Giờ vào</th>
                <th className="border px-4 py-2">Giờ ra</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{item.date}</td>
                  <td className="border px-4 py-2">{item.time_in}</td>
                  <td className="border px-4 py-2">{item.time_out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelImport;
