import {ProjectList} from "../../Project/style";
import {Progress, Table, Input} from "antd";
import {Cards} from "../../../../../components/cards/frame/cards-frame";
import React, {useEffect, useState} from "react";
import {checkStatus} from "../../../../../utility/checkValue";
import moment from "moment";
import './WorkTaskDay.scss';
import {getTaskInDay} from "../../../../../apis/work/task";

const WorkTaskDay = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const getTasks = async () => {
        setLoading(true);
        try {
            const response = await getTaskInDay();
            setTasks(response?.data?.tasks);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        getTasks();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredTasks = tasks.filter(task => {
        const taskNameMatch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase());
        const userNameMatch = task.users.some(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const projectNameMatch = task.project.project_name.toLowerCase().includes(searchTerm.toLowerCase());
        const createByUserNameMatch = task.create_by_user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const taskStatusMatch = checkStatus(task.task_status)?.status.toLowerCase().includes(searchTerm.toLowerCase());
        const taskProgressMatch = task.task_progress.toString().includes(searchTerm);
        const taskStartDateMatch = moment(task.task_start_date).format('DD-MM-YYYY').includes(searchTerm);
        const taskEndDateMatch = moment(task.task_end_date).format('DD-MM-YYYY').includes(searchTerm);
        return taskNameMatch || userNameMatch || projectNameMatch || createByUserNameMatch || taskStatusMatch || taskProgressMatch || taskStartDateMatch || taskEndDateMatch;
    });

    const [state, setState] = useState({
        current: 1,
        pageSize: 10,
    });

    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            align: 'center',
            className: 'nowrap-cell',
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'users',
            key: 'users',
            className: 'cell-name',
            render: (users) => users.map(user => user.name).join(', '),
        },
        {
            title: 'Tên công việc',
            dataIndex: 'task_name',
            key: 'task_name',
            className: 'cell-name',
        },
        {
            title: 'Tên dự án',
            dataIndex: ['project', 'project_name'],
            key: 'project_name',
            className: 'cell-name',
        },
        {
            title: 'Người giao việc',
            dataIndex: ['create_by_user', 'name'],
            key: 'create_by_user',
            className: 'nowrap-cell',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'task_status',
            key: 'task_status',
            className: 'nowrap-cell',
            render: (task_status) => (
                <span
                    style={{
                        backgroundColor: checkStatus(task_status)?.color,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: '#fff',
                    }}
                >
                                    {checkStatus(task_status)?.status}
                                </span>
            ),
        },
        {
            title: 'Tiến độ',
            dataIndex: 'task_progress',
            key: 'task_progress',
            className: 'nowrap-cell',
            render: (task_progress) => (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Progress percent={task_progress} size="small" style={{width: '80%'}}/>
                </div>
            ),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'task_start_date',
            key: 'task_start_date',
            className: 'nowrap-cell',
            render: (task_start_date) => (
                <span>{moment(task_start_date).format('DD-MM-YYYY')}</span>
            ),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'task_end_date',
            key: 'task_end_date',
            className: 'nowrap-cell',
            render: (task_end_date) => (
                <span>{moment(task_end_date).format('DD-MM-YYYY')}</span>
            ),
        },
    ];

    const dataSource = filteredTasks.map((task, index) => ({
        ...task,
        key: index + 1,
    }));

    return (
        <div className='work-task-day'>
            <Cards headless>
                <ProjectList>
                    <div>
                        <Input
                            placeholder="Tìm kiếm ..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{marginBottom: '16px'}}
                        />
                    </div>
                    <div className="table-responsive">
                        <Table
                            pagination={{
                                current: state.current,
                                pageSize: state.pageSize,
                                total: dataSource.length,
                                onChange: (page, pageSize) => {
                                    setState({
                                        ...state,
                                        current: page,
                                        pageSize,
                                    });
                                }
                            }}
                            loading={loading}
                            dataSource={dataSource}
                            columns={columns}
                            bordered
                            className="custom-table"
                        />
                    </div>
                </ProjectList>
            </Cards>
        </div>
    );
};

export default WorkTaskDay;