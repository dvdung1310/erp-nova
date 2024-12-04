/* eslint-disable object-shorthand */
import {PageHeader} from "../../../../../components/page-headers/page-headers";
import React, {useEffect, useState} from "react";
import {Cards} from "../../../../../components/cards/frame/cards-frame";
import {NoteCardWrap} from "../../../../note/style";
import {useDispatch, useSelector} from "react-redux";
import NoteCardGroup from "./NoteCardGroup";
import {getReportGroup} from "../../../../../apis/work/group";
import {useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {Card, Col, DatePicker, Empty, Modal, Row, Select, Spin, Table, Typography} from "antd";
import Avatar from "../../../../../components/Avatar/Avatar";
import {Doughnut, HorizontalBar} from "react-chartjs-2";
import {DatePickerWrapper} from "../../../../styled";
import moment from "moment/moment";

moment.locale('vi');
const {Text} = Typography;
//
const {RangePicker} = DatePicker;

const ReportGroup = () => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const dispatch = useDispatch();
    const [data, setData] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [taskByUsers, setTaskByUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const {id} = params;
    const [totalTask, setTotalTask] = useState(0);
    const [totalWaitingTaskPercent, setTotalWaitingTaskPercent] = useState(0);
    const [totalDoingTaskPercent, setTotalDoingTaskPercent] = useState(0);
    const [totalCompletedTaskPercent, setTotalCompletedTaskPercent] = useState(0);
    const [totalOverdueTaskPercent, setTotalOverdueTaskPercent] = useState(0);
    const [totalPausedTaskPercent, setTotalPausedTaskPercent] = useState(0);
    //
    const [startDateCustom, setStartDateCustom] = useState(null);
    const [endDateCustom, setEndDateCustom] = useState(null);
    const [showModalCustomDate, setShowModalCustomDate] = useState(false);
    const handleShowModalCustomDate = () => {
        setShowModalCustomDate(true);
    }
    const handleCloseModalCustomDate = () => {
        setShowModalCustomDate(false);
    }

    const fetchData = async (startDate, endDate) => {
        try {
            setLoading(true);
            const payload = {
                startDate,
                endDate,
            }
            const response = await getReportGroup(id, payload);
            setData(response.data);
            const totalTask = response?.data?.total_tasks;
            setTotalTask(totalTask);
            setTotalWaitingTaskPercent(Math.round((response?.data?.total_waiting_tasks / totalTask) * 100));
            setTotalDoingTaskPercent(Math.round((response?.data?.total_doing_tasks / totalTask) * 100));
            setTotalCompletedTaskPercent(Math.round((response?.data?.total_completed_tasks / totalTask) * 100));
            setTotalOverdueTaskPercent(Math.round((response?.data?.total_overdue_tasks / totalTask) * 100));
            setTotalPausedTaskPercent(Math.round((response?.data?.total_paused_tasks / totalTask) * 100));
            setTaskByUsers(response?.data?.taskByUsers);

            setLoading(false);
        } catch (error) {
            setLoading(false)
            toast.error('Có lỗi xảy ra!', {
                position: 'top-right',
                autoClose: 1000,
            });
            console.log(error);
        }
    }
    useEffect(() => {
        fetchData(startDate, endDate);
    }, [id, startDate, endDate]);

    //table
    const columns = [
        {
            title: "Thành viên",
            dataIndex: "user",
            key: "user",
            render: (text, record) => {
                return (
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Avatar
                            name={text?.name}
                            width={32}
                            height={32}
                            imageUrl={text?.avatar ? `${LARAVEL_SERVER}${text?.avatar}` : null}
                            style={{marginRight: 8, backgroundColor: "#87d068"}}
                        >
                            {text?.avatar ? null : 'U'}
                        </Avatar>
                        <Text>{text?.name}</Text>
                    </div>
                )
            }
        },
        {
            title: "Công việc",
            dataIndex: "total_tasks",
            key: "total_tasks",
        },
        {
            title: "Đang chờ",
            dataIndex: "total_waiting_tasks",
            key: "total_waiting_tasks",
        },
        {
            title: "Đang làm",
            dataIndex: "total_doing_tasks",
            key: "total_doing_tasks",
        },
        {
            title: "Đang quá hạn",
            dataIndex: "totalTasksOverdueInProgress",
            key: "totalTasksOverdueInProgress",
        },
        {
            title: "Đã từng quá hạn",
            dataIndex: "totalTasksOverdueCompleted",
            key: "totalTasksOverdueCompleted",
        },
        {
            title: "Hoàn thành",
            dataIndex: "total_completed_tasks",
            key: "total_completed_tasks",
        },
        {
            title: 'Tạm dùng',
            dataIndex: 'total_paused_tasks',
            key: 'total_paused_tasks',
        }
    ];
    // chart
    const dataChart = {
        labels: ["Đang chờ", "Đang làm", "Hoàn thành", "Quá hạn", "Tạm dừng"],
        datasets: [
            {
                data: [totalWaitingTaskPercent, totalDoingTaskPercent, totalCompletedTaskPercent, totalOverdueTaskPercent, totalPausedTaskPercent], // Dữ liệu ví dụ
                backgroundColor: ["#ed6c0282", "#0288d175", "#42a04787", "#d32f2f99", "#9e9e9e7a"], // Màu sắc từng phần
                hoverBackgroundColor: ["#ed6c02", "#0288d1", "#42a047", "#e15151", "#9e9e9e"],
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    const dataset = data.datasets[tooltipItem.datasetIndex];
                    const total = dataset.data.reduce((prev, curr) => prev + curr, 0);
                    const value = dataset.data[tooltipItem.index];
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${data.labels[tooltipItem.index]}: ${percentage}%`;
                },
            },
        },
        legend: {
            position: "bottom",
            labels: {
                fontSize: 12,
                padding: 15,
                boxWidth: 10,
            },
        },
    };
    // chart user
    const labels = taskByUsers.map((item) => item.user.name);

    const dataChartUser = {
        labels: labels,
        datasets: [
            {
                label: "Đang chờ",
                backgroundColor: "#FFC107",
                data: taskByUsers.map((item) => item.total_waiting_tasks),
            },
            {
                label: "Đang làm",
                backgroundColor: "#2196F3",
                data: taskByUsers.map((item) => item.total_doing_tasks),
            },
            {
                label: "Hoàn thành",
                backgroundColor: "#4CAF50",
                data: taskByUsers.map((item) => item.total_completed_tasks),
            },
            {
                label: "Quá hạn",
                backgroundColor: "#F44336",
                data: taskByUsers.map(
                    (item) =>
                        item.totalTasksOverdueCompleted + item.totalTasksOverdueInProgress
                ),
            },
            {
                label: "Tạm dừng",
                backgroundColor: "#9E9E9E",
                data: taskByUsers.map((item) => item.total_paused_tasks),
            }
        ],
    };

    const optionsChartUser = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            xAxes: [
                {
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
            yAxes: [
                {
                    stacked: true,
                },
            ],
        },
        legend: {
            position: "bottom",
            labels: {
                fontSize: 12,
                padding: 15,
                boxWidth: 10,
                cursor: "pointer",
            },
        },
        animation: {
            duration: 1000,
            onComplete: function () {
                const ctx = this.chart.ctx;
                ctx.font = "bold 14px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const chart = this.chart;
                const datasets = chart.data.datasets;

                // datasets.forEach((dataset, i) => {
                //     const meta = chart.controller.getDatasetMeta(i);
                //     meta.data.forEach((bar, index) => {
                //         const value = dataset.data[index];
                //         const { x, y } = bar.tooltipPosition();
                //         if (value > 0) {
                //             ctx.fillStyle = "#fff";
                //             ctx.fillText(value, x, y);
                //         }
                //     });
                // });
            },
        },
        tooltips: {
            enabled: true, // Chỉ hiển thị tooltip khi hover vào
            mode: "nearest", // Chỉ hiển thị tooltip gần vị trí của điểm
            callbacks: {
                // Cập nhật tooltip chỉ hiển thị phần đang hover
                label: function (tooltipItem, data) {
                    const dataset = data.datasets[tooltipItem.datasetIndex];
                    const value = dataset.data[tooltipItem.index];
                    // Hiển thị label chỉ cho phần đang hover
                    return `${dataset.label}: ${value}`;
                },
                // Ẩn các phần label không cần thiết
                afterLabel: function (tooltipItem, data) {
                    return "";
                },
            },
        },
    };

    const handleOk = async () => {
        setShowModalCustomDate(false);
        await fetchData(startDateCustom, endDateCustom);
    }

    return (
        <div>
            <PageHeader
                ghost
                title={loading ? 'loading...' : `Báo cáo nhóm: ${data?.group_name}`}
                buttons={[
                    <Select
                        defaultValue="all"
                        style={{width: 200}}
                        onChange={(value) => {
                            const formatDate = (date, hours, minutes, seconds) => {
                                date.setHours(hours, minutes, seconds, 0);
                                return date.toLocaleString('en-CA', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }).replace(',', '');
                            };

                            if (value === "all") {
                                setStartDate(null);
                                setEndDate(null);
                            } else if (value === "today") {
                                const today = new Date();
                                setStartDate(formatDate(today, 1, 0, 0)); // 1:00 AM
                                setEndDate(formatDate(today, 23, 0, 0)); // 11:00 PM
                            } else if (value === "week") {
                                const today = new Date();
                                const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
                                const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7)); // Sunday
                                setStartDate(formatDate(firstDayOfWeek, 1, 0, 0)); // 1:00 AM
                                setEndDate(formatDate(lastDayOfWeek, 23, 0, 0)); // 11:00 PM
                            } else if (value === "month") {
                                const today = new Date();
                                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month
                                setStartDate(formatDate(firstDayOfMonth, 1, 0, 0)); // 1:00 AM
                                setEndDate(formatDate(lastDayOfMonth, 23, 0, 0)); // 11:00 PM
                            } else if (value === "year") {
                                const today = new Date();
                                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                                const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // Last day of the year
                                setStartDate(formatDate(firstDayOfYear, 1, 0, 0)); // 1:00 AM
                                setEndDate(formatDate(lastDayOfYear, 23, 0, 0)); // 11:00 PM
                            } else if (value === "custom") {
                                handleShowModalCustomDate();
                            }
                        }}
                        options={[
                            {label: "Tất cả", value: "all"},
                            {label: "Hôm nay", value: "today"},
                            {label: "Tuần này", value: "week"},
                            {label: "Tháng này", value: "month"},
                            {label: "Năm nay", value: "year"},
                            {label: "Tuỳ chỉnh", value: "custom"},
                        ]}
                    />,
                ]}
            />
            {
                loading ? <div className='spin'><Spin/></div> : <>
                    <Cards headless>
                        <NoteCardWrap>
                            <NoteCardGroup data={data}/>
                            <div style={{padding: "16px", background: "#fff", borderRadius: "8px"}}>
                                <Typography.Title level={4} style={{marginBottom: 16}}>
                                    Kết quả làm việc
                                </Typography.Title>
                                <Table
                                    columns={columns}
                                    dataSource={data?.taskByUsers}
                                    pagination={false}
                                    bordered
                                    scroll={{x: 'max-content'}}
                                    style={{borderRadius: "8px", overflow: "hidden"}}
                                />
                            </div>
                            <div>
                                <Row gutter={25}>
                                    <Col md={24} lg={24}>
                                        <Card

                                            title="Biểu đồ tổng hợp công việc"
                                        >
                                            <div style={{height: "300px", margin: "0 auto"}}>
                                                {totalTask > 0 ? <Doughnut data={dataChart} options={options}/> : <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        height: "100%"
                                                    }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/></div>}
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col md={24} lg={24}>
                                        <Card
                                            title="Biểu đồ tổng hợp thành viên"
                                        >
                                            <div style={{height: "300px", margin: "0 auto"}}>
                                                {totalTask > 0 ?
                                                    <HorizontalBar data={dataChartUser} options={optionsChartUser}/> :
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            height: "100%"
                                                        }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/></div>}

                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                        </NoteCardWrap>
                    </Cards>
                </>
            }
            {/*    modal custom date*/}
            <Modal
                visible={showModalCustomDate}
                open={showModalCustomDate}
                title="Chọn ngày"
                onOk={handleOk}
                onCancel={handleCloseModalCustomDate}
            >
                <div>
                    <DatePickerWrapper>
                        <RangePicker
                            ranges={{
                                'Hôm nay': [moment(), moment()],
                                'Tuần này': [moment().startOf('week'), moment().endOf('week')],
                                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                                'Năm nay': [moment().startOf('year'), moment().endOf('year')],
                            }}
                            format="DD-MM-YY"
                            onChange={(dates) => {
                                if (dates) {
                                    setStartDateCustom(dates[0].format('YYYY-MM-DD 01:00:00'));
                                    setEndDateCustom(dates[1].format('YYYY-MM-DD 23:00:00'));
                                } else {
                                    setStartDateCustom(null);
                                    setEndDateCustom(null);
                                }
                            }}
                            value={[startDateCustom ? moment(startDateCustom) : null, endDateCustom ? moment(endDateCustom) : null]}


                        />
                    </DatePickerWrapper>
                </div>


            </Modal>
        </div>
    )
}
export default ReportGroup;