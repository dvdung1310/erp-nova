import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { get_user_workschedule_timekeeping } from "../../../apis/employees/index";
import { Table, Spin, Typography } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const UserScheduleTimekeepingDetail = () => {
  const { month, name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (month && name) {
      fetchData();
    }
  }, [month, name]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await get_user_workschedule_timekeeping(month, name);
      setData(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Có lỗi xảy ra khi lấy dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  // Xác định số ngày trong tháng
  const year = dayjs().year();
  const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
  const schedule = data?.schedule || {};

  let totalWorkDays = 0;
  let totalResult = 0;

  // Tạo danh sách dữ liệu bảng
  const tableData = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(`${year}-${month}-${i + 1}`).format("YYYY-MM-DD");
    const value = schedule[date] || "N/A-N/A-0-0-0";
    const [checkIn, checkOut, checkedIn, hasRegisteredWork, hasReport] = value.split("-");

    const result = hasRegisteredWork === "1" && hasReport === "1" ? parseFloat(checkedIn) : 0;
    totalWorkDays += parseFloat(checkedIn);
    totalResult += result;

    return {
      key: date,
      date: date,
      checkIn: checkIn === "N/A" ? "-" : checkIn,
      checkOut: checkOut === "N/A" ? "-" : checkOut,
      workHours: checkedIn,
      registered: hasRegisteredWork === "1" ? "✔️ Có" : "❌ Không",
      reported: hasReport === "1" ? "✔️ Có" : "❌ Không",
      result: result,
    };
  });

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      align: "center",
      width: 100,
      render: (text) => <Text strong>{dayjs(text).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "Check-in",
      dataIndex: "checkIn",
      key: "checkIn",
      align: "center",
      width: 100,
    },
    {
      title: "Check-out",
      dataIndex: "checkOut",
      key: "checkOut",
      align: "center",
      width: 100,
    },
    {
      title: "Công làm việc",
      dataIndex: "workHours",
      key: "workHours",
      align: "center",
      width: 120,
    },
    {
      title: "Đăng ký",
      dataIndex: "registered",
      key: "registered",
      align: "center",
      width: 100,
    },
    {
      title: "Báo cáo",
      dataIndex: "reported",
      key: "reported",
      align: "center",
      width: 100,
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      key: "result",
      align: "center",
      width: 100,
      render: (text) => <Text style={{ color: text > 0 ? "green" : "red" }}>{text}</Text>,
    },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <Title level={3} style={{ textAlign: "center" }}>Chi tiết chấm công</Title>
      <Text strong>Nhân viên: </Text> <Text>{data?.name}</Text> <br />
      <Text strong>Phòng ban: </Text> <Text>{data?.department_name}</Text>

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
        style={{ marginTop: "20px" }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3} align="center">
              <Text strong>Tổng cộng</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="center">
              <Text strong>{totalWorkDays.toFixed(2)}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
            <Table.Summary.Cell index={3} />
            <Table.Summary.Cell index={4} align="center">
              <Text strong style={{ color: "blue" }}>{totalResult.toFixed(2)}</Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
};

export default UserScheduleTimekeepingDetail;
