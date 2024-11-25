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
import {Doughnut} from "react-chartjs-2";
import useChartData from "../../../../../hooks/useChartData";

const {Title} = Typography;
const {Text} = Typography;
//


const ReportGroup = () => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const dispatch = useDispatch();
    const [data, setData] = useState({});
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
            console.log(Math.round((response?.data?.total_waiting_tasks / totalTask) * 100));
            console.log(Math.round((response?.data?.total_doing_tasks / totalTask) * 100));
            console.log(Math.round((response?.data?.total_completed_tasks / totalTask) * 100));
            console.log(Math.round((response?.data?.total_overdue_tasks / totalTask) * 100));

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
                console.log(text, record);
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
                data: [totalWaitingTaskPercent, totalDoingTaskPercent, totalCompletedTaskPercent, totalOverdueTaskPercent],
                backgroundColor: ["#FFC107", "#2196F3", "#00C853", "#F44336"],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        cutout: "70%", // Để tạo hình tròn rỗng bên trong
        plugins: {
            legend: {
                display: false, // Tắt legend bên trong biểu đồ
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) =>
                        `${tooltipItem.label}: %`, // Hiển thị giá trị dạng phần trăm
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
                            {/*<div>*/}
                            {/*    <Row gutter={25}>*/}
                            {/*        <Col md={24} lg={24}>*/}
                            {/*            <Card*/}
                            {/*                style={{*/}
                            {/*                    borderRadius: "8px",*/}
                            {/*                    background: "#F5F5F5",*/}
                            {/*                    padding: "16px",*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                <Title level={4} style={{marginBottom: 16}}>*/}
                            {/*                    Biểu đồ tổng hợp công việc*/}
                            {/*                </Title>*/}
                            {/*                <div style={{width: "300px", margin: "0 auto"}}>*/}
                            {/*                    <Doughnut data={dataChart} options={options}/>*/}
                            {/*                </div>*/}
                            {/*            </Card>*/}
                            {/*        </Col>*/}
                            {/*    </Row>*/}
                            {/*</div>*/}

                        </NoteCardWrap>
                    </Cards>
                </>
            }

        </div>
    )
}
export default ReportGroup;