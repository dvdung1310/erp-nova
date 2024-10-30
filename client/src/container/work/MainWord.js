import {getItem} from "../../utility/localStorageControl";
import React, {useEffect, useState} from "react";
import {getTaskUnfinishedByUserId} from "../../apis/work/task";
import {getAllUsers} from "../../apis/work/user";
import {getProjectByUserId} from "../../apis/work/project";
import {getGroupByCeo} from "../../apis/work/group";
import {Spin} from "antd";
import TaskList from "./overView/Task/overViewTask/TaskList";
import List from "./overView/Project/overViewProject/List";
import ListGroupComponent from "./overView/Group/overViewGroup/GroupList";
import {PageHeader} from "../../components/page-headers/page-headers";
import {Button} from "../../components/buttons/buttons";
import FeatherIcon from "feather-icons-react";
import {ProjectHeader} from "./overView/Project/style";
import CreateGroup from "./overView/Group/overViewGroup/CreateGroup";
import {useLocation} from "react-router-dom";

const MainWord = () => {
    const role_id = getItem('role_id')
    const {state} = useLocation()
    const [loading, setLoading] = useState(false)
    const [listProject, setListProject] = useState([])
    const [listUser, setListUser] = useState([])
    const [listGroup, setListGroup] = useState([])
    const [tasks, setTasks] = useState([])
    const [showModal, setShowModal] = useState(false)
    const onCancelGroup = () => {
        setShowModal(false)
    }

    const fetchApi = async () => {
        try {
            setLoading(true)
            if (role_id === 5) {
                const res = await getTaskUnfinishedByUserId()
                setTasks(res.data?.tasks)

            } else if (role_id === 3 || role_id === 4) {
                const [res, users] = await Promise.all([getProjectByUserId(), getAllUsers()]);
                setListProject(res.data)
                setListUser(users.data)
            } else {
                const [res, users] = await Promise.all([getGroupByCeo(), getAllUsers()]);
                setListGroup(res.data)
                setListUser(users.data)
            }

            setLoading(false)
        } catch (e) {
            setLoading(false)
            console.log(e)
        }
    }
    useEffect(() => {
        fetchApi()
    }, [role_id, state])

    return (
        <div className='home-page' style={{
            minHeight: '100vh'
        }}>
            <div className='content'>
                <ProjectHeader>
                    <PageHeader
                        ghost
                        title={
                            role_id === 5 ? 'Danh sách công việc cần làm' :
                                (role_id === 3 || role_id === 4) ? 'Danh sách dự án' :
                                    (role_id === 1 || role_id === 2) ? 'Danh sách nhóm' :
                                        ''
                        }
                        buttons={role_id && (role_id === 1 || role_id === 2) && [
                            <Button onClick={() => setShowModal(true)} key="1" type="primary" size="default">
                                <FeatherIcon icon="plus" size={16}/> Tạo nhóm mới
                            </Button>,
                        ]}
                    />
                </ProjectHeader>
                <div className='body'>
                    {loading ? <div className='spin'>
                        <Spin/>
                    </div> : <>
                        <div className="_container">

                            {role_id && role_id === 5 &&
                                <>
                                    {
                                        tasks.length > 0 ?
                                            <TaskList listUser={[]} tasks={tasks} setTasks={setTasks}/>
                                            : <div className='text-center mt-5'>Không có công việc nào</div>
                                    }
                                </>
                            }
                            {role_id && (role_id === 3 || role_id === 4) && listProject.length > 0 &&
                                <List
                                    listProject={listProject}
                                    listUser={listUser}/>}
                            {role_id && (role_id === 1 || role_id === 2) &&
                                <ListGroupComponent listGroup={listGroup} listUser={listUser}/>}
                        </div>
                    </>}
                </div>
            </div>
            <CreateGroup group_id={null} listUser={listUser} onCancel={onCancelGroup} visible={showModal} admin/>
        </div>
    );
}
export default MainWord;