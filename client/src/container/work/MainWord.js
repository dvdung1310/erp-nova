import React, {useEffect, useState} from "react";
import {getTaskUnfinishedByUserId} from "../../apis/work/task";
import {getAllUsers} from "../../apis/work/user";
import {createProject, getProjectByUserId} from "../../apis/work/project";
import {getGroupByCeo} from "../../apis/work/group";
import {Col, DatePicker, Form, Input, Row, Spin, List} from "antd";
import ListProject from "./overView/Project/overViewProject/List";
import TaskList from "./overView/Task/overViewTask/TaskList";
import ListGroupComponent from "./overView/Group/overViewGroup/GroupList";
import {PageHeader} from "../../components/page-headers/page-headers";
import {Button} from "../../components/buttons/buttons";
import FeatherIcon from "feather-icons-react";
import {ProjectHeader} from "./overView/Project/style";
import CreateGroup from "./overView/Group/overViewGroup/CreateGroup";
import {useHistory, useLocation} from "react-router-dom";
import {toast} from "react-toastify";
import {useSelector} from "react-redux";
import {getDepartment} from "../../apis/employees/employee";
import CreateProject from "./overView/Project/overViewProject/CreateProject";
import {Modal} from "../../components/modals/antd-modals";
import {BasicFormWrapper} from "../styled";
import {FormControl, FormControlLabel, Radio, RadioGroup} from "@mui/material";
import Avatar from "../../components/Avatar/Avatar";

const dateFormat = 'MM/DD/YYYY';
import RichTextEditor from 'react-rte';
import moment from "moment";
import Header from "../../components/header/header";

const MainWord = () => {
    const role_id = useSelector(state => state?.userRole?.role_id)
    const {state} = useLocation()
    const [loading, setLoading] = useState(false)
    const [listProject, setListProject] = useState([])
    const [listProjectMission, setListProjectMission] = useState([])
    const [listUser, setListUser] = useState([])
    const [listUserLeader, setListUserLeader] = useState([])
    const [listGroup, setListGroup] = useState([])
    const [tasks, setTasks] = useState([])
    const [listDepartments, setListDepartments] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showModalProject, setShowModalProject] = useState(false)
    const history = useHistory()
    const onCancelGroup = () => {
        setShowModal(false)
    }
    const onCancelProject = () => {
        setShowModalProject(false)
    }

    const fetchApi = async () => {
        try {
            setLoading(true)
            if (role_id === 5) {
                const res = await getTaskUnfinishedByUserId()
                setTasks(res.data?.tasks)
            } else if (role_id === 3 || role_id === 4) {
                const [res, users] = await Promise.all([getProjectByUserId(), getAllUsers()]);
                setListProject(res.data?.filter(project => project.project_type === 0))
                setListProjectMission(res.data?.filter(project => project.project_type === 1))
                setListUser(users.data)
            } else {
                const [res, users, departments] = await Promise.all([getGroupByCeo(), getAllUsers(), getDepartment()]);
                setListGroup(res.data)
                setListUser(users.data)
                setListUserLeader(users.data.filter(user => user.role_id < 5))
                setListDepartments(departments.data)
            }

            setLoading(false)
        } catch (e) {
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            setLoading(false)
            console.log(e)
        }
    }
    useEffect(() => {
        if (role_id) {
            fetchApi()
        }
        if (!role_id) {
            setLoading(true)
        }
    }, [role_id, state])
//  modal create task leader
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const location = useLocation();
    const {pathname} = location;
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    //
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());
    const [selectedOption, setSelectedOption] = useState('0');

    const handleChangeEditer = (value) => {
        setEditorState(value);
    };
    ///
    const [selectedMembers, setSelectedMembers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const filteredMembers = listUserLeader && listUserLeader.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectMember = (member) => {
        // Add the member if it's not already selected
        setSelectedMembers(member);
    };
///
    const handleOk = async () => {
        try {
            setIsLoading(true);
            const data = form.getFieldsValue();
            if (!data?.project_name) {
                toast.warn('Tên nhiệm vụ không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            if (!editorState.toString('html')) {
                toast.warn('Mô tả không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            const payload = {
                project_name: data?.project_name,
                project_description: editorState.toString('html'),
                project_start_date: moment().format('YYYY-MM-DD'),
                project_end_date: moment().format('YYYY-MM-DD'),
                group_id: 47,
                project_type: 1,
                leader_id: selectedMembers?.id,
                pathname
            }
            const res = await createProject(payload);
            if (res.error) {
                toast.error('Tạo nhiệm vụ thất bại', {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            toast.success('Tạo nhiệm vụ thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            onCancelProject();
            setSelectedMembers({});
            setEditorState(RichTextEditor.createEmptyValue());
            history.push(pathname, {
                key: 'createProject',
                data: res?.data
            });
            setIsLoading(false);
        } catch (e) {
            toast.error('Tạo nhiệm vụ thất bại', {
                position: "top-right",
                autoClose: 1000,
            })
            setIsLoading(false)
            console.log(e);
        }

    };
    const buttonStyle = { width: '150px' };
    return (
        <div className='home-page' style={{
            minHeight: '100vh'
        }}>
            <div className='content'>
                <ProjectHeader>
                    <PageHeader
                        ghost
                        title={
                            role_id && (role_id === 5 ? 'Danh sách công việc cần làm' :
                                (role_id === 3 || role_id === 4) ? 'Dự án' :
                                    (role_id === 1 || role_id === 2) ? 'Danh sách nhóm' :
                                        '')
                        }
                        buttons={role_id && (role_id === 1 || role_id === 2) && [
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <Button style={buttonStyle} onClick={() => {
                                    history.push('/admin/lam-viec/tinh-kpi')
                                }} key="1" type="secondary" size="default">
                                    <FeatherIcon icon="percent" size={16}/> Tính KPI
                                </Button>
                                <Button style={buttonStyle} onClick={() => setShowModalProject(true)} key="1" type="success" size="default">
                                    <FeatherIcon icon="plus" size={16}/> Thêm nhiệm vụ
                                </Button>
                                <Button style={buttonStyle} onClick={() => {
                                    history.push('/admin/lam-viec/bao-cao-nhom')
                                }} key="1" type="info" size="default">
                                    <FeatherIcon icon="monitor" size={16}/> Xem báo cáo
                                </Button>
                                <Button style={buttonStyle} onClick={() => setShowModal(true)} key="1" type="primary" size="default">
                                    <FeatherIcon icon="plus" size={16}/> Tạo nhóm mới
                                </Button>
                            </div>

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
                                            <TaskList listUser={[]} tasks={tasks} setTasks={setTasks}
                                                      isHome/>
                                            : <div className='text-center mt-5'>Không có công việc nào cần
                                                làm</div>
                                    }
                                </>
                            }
                            {role_id && (role_id === 3 || role_id === 4) && listProject.length > 0 &&
                                <>
                                    <ProjectHeader>
                                        <PageHeader
                                            ghost
                                            title='Nhiệm vụ được giao'
                                        />
                                    </ProjectHeader>
                                    <ListProject listProject={listProjectMission} listUser={listUser}
                                                 isHome/>
                                    <ProjectHeader>
                                        <PageHeader
                                            ghost
                                            title='Dự án đang tham gia'
                                        />
                                    </ProjectHeader>
                                    <ListProject
                                        listProject={listProject}
                                        listUser={listUser} isHome/>
                                </>
                            }
                            {role_id && (role_id === 1 || role_id === 2) &&
                                <ListGroupComponent listDepartments={listDepartments} listGroup={listGroup}
                                                    listUser={listUser}/>}
                        </div>
                    </>}
                </div>
            </div>
            <CreateGroup listDepartments={listDepartments} group_id={null} listUser={listUser}
                         onCancel={onCancelGroup}
                         visible={showModal} admin/>
            {/*    modal create task leader*/}
            <Modal
                className='modal-project'
                type="primary"
                title="Tạo nhiệm vụ"
                visible={showModalProject}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleOk}
                                style={{
                                    backgroundColor: isLoading ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {isLoading ? <div>
                                <Spin/>
                            </div> : 'Tạo nhiệm vụ'}

                        </Button>
                    </div>,
                ]}
                onCancel={onCancelProject}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form form={form} name="createProject" onFinish={handleOk}>
                            <Form.Item name="project_name" label=""
                                       rules={[{required: true, message: 'Vui lòng nhập tên nhiệm vụ!'}]}
                            >
                                <Input placeholder="Tên nhiệm vụ"/>
                            </Form.Item>
                            <Form.Item name="project_description" label="">
                                <div className="group">
                                    <RichTextEditor
                                        style={{minHeight: '100px'}}
                                        className='custom-rich-text-editor'
                                        placeholder="Nhập mô tả nhiệm vụ"
                                        name={'project_description'}
                                        value={editorState}
                                        onChange={handleChangeEditer}/>
                                </div>
                            </Form.Item>
                            <Form.Item style={{marginTop: '10px'}} name="leader" label="Chọn người phụ trách"
                            >
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm thành viên"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{marginBottom: '16px'}}
                                />
                                <List
                                    itemLayout="horizontal"
                                    style={{height: '200px', overflowY: 'auto'}}
                                    dataSource={filteredMembers}
                                    renderItem={(member) => (
                                        <List.Item onClick={() => handleSelectMember(member)}
                                                   style={{cursor: 'pointer'}}>
                                            <List.Item style={{
                                                borderBottom: 'none',
                                                padding: '4px 8px',
                                            }}>
                                                <input type="radio" value={member?.id}
                                                       checked={member?.id === selectedMembers?.id}/>
                                            </List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar width={40} height={40} name={member?.name}
                                                                imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}/>}
                                                title={member.name}
                                                description={
                                                    <>
                                                        <small className="text-muted">{member.email} </small>
                                                        <br/>
                                                        <strong
                                                            className="text-muted">{member?.department_name} - {member?.level_name}</strong>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Form.Item>
                        </Form>
                    </BasicFormWrapper>
                </div>
            </Modal>
        </div>
    );
}
export default MainWord;