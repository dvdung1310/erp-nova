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
import {Spin, Table, Typography} from "antd";
import Avatar from "../../../../../components/Avatar/Avatar";

const {Text} = Typography;
//


const ReportGroup = () => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const dispatch = useDispatch();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const {id} = params;


    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getReportGroup(id);
            setData(response.data);
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

    //
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


    return (
        <div>
            <PageHeader
                ghost
                title={loading ? 'loading...' : `Báo cáo nhóm: ${data?.group_name}`}
            />
            {
                loading ? <div className='spin'><Spin/></div> : <>
                    <Cards headlessM>
                        <NoteCardWrap>
                            <NoteCardGroup data={data}/>
                            <div>
                                <div style={{padding: "16px", background: "#fff", borderRadius: "8px"}}>
                                    <Typography.Title level={4} style={{marginBottom: 16}}>
                                        Kết quả làm việc
                                    </Typography.Title>
                                    <Table
                                        columns={columns}
                                        dataSource={data?.taskByUsers}
                                        pagination={false}
                                        bordered
                                        style={{borderRadius: "8px", overflow: "hidden"}}
                                    />
                                </div>
                            </div>
                        </NoteCardWrap>
                    </Cards>
                </>
            }

        </div>
    )
}
export default ReportGroup;