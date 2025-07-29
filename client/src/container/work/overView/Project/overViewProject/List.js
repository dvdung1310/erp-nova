import React, {useState, useEffect} from 'react';
import RichTextEditor from 'react-rte';
import {
    Row,
    Col,
    Table,
    Progress,
    Pagination,
    Tag,
    Button,
    Form,
    Input,
    DatePicker,
    Spin,
    Radio,
    List,
    Badge, Select, InputNumber
} from 'antd';
import {useSelector} from 'react-redux';
import {Link, useHistory, useLocation} from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import Heading from '../../../../../components/heading/heading';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {ProjectPagination, ProjectListTitle, ProjectListAssignees, ProjectList} from '../style';
import {Dropdown} from '../../../../../components/dropdown/dropdown';
import moment from "moment";
import Avatar from "../../../../../components/Avatar/Avatar";
import {checkRole, checkStatus, checkStatusProject, checkStatusProjectByTask} from "../../../../../utility/checkValue";
import {MdContentCopy, MdDelete, MdEdit, MdGroups, MdOutlineDateRange, MdOutlineSettings} from "react-icons/md";
import {GrInProgress} from "react-icons/gr";
import {Modal} from "../../../../../components/modals/antd-modals";
import {BasicFormWrapper} from "../../../../styled";
import {
    deleteProject, joinProject,
    updateEndDateProject, updateLeaderProject, updateMemberProject,
    updateNameProject, updateNotifyBeforeEndTimeProject, updateProjectType,
    updateStartDateProject, updateStatusProject
} from "../../../../../apis/work/project";
import {toast} from "react-toastify";
import {FaUserTie} from "react-icons/fa";
import CopyProject from "./CopyProject";
import {IoEnterOutline} from "react-icons/io5";
import {FiType} from "react-icons/fi";

const dateFormat = 'MM/DD/YYYY';

// eslint-disable-next-line react/prop-types
function ProjectLists({group_id, listProject, listUser = [], isHome}) {
    const [listUserData, setListUser] = useState(listUser);
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [form] = Form.useForm();
    const history = useHistory();
    const location = useLocation();
    const {pathname} = location;
    console.log(group_id)
    const [state, setState] = useState({
        projects: listProject,
        current: 0,
        pageSize: 0,
    });
    const [selectedProject, setSelectedProject] = useState(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [notifyBeforeEndTime, setNotifyBeforeEndTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    //
    const [showModalUpdateLeader, setShowModalUpdateLeader] = useState(false);
    const [showModalUpdateName, setShowModalUpdateName] = useState(false);
    const [showModalUpdateStatus, setShowModalUpdateStatus] = useState(false);
    const [showModalUpdateMembers, setShowModalUpdateMembers] = useState(false);
    const [showModalUpdateStartDate, setShowModalUpdateStartDate] = useState(false);
    const [showModalUpdateEndDate, setShowModalUpdateEndDate] = useState(false);
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [showModalUpdateType, setShowModalUpdateType] = useState(false);
    //
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());
    const handleChangeEditer = (value) => {
        setEditorState(value);
    };
    const handleShowModalUpdateLeader = () => {
        setShowModalUpdateLeader(true);
    }
    const handleShowModalUpdateType = () => {
        setShowModalUpdateType(true);
    }
    const handleShowModalUpdateName = () => {
        setShowModalUpdateName(true);
    }
    const handleShowModalUpdateStatus = () => {
        setShowModalUpdateStatus(true);
    }
    const handleShowModalUpdateMembers = () => {
        setShowModalUpdateMembers(true);
    }
    const handleShowModalUpdateStartDate = () => {
        setShowModalUpdateStartDate(true);
    }
    const handleShowModalUpdateEndDate = () => {
        setShowModalUpdateEndDate(true);
    }
    const handleShowModalConfirm = () => {
        setShowModalConfirm(true);
    }
    const [showMemberExit, setShowMemberExit] = useState(true);
    const [dataJoinProject, setDataJoinProject] = useState({
        email_to: '',
        message: ''
    });
    const handleChangeJoinProject = (e) => {
        setDataJoinProject({
            ...dataJoinProject,
            [e.target.name]: e.target.value
        });
    };
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedLeader, setSelectedLeader] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    //
    const [showModalCopy, setShowModalCopy] = useState(false);
    const [showModalSetting, setShowModalSetting] = useState(false);
    const handleShowModalSetting = () => {
        setShowModalSetting(true);
    }

    const handleShowModalCopy = () => {
        setShowModalCopy(true);
    }

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleSelectMember = (member) => {
        // Add the member if it's not already selected
        if (!selectedMembers.some((selected) => selected.email === member.email)) {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const handleRemoveMember = (email) => {
        // Remove the member by email
        setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
    };
    const filteredMembers = listUserData?.filter(
        (member) =>
            member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSelectLeader = (member) => {
        // Add the member if it's not already selected
        setSelectedLeader(member);
    };

    const handleCancel = () => {
        setShowModalUpdateName(false);
        setShowModalUpdateStatus(false);
        setShowModalUpdateMembers(false);
        setShowModalUpdateStartDate(false);
        setShowModalUpdateEndDate(false);
        setShowModalConfirm(false);
        setShowModalUpdateLeader(false);
        setShowModalCopy(false);
        setShowModalSetting(false);
        setShowModalUpdateType(false)
    }
    //
    const {projects} = state;
    useEffect(() => {
        if (listProject) {
            setState({
                projects: listProject,
            });
        }
    }, [listProject]);
    // edit project
    const handleEditClick = (type, value) => {
        switch (type) {
            case 'name':
                form.setFieldsValue({
                    project_name: value?.project_name,
                });
                setSelectedProject(value);
                setEditorState(value?.project_description ? RichTextEditor.createValueFromString(value?.project_description, 'html') : RichTextEditor.createEmptyValue());
                handleShowModalUpdateName();
                break;
            case 'status':
                form.setFieldsValue({
                    project_status: value?.project_status,
                });
                setSelectedProject(value);
                handleShowModalUpdateStatus();
                break;
            case 'type':
                setSelectedProject(value);
                handleShowModalUpdateType();
                break;
            case 'members':
                setSelectedProject(value);
                // eslint-disable-next-line no-case-declarations
                const members = value?.project_members?.map(member => {
                    return {
                        id: member?.user?.id,
                        name: member?.user?.name,
                        email: member?.user?.email,
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        avatar: member?.user?.avatar ? LARAVEL_SERVER + member?.user?.avatar : ''
                    }
                }) || [];
                setSelectedMembers(members);
                setShowMemberExit(true);
                handleShowModalUpdateMembers();
                break;
            case 'start_date':
                setSelectedProject(value);
                form.setFieldsValue({
                    project_start_date: moment(value?.project_start_date),
                });
                handleShowModalUpdateStartDate();
                break;
            case 'end_date':
                setSelectedProject(value);
                form.setFieldsValue({
                    project_end_date: moment(value?.project_end_date),
                });
                handleShowModalUpdateEndDate();
                break;
            case 'delete':
                setSelectedProject(value);
                handleShowModalConfirm();
                break;
            case 'leader':
                setSelectedProject(value);
                setSelectedLeader({
                    id: value?.leader_id,
                });
                handleShowModalUpdateLeader();
                break;
            case 'copy':
                setSelectedProject(value);
                handleShowModalCopy();
                break;
            case 'setting':
                setSelectedProject(value);
                setNotifyBeforeEndTime(value?.notify_before_end_time);
                handleShowModalSetting();
                break;
            default:
                break;
        }
    };
    const handleUpdateName = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                project_name: selectedProject?.project_name,
                project_description: editorState.toString('html'),
                pathname
            }
            const res = await updateNameProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật tên dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);

        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleUpdateStartDate = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                project_start_date: selectedProject?.project_start_date,
                pathname
            }
            const res = await updateStartDateProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật ngày bắt đầu dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);

        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleUpdateEndDate = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                project_end_date: selectedProject?.project_end_date,
                pathname
            }
            const res = await updateEndDateProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật ngày bắt đầu dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);

        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleDeleteProject = async () => {
        try {
            setLoadingUpdate(true);
            const res = await deleteProject(selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Xóa dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'deleteProject',
                data: res?.data
            });

            setLoadingUpdate(false);
        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleUpdateStatus = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                project_status: selectedProject?.project_status,
                pathname
            }
            const res = await updateStatusProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật trạng thái dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);

        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleUpdateMembers = async () => {
        try {
            setLoadingUpdate(true);
            const members = selectedMembers.map(member => member?.id);
            const payload = {
                members,
                pathname
            }
            const res = await updateMemberProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật thành viên dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);
        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }

    }
    const handleJoinProject = async () => {
        try {
            setLoadingUpdate(true);
            if (!dataJoinProject?.email_to) {
                toast.warn('Vui lòng nhập email', {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            if (listUserData?.some(user => user.email === dataJoinProject?.email_to)) {
                toast.warn('Người dùng đã tồn tại trong dự án', {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            const payload = {
                email_to: dataJoinProject?.email_to,
                message: dataJoinProject?.message,
                pathname
            }
            const res = await joinProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Mời tham gia dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            setListUser([...listUserData, res?.data]);
            form.resetFields();
            setDataJoinProject({
                email_to: '',
                message: ''
            })
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);
        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleUpdateLeader = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                leader_id: selectedLeader?.id,
                pathname
            }
            const res = await updateLeaderProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật người phụ trách dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);
        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    const handleUpdateRemind = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                notify_before_end_time: notifyBeforeEndTime,
                pathname
            }
            const res = await updateNotifyBeforeEndTimeProject(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật nhắc nhở dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);

        } catch (e) {
            console.log(e)
            toast.error('Đã có lỗi xảy ra', {
                autoClose: 1000,
                position: 'top-right'
            })
        }
        console.log(selectedProject)
        console.log(notifyBeforeEndTime)
    }
    const handleUpdateType = async () => {
        try {
            setLoadingUpdate(true);
            const payload = {
                project_type: selectedProject?.project_type,
            }
            const res = await updateProjectType(payload, selectedProject?.project_id);
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000,
                })
                setLoadingUpdate(false);
                return;
            }
            toast.success('Cập nhật loại dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            handleCancel();
            history.push(pathname, {
                key: 'updateProject',
                data: res?.data
            });

            setLoadingUpdate(false);

        } catch (e) {
            setLoadingUpdate(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(e);
        }
    }
    //
    const dataSource = [];
    if (projects?.length)
        projects.map((value, index) => {
            // eslint-disable-next-line camelcase
            const {
                project_id,
                project_name,
                project_status,
                group_id,
                project_members,
                project_monitor_users,
                leader,
                success,
                project_start_date,
                project_end_date,
                completed_tasks,
                total_tasks,
            } = value;
            return dataSource.push({
                // eslint-disable-next-line camelcase
                key: index + 1,

                project_name: (
                    <ProjectListTitle>
                        <Heading as="h4">
                            {/* eslint-disable-next-line camelcase */}
                            <Link to={`/admin/lam-viec/du-an/${project_id}`}>{project_name}</Link>
                        </Heading>
                    </ProjectListTitle>
                ),
                // eslint-disable-next-line camelcase
                project_start_date: <span
                    className="date-started">{moment(project_start_date).format('DD-MM-YYYY')}</span>,
                // eslint-disable-next-line camelcase
                project_end_date: <span
                    className="date-finished">{moment(project_end_date).format('DD-MM-YYYY')}</span>,
                project_members: (
                    <ProjectListAssignees>
                        <ul>
                            {
                                project_members.slice(0, 5).map((member, index) => {
                                    return (
                                        <div className='d-flex align-items-center'
                                             style={{
                                                 marginLeft: '-10px',
                                                 cursor: 'default'
                                             }}
                                             key={index}
                                             title={member?.user?.name}
                                        >
                                            <li key={index}>
                                                <Avatar width={30} height={30}
                                                        name={member?.user?.name}
                                                        imageUrl={member?.user?.avatar ? `${LARAVEL_SERVER}${member?.user?.avatar}` : ""}
                                                />
                                            </li>
                                        </div>
                                    );
                                })
                            }
                            {
                                project_members.length > 5 && (
                                    <div className='d-flex align-items-center'
                                         style={{
                                             marginLeft: '-10px',
                                             cursor: 'default'
                                         }}
                                         title={`+${project_members.length - 5} more`}
                                    >
                                        <li>
                                            <Avatar width={30} height={30}
                                                    name={`+ ${project_members.length - 5}`}
                                            />
                                        </li>
                                    </div>
                                )
                            }

                        </ul>
                    </ProjectListAssignees>
                ),
                monitor: (
                    group_id && (
                        <ProjectListAssignees>
                            <ul>
                                {
                                    project_monitor_users?.slice(0, 5)?.map((member, index) => {
                                        return (
                                            <div className='d-flex align-items-center'
                                                 style={{
                                                     marginLeft: '-10px',
                                                     cursor: 'default'
                                                 }}
                                                 key={index}
                                                 title={member?.name}
                                            >
                                                <li key={index}>
                                                    <Avatar width={30} height={30}
                                                            name={member?.name}
                                                            imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ""}
                                                    />
                                                </li>
                                            </div>
                                        );
                                    })
                                }
                                {
                                    project_monitor_users?.length > 5 && (
                                        <div className='d-flex align-items-center'
                                             style={{
                                                 marginLeft: '-10px',
                                                 cursor: 'default'
                                             }}
                                             title={`+${project_members.length - 5} more`}
                                        >
                                            <li>
                                                <Avatar width={30} height={30}
                                                        name={`+ ${project_members.length - 5}`}
                                                />
                                            </li>
                                        </div>
                                    )
                                }
                            </ul>
                        </ProjectListAssignees>)
                ),
                leader: (
                    <div className='d-flex align-items-center'
                         style={{
                             marginLeft: '-10px',
                             cursor: 'default'
                         }}
                         title={leader?.name}
                    >
                        <li key={index}>
                            <Avatar width={30} height={30}
                                    name={leader?.name}
                                    imageUrl={leader?.avatar ? `${LARAVEL_SERVER}${leader?.avatar}` : ""}
                            />
                        </li>
                    </div>
                ),
                project_status: <Tag style={{
                    padding: "4px 8px",
                    backgroundColor: (completed_tasks === total_tasks && total_tasks !== 0) ? '#2e7d32' : checkStatusProject(project_status)?.color,
                }}>{(completed_tasks === total_tasks && total_tasks !== 0) ? 'Hoàn thành' : checkStatusProject(project_status)?.status}</Tag>,
                success: (
                    <div className="project-list-progress">
                        <Progress
                            percent={
                                // eslint-disable-next-line no-restricted-globals
                                isNaN(Number(completed_tasks)) || isNaN(Number(total_tasks)) || Number(total_tasks) === 0
                                    ? 0
                                    : ((Number(completed_tasks) / Number(total_tasks)) * 100).toFixed(0)
                            }
                            strokeWidth={5}
                            className="progress-primary"
                        />

                        <p> {completed_tasks}/{total_tasks} Hoàn thành</p>
                    </div>
                ),
                action: (
                    <>
                        {!isHome && (
                            <Dropdown
                                className="wide-dropdwon"
                                action='click'
                                content={
                                    <div className='popover-content' style={{display: 'flex'}}>
                                        <div style={{marginRight: '20px'}}>
                                            <div className='action-item' onClick={() => handleEditClick('name', value)}>
                                                <MdEdit size={30} className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Sửa tên, mô tả</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('status', value)}>
                                                <GrInProgress size={30} className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Cập nhật trạng thái</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('members', value)}>
                                                <MdGroups size={30} className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Thành viên</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('leader', value)}>
                                                <FaUserTie size={30} className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Người phụ trách</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('start_date', value)}>
                                                <MdOutlineDateRange size={30}
                                                                    className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Sửa ngày bắt đầu</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('end_date', value)}>
                                                <MdOutlineDateRange size={30}
                                                                    className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Sửa ngày kết thúc</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('copy', value)}>
                                                <MdContentCopy size={30}
                                                               className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Sao chép dự án</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('setting', value)}>
                                                <MdOutlineSettings size={30}
                                                                   className='d-block ms-1 fs-4 text-secondary'/>
                                                <span>Cài đặt nhắc nhở</span>
                                            </div>
                                            <div className='action-item'
                                                 onClick={() => handleEditClick('delete', value)}>
                                                <MdDelete color='red' size={30} className='icon-delete'/>
                                                <span>Xóa dự án</span>
                                            </div>
                                        </div>


                                    </div>
                                }
                            >
                                <div role='button' style={{cursor: 'pointer'}}>
                                    <FeatherIcon icon="more-horizontal" size={18}/>
                                </div>
                            </Dropdown>
                        )}
                        {
                            isHome && (
                                <div className='btn p-1' title='Xem dự án'
                                     style={{cursor: 'pointer'}}
                                     onClick={() => {
                                         history.push(`/admin/lam-viec/nhom-lam-viec/${group_id}`)
                                     }}
                                >
                                    <IoEnterOutline color='gray' size={30}/>
                                </div>
                            )
                        }
                    </>

                ),
            });
        });
    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
        },
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
            title: 'Người phụ trách',
            dataIndex: 'leader',
            key: 'leader',
        },
        ...(group_id?.toString() === '47'
            ? [
                {
                    title: 'Người giám sát',
                    dataIndex: 'monitor',
                    key: 'monitor',
                },
            ]
            : []),
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
            dataIndex: 'success',
            key: 'success',
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
                                dataSource={dataSource}
                                columns={columns}
                            />
                        </div>
                    </ProjectList>
                </Cards>
            </Col>
            {/*modal update name, description*/}
            <Modal
                type='primary'
                title=" Cập nhật tên và mô tả dự án"
                visible={showModalUpdateName}
                onCancel={handleCancel}
                className='modal-project'
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleUpdateName}
                                style={{
                                    backgroundColor: loadingUpdate ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Cập nhật'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form form={form} name="createProject" onFinish={handleUpdateName}>
                            <Form.Item name="project_name" label="">
                                <Input
                                    placeholder="Tên dự án"
                                    onChange={(e) => {
                                        setSelectedProject({
                                            ...selectedProject,
                                            project_name: e.target.value
                                        });
                                    }}
                                />
                            </Form.Item>
                            <Form.Item name="project_description" label="">
                                <div className="group">
                                    <RichTextEditor
                                        className='custom-rich-text-editor'
                                        placeholder="Nhập mô tả dự án"
                                        name={'project_description'}
                                        value={editorState}
                                        onChange={handleChangeEditer}/>
                                </div>
                            </Form.Item>
                        </Form>
                    </BasicFormWrapper>
                </div>
            </Modal>
            {/*    modal update start date*/}
            <Modal
                type='primary'
                title=" Cập nhật ngày bắt đầu dự án"
                visible={showModalUpdateStartDate}
                onCancel={handleCancel}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleUpdateStartDate}
                                style={{
                                    backgroundColor: loadingUpdate ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Cập nhật'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form form={form} name="createProject" onFinish={handleUpdateStartDate}>
                            <Form.Item name="project_start_date" className='w-100' label="Ngày bắt đầu">
                                <DatePicker
                                    placeholder="mm/dd/yyyy"
                                    onChange={(date, dateString) => {
                                        setSelectedProject({
                                            ...selectedProject,
                                            project_start_date: date?.format('YYYY-MM-DD')
                                        });
                                    }}
                                    format={dateFormat}/>
                            </Form.Item>
                        </Form>
                    </BasicFormWrapper>
                </div>
            </Modal>
            {/*    modal update end date*/}
            <Modal
                type='primary'
                title=" Cập nhật ngày kết thúc dự án"
                visible={showModalUpdateEndDate}
                onCancel={handleCancel}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleUpdateEndDate}
                                style={{
                                    backgroundColor: loadingUpdate ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Cập nhật'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form form={form} name="createProject" onFinish={handleUpdateEndDate}>
                            <Form.Item name="project_end_date" className='w-100' label="Ngày kết thúc">
                                <DatePicker
                                    placeholder="mm/dd/yyyy"
                                    onChange={(date, dateString) => {
                                        setSelectedProject({
                                            ...selectedProject,
                                            project_end_date: date?.format('YYYY-MM-DD')
                                        });
                                    }}
                                    format={dateFormat}/>
                            </Form.Item>
                        </Form>
                    </BasicFormWrapper>
                </div>
            </Modal>
            {/*    modal delete*/}
            <Modal
                type='primary'
                title=" Xác nhận xóa dự án"
                visible={showModalConfirm}
                onCancel={handleCancel}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" key="submit" className='btn' onClick={handleDeleteProject}
                                style={{
                                    backgroundColor: "#dc3545",
                                    minWidth: '150px',
                                }}
                        >
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Xóa'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <p>Bạn có chắc chắn muốn xóa dự án này không?</p>
                    </BasicFormWrapper>
                </div>
            </Modal>
            {/*    modal update status*/}
            <Modal
                type='primary'
                title=" Cập nhật trạng thái dự án"
                visible={showModalUpdateStatus}
                onCancel={handleCancel}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleUpdateStatus}
                                style={{
                                    backgroundColor: loadingUpdate ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Cập nhật'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form.Item label="Trạng thái dự án">
                            <Radio.Group
                                name="project_status"
                                onChange={(e) => {
                                    setSelectedProject({
                                        ...selectedProject,
                                        project_status: e.target.value
                                    });
                                }}
                                value={selectedProject?.project_status}  // Set the default checked value
                            >
                                <Radio value={0}>Đang chờ (Tiến độ hoàn thành = 0%)</Radio>
                                <Radio value={1}>Đang làm (Tiến độ hoàn thành 0% {"->"} 100%)</Radio>
                                <Radio value={2}>Hoàn thành (Tiến độ hoàn thành = 100%)</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </BasicFormWrapper>
                </div>
            </Modal>
            {/*    modal update members*/}
            <Modal
                visible={showModalUpdateMembers}
                onCancel={handleCancel}
                centered
                title="Thành viên"
                footer={null}
            >
                <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '16px'}}>
                    <span
                        style={{
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            backgroundColor: showMemberExit ? '#1890ff' : '',
                            color: showMemberExit ? 'white' : '',
                            transition: 'background-color 0.3s'
                        }}
                        onClick={() => setShowMemberExit(true)}
                    >
                        Thành viên hiện có
                    </span>
                    <span
                        style={{
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            backgroundColor: !showMemberExit ? '#1890ff' : '',
                            color: !showMemberExit ? 'white' : '',
                            transition: 'background-color 0.3s'
                        }}
                        onClick={() => setShowMemberExit(false)}
                    >
                        Mời thành viên tham gia 2
                    </span>
                </div>
                {showMemberExit ? (
                    <>
                        <div style={{marginBottom: '16px'}}>
                            {selectedMembers.length > 0 && (
                                <>
                                    <h6 style={{marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem'}}>Thành viên
                                        đã chọn:</h6>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '20px',
                                        padding: '8px',
                                        border: '1px solid #e8e8e8',
                                        borderRadius: '4px',
                                        backgroundColor: '#f9f9f9'
                                    }}>
                                        {selectedMembers.map((member) => (
                                            <Badge
                                                key={member.email}
                                                onClick={() => handleRemoveMember(member.email)}
                                            >
                                                <span style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#f0f0f0',
                                                    color: '#000',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    {member.name}
                                                    <FeatherIcon icon="x" size={16} color='red'
                                                                 style={{marginLeft: '8px'}}/>
                                                </span>
                                            </Badge>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <Input
                            type="text"
                            placeholder="Tìm kiếm thành viên"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{marginBottom: '16px'}}
                        />
                        <List
                            itemLayout="horizontal"
                            style={{height: '300px', overflowY: 'auto'}}
                            dataSource={filteredMembers}
                            renderItem={(member) => (
                                <List.Item onClick={() => handleSelectMember(member)} style={{cursor: 'pointer'}}>
                                    <List.Item.Meta
                                        avatar={<Avatar width={40} height={40} name={member?.name}
                                                        imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}/>}
                                        title={member.name}
                                        description={
                                            <>
                                                <small className="text-muted">{member?.email} </small>
                                                <br/>
                                                <strong
                                                    className="text-muted">{member?.department_name} - {member?.level_name}</strong>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </>
                ) : (
                    <>
                        <Form.Item>
                            <Input
                                type="text"
                                placeholder="Nhập email thành viên"
                                name="email_to"
                                value={dataJoinProject.email_to}
                                onChange={handleChangeJoinProject}
                                style={{marginBottom: '16px'}}
                            />
                        </Form.Item>
                        <Form.Item label="Lời nhắn" className="form-label fs-4">
                            <Input.TextArea
                                rows={3}
                                name="message"
                                value={dataJoinProject.message}
                                onChange={handleChangeJoinProject}
                                placeholder="Nhập lời nhắn"
                            />
                        </Form.Item>
                    </>
                )}
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '16px'}}>
                    {showMemberExit ? (
                        <Button
                            type="primary"
                            style={{minWidth: '300px'}}
                            onClick={handleUpdateMembers}
                        >
                            {loadingUpdate ? <Spin/> : 'Cập nhật'}
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            style={{minWidth: '300px'}}
                            onClick={handleJoinProject}
                        >
                            {loadingUpdate ? <Spin/> : 'Gửi lời mời'}
                        </Button>
                    )}
                </div>
            </Modal>
            {/*    modal update leader*/}
            <Modal
                onCancel={handleCancel}
                title="Người phụ trách dự án"
                visible={showModalUpdateLeader}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit"
                                onClick={handleUpdateLeader}
                                style={{
                                    backgroundColor: isLoading ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {isLoading ? <div>
                                <Spin/>
                            </div> : 'Cập nhật'}

                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form form={form} name="updateLeaderProject" onFinish={handleUpdateLeader}>
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
                                        <List.Item onClick={() => handleSelectLeader(member)}
                                                   style={{cursor: 'pointer'}}>
                                            <List.Item style={{
                                                borderBottom: 'none',
                                                padding: '4px 8px',
                                            }}>
                                                <input type="radio" value={member?.id}
                                                       checked={member?.id === selectedLeader?.id}/>
                                            </List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar width={40} height={40} name={member?.name}
                                                                imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}/>}
                                                title={member.name}
                                                description={
                                                    <>
                                                        <small className="text-muted">{member?.email} </small>
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
            {
                selectedProject &&
                <CopyProject visible={showModalCopy} onCancel={handleCancel} project={selectedProject}/>
            }
            {/*    modal update notification before end time*/}
            <Modal
                visible={showModalSetting}
                onCancel={handleCancel}
                centered
                title="Cài đặt nhắc nhở dự án"
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleUpdateRemind}>
                        Hoàn thành
                    </Button>,
                ]}
            >
                <div>
                    <label style={{marginBottom: '10px', display: 'block'}}>Nhắc nhở trước thời gian kết thúc của công
                        việc (giờ) <span
                            style={{color: 'red'}}>*</span></label>
                    < InputNumber style={{width: '100%'}} min={0} value={notifyBeforeEndTime}
                                  defaultValue={notifyBeforeEndTime}
                                  onChange={(value) => setNotifyBeforeEndTime(value)}/>
                </div>


            </Modal>
            {/*    modal update type*/}
            <Modal
                type='primary'
                title=" Cập nhật loại dự án"
                visible={showModalUpdateType}
                onCancel={handleCancel}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleUpdateType}
                                style={{
                                    backgroundColor: loadingUpdate ? "#8c94ff" : "#5f63f2",
                                    minWidth: '150px',
                                }}
                        >
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Cập nhật'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form.Item label="Loại dự án">
                            <Radio.Group
                                name="project_type"
                                onChange={(e) => {
                                    setSelectedProject({
                                        ...selectedProject,
                                        project_type: e.target.value
                                    });
                                }}
                                value={selectedProject?.project_type}  // Set the default checked value
                            >
                                <Radio value={0}>Dự án chuyên môn</Radio>
                                <Radio value={1}>Dự án phát sinh</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </BasicFormWrapper>
                </div>
            </Modal>

        </Row>
    );
}

export default ProjectLists;