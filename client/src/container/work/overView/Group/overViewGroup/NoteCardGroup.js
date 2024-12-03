/* eslint-disable react/prop-types */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Card} from '../../../../../components/note/style';
import {Cards} from '../../../../../components/cards/frame/cards-frame';

import {MdOutlineRemoveRedEye} from "react-icons/md";
import {Col, Row} from "antd";
import {Modal} from "../../../../../components/modals/antd-modals";
import TaskList from "../../Task/overViewTask/TaskList";
import List from "../../Project/overViewProject/List";

const NoteCardGroup = ({data}) => {
    const {
        total_projects,
        total_tasks,
        total_completed_tasks,
        total_doing_tasks,
        total_waiting_tasks,
        total_overdue_tasks,
        list_completed_tasks,
        list_doing_tasks,
        list_overdue_tasks,
        list_projects,
        list_waiting_tasks,
        list_tasks,
        taskByUsers
    } = data;
    const [showModalTask, setShowModalTask] = useState(false)
    const [showModalProject, setShowModalProject] = useState(false)
    const [tasks, setTasks] = useState([])
    const [listProject, setListProject] = useState([])
    const handleShowModalProject = () => {
        setShowModalProject(true)
    }
    const handleCloseModal = () => {
        setShowModalTask(false)
        setShowModalProject(false)
    }
    const handleShowModalTask = () => {
        setShowModalTask(true)
    }
    const handleClickViewClick = (type) => {
        switch (type) {
            case 'project':
                console.log(list_projects)
                setListProject(list_projects)
                handleShowModalProject()
                break;
            case 'completed':
                setTasks(list_completed_tasks)
                handleShowModalTask()
                break;
            case 'doing':
                setTasks(list_doing_tasks)
                handleShowModalTask()
                break;
            case 'waiting':
                setTasks(list_waiting_tasks)
                handleShowModalTask()
                break;
            case 'overdue':
                setTasks(list_overdue_tasks)
                handleShowModalTask()
                break;
            case 'all-tasks':
                setTasks(list_tasks)
                handleShowModalTask()
                break;
            default:
                break;
        }
    }


    return (
        <div>
            <Row gutter={24}>
                <Col xxl={8} xl={8} lg={8} sm={12} xs={24}>
                    <Card className='total_projects'>
                        <Cards headless>
                            <h4>
                      <span>
                          Tổng số dự án
                          <span className={`status-bullet`}/>
                      </span>
                                <div title='Xem chi tiết' onClick={() => handleClickViewClick('project')}>
                                    <MdOutlineRemoveRedEye size={20} style={{cursor: 'pointer'}}/>
                                </div>
                            </h4>
                            <p>{total_projects}</p>
                            <div className="actions">
                            </div>
                        </Cards>
                    </Card>
                </Col>
                <Col xxl={8} xl={8} lg={8} sm={12} xs={24}>
                    <Card className='total_tasks'>
                        <Cards headless>
                            <h4>
                      <span>
                          Tổng số công việc
                          <span className={`status-bullet`}/>
                      </span>
                                <div title='Xem chi tiết' onClick={() => handleClickViewClick('all-tasks')}>
                                    <MdOutlineRemoveRedEye size={20} style={{cursor: 'pointer'}}/>
                                </div>
                            </h4>
                            <p>{total_tasks}</p>
                            <div className="actions">
                            </div>
                        </Cards>
                    </Card>
                </Col>
                <Col xxl={8} xl={8} lg={8} sm={12} xs={24}>
                    <Card className='total_waiting_tasks'>
                        <Cards headless>
                            <h4>
                      <span>
                          Tổng số công việc đang chờ
                          <span className={`status-bullet`}/>
                      </span>
                                <div title='Xem chi tiết' onClick={() => handleClickViewClick('waiting')}>
                                    <MdOutlineRemoveRedEye size={20} style={{cursor: 'pointer'}}/>
                                </div>
                            </h4>
                            <p>{total_waiting_tasks}</p>
                            <div className="actions">
                            </div>
                        </Cards>
                    </Card>
                </Col>

                <Col xxl={8} xl={8} lg={8} sm={12} xs={24}>
                    <Card className='total_doing_tasks'>
                        <Cards headless>
                            <h4>
                      <span>
                          Tổng số công việc đang làm
                          <span className={`status-bullet`}/>
                      </span>
                                <div title='Xem chi tiết' onClick={() => handleClickViewClick('doing')}>
                                    <MdOutlineRemoveRedEye size={20} style={{cursor: 'pointer'}}/>
                                </div>
                            </h4>
                            <p>{total_doing_tasks}</p>
                            <div className="actions">
                            </div>
                        </Cards>
                    </Card>
                </Col>
                <Col xxl={8} xl={8} lg={8} sm={12} xs={24}>
                    <Card className='total_completed_tasks'>
                        <Cards headless>
                            <h4>
                      <span>
                          Tổng số công việc hoàn thành
                          <span className={`status-bullet`}/>
                      </span>
                                <div title='Xem chi tiết' onClick={() => handleClickViewClick('completed')}>
                                    <MdOutlineRemoveRedEye size={20} style={{cursor: 'pointer'}}/>
                                </div>
                            </h4>
                            <p>{total_completed_tasks}</p>
                            <div className="actions">
                            </div>
                        </Cards>
                    </Card>
                </Col>
                <Col xxl={8} xl={8} lg={8} sm={12} xs={24}>
                    <Card className='total_overdue_tasks'>
                        <Cards headless>
                            <h4>
                      <span>
                          Tổng số công việc quá hạn
                          <span className={`status-bullet`}/>
                      </span>
                                <div title='Xem chi tiết' onClick={() => handleClickViewClick('overdue')}>
                                    <MdOutlineRemoveRedEye size={20} style={{cursor: 'pointer'}}/>
                                </div>
                            </h4>
                            <p>{total_overdue_tasks}</p>
                            <div className="actions">
                            </div>
                        </Cards>
                    </Card>
                </Col>
            </Row>
            {/*    modal show task*/}
            <Modal
                type='primary'
                title="Danh sách công việc"
                visible={showModalTask}
                className='modal-main'
                onCancel={handleCloseModal}
                footer={null}
            >
                <div>
                    {
                        tasks?.length > 0 ? <>
                            <TaskList listUser={[]} tasks={tasks} setTasks={setTasks} isHome/>
                        </> : <div className='text-center mt-5'>Không có công việc nào</div>
                    }

                </div>
            </Modal>
            {/*    modal show project*/}
            <Modal
                type='primary'
                title="Danh sách dự án"
                visible={showModalProject}
                className='modal-main'
                onCancel={handleCloseModal}
                footer={null}
            >
                <div>
                    {
                        list_projects?.length > 0 ? <>
                            <List
                                listProject={listProject}
                                listUser={[]} isHome/>
                        </> : <div className='text-center mt-5'>Không có dự án nào</div>
                    }

                </div>
            </Modal>
        </div>
    );
};

NoteCardGroup.propTypes = {
    data: PropTypes.object,
};
export default NoteCardGroup;
