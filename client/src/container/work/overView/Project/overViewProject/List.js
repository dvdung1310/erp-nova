import React, {useState, useEffect} from 'react';
import {Row, Col, Table, Progress, Pagination, Tag} from 'antd';
import {useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import Heading from '../../../../../components/heading/heading';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {ProjectPagination, ProjectListTitle, ProjectListAssignees, ProjectList} from '../style';
import {Dropdown} from '../../../../../components/dropdown/dropdown';

// eslint-disable-next-line react/prop-types
function ProjectLists({listProject, listUser}) {
    const project = useSelector((state) => state.projects.data);
    console.log(listProject);
    const [state, setState] = useState({
        projects: listProject,
        current: 0,
        pageSize: 0,
    });
    const {projects} = state;
    useEffect(() => {
        if (listProject) {
            setState({
                projects: listProject,
            });
        }
    }, [listProject]);
    const onShowSizeChange = (current, pageSize) => {
        setState({...state, current, pageSize});
    };
    const onHandleChange = (current, pageSize) => {
        // You can create pagination in here
        setState({...state, current, pageSize});
    };
    const dataSource = [];
    if (projects?.length)
        projects.map((value) => {
            // eslint-disable-next-line camelcase
            const {
                project_id,
                project_name,
                project_status,
                project_members,
                success,
                project_start_date,
                project_end_date
            } = value;
            return dataSource.push({
                // eslint-disable-next-line camelcase
                key: project_id,
                project_name: (
                    <ProjectListTitle>
                        <Heading as="h4">
                            {/* eslint-disable-next-line camelcase */}
                            <Link to={`/admin/project/projectDetails/${project_id}`}>{project_name}</Link>
                        </Heading>
                    </ProjectListTitle>
                ),
                // eslint-disable-next-line camelcase
                project_start_date: <span className="date-started">{project_start_date}</span>,
                // eslint-disable-next-line camelcase
                project_end_date: <span className="date-finished">{project_end_date}</span>,
                project_members: (
                    <ProjectListAssignees>
                        <ul>
                            {
                                project_members.map((member, index) => {
                                    return (
                                        <li key={index}>
                                            <img src={`${member?.user?.avatar}`} alt=""/>
                                        </li>
                                    );
                                })
                            }

                        </ul>
                    </ProjectListAssignees>
                ),
                // eslint-disable-next-line camelcase
                project_status: <Tag className={project_status}>{project_status}</Tag>,
                // completion: (
                //     <div className="project-list-progress">
                //         <Progress percent={status === 'complete' ? 100 : percentage} strokeWidth={5}
                //                   className="progress-primary"/>
                //         <p>12/15 Task Completed</p>
                //     </div>
                // ),
                action: (
                    <Dropdown
                        className="wide-dropdwon"
                        content={
                            <>
                                <Link to="#">View</Link>
                                <Link to="#">Edit</Link>
                                <Link to="#">Delete</Link>
                            </>
                        }
                    >
                        <Link to="#">
                            <FeatherIcon icon="more-horizontal" size={18}/>
                        </Link>
                    </Dropdown>
                ),
            });
        });
    const columns = [
        {
            title: 'Tên dự án',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'project_start_date',
            key: 'project_start_date',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'project_end_date',
            key: 'project_end_date',
        },
        {
            title: 'Thành viên',
            dataIndex: 'project_members',
            key: 'project_members',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'project_status',
            key: 'project_status',
        },
        {
            title: 'Hoàn thành',
            dataIndex: 'completion',
            key: 'completion',
        },

        {
            title: '',
            dataIndex: 'action',
            key: 'action',
        },
    ];
    return (
        <Row gutter={25}>
            <Col xs={24}>
                <Cards headless>
                    <ProjectList>
                        <div className="table-responsive">
                            <Table pagination={false} dataSource={dataSource} columns={columns}/>
                        </div>
                    </ProjectList>
                </Cards>
            </Col>
            <Col xs={24} className="pb-30">
                <ProjectPagination>
                    {projects?.length ? (
                        <Pagination
                            onChange={onHandleChange}
                            showSizeChanger
                            onShowSizeChange={onShowSizeChange}
                            pageSize={10}
                            defaultCurrent={1}
                            total={40}
                        />
                    ) : null}
                </ProjectPagination>
            </Col>
        </Row>
    );
}

export default ProjectLists;