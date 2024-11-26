/* eslint-disable object-shorthand */
import {PageHeader} from "../../../../../components/page-headers/page-headers";
import React, {useEffect, useState} from "react";
import {Cards} from "../../../../../components/cards/frame/cards-frame";
import {NoteCardWrap} from "../../../../note/style";
import {useDispatch, useSelector} from "react-redux";
import {noteDragData} from "../../../../../redux/note/actionCreator";
import arrayMove from "array-move";
import NoteCardGroup from "./NoteCardGroup";
import {getReportGroup} from "../../../../../apis/work/group";
import {useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {Card, Col, Row, Spin, Table, Typography} from "antd";
import Avatar from "../../../../../components/Avatar/Avatar";
import {ChartjsDonutChart} from "../../../../../components/charts/chartjs";
import {Doughnut, HorizontalBar} from "react-chartjs-2";
import useChartData from "../../../../../hooks/useChartData";

const {Title} = Typography;
const {Text} = Typography;
//


const ReportGroup = () => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const dispatch = useDispatch();
    const [data, setData] = useState({});
    const [taskByUsers, setTaskByUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const {id} = params;
    const [totalWaitingTaskPercent, setTotalWaitingTaskPercent] = useState(0);
    const [totalDoingTaskPercent, setTotalDoingTaskPercent] = useState(0);
    const [totalCompletedTaskPercent, setTotalCompletedTaskPercent] = useState(0);
    const [totalOverdueTaskPercent, setTotalOverdueTaskPercent] = useState(0);


    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getReportGroup(id);
            setData(response.data);
            const totalTask = response?.data?.total_tasks;
            setTotalWaitingTaskPercent(Math.round((response?.data?.total_waiting_tasks / totalTask) * 100));
            setTotalDoingTaskPercent(Math.round((response?.data?.total_doing_tasks / totalTask) * 100));
            setTotalCompletedTaskPercent(Math.round((response?.data?.total_completed_tasks / totalTask) * 100));
            setTotalOverdueTaskPercent(Math.round((response?.data?.total_overdue_tasks / totalTask) * 100));
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
        fetchData();
    }, [id]);

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
    ];
    // chart
    const dataChart = {
        labels: ["Đang chờ", "Đang làm", "Hoàn thành", "Quá hạn"],
        datasets: [
            {
                data: [totalWaitingTaskPercent, totalDoingTaskPercent, totalCompletedTaskPercent, totalOverdueTaskPercent], // Dữ liệu ví dụ
                backgroundColor: ["#ed6c0282", "#0288d175", "#42a04787", "#d32f2f99"], // Màu sắc từng phần
                hoverBackgroundColor: ["#ed6c02", "#0288d1", "#42a047", "#e15151"],
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

    const _data = {
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
        ],
    };

    const _options = {
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
            position: "top",
            labels: {
                fontSize: 12,
                padding: 15,
                boxWidth: 10,
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



    return (
        <div>
            <PageHeader
                ghost
                title={loading ? 'loading...' : `Báo cáo nhóm: ${data?.group_name}`}
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
                                                <Doughnut data={dataChart} options={options}/>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col md={24} lg={24}>
                                        <Card
                                            title="Biểu đồ tổng hợp thành viên"
                                        >
                                            <div style={{height: "300px", margin: "0 auto"}}>
                                                <HorizontalBar data={_data} options={_options}/>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>

                        </NoteCardWrap>
                    </Cards>
                </>
            }

        </div>
    )
}
export default ReportGroup;