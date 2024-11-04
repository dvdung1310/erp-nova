import {useLocation, useParams} from "react-router-dom";
import React, {useState} from "react";
import {checkStatus} from "../../../../../utility/checkValue";
import {
    createTask, deleteTask, updateEndDateTask, updateMemberTask, updateNameTask, updateStartDateTask, updateStatusTask
} from "../../../../../apis/work/task";
import {toast} from "react-toastify";
import {
    Chip,
    FormControl,
    FormControlLabel,
    Paper,
    Popover,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
} from "@mui/material";
import {Modal, Form, Input, Button, Spin, Badge, Typography, List,} from 'antd';
import {AnimatePresence, motion} from "framer-motion";
import {MdCheck, MdDelete, MdOutlineDateRange} from "react-icons/md";
import Avatar from "../../../../../components/Avatar/Avatar";
import {CiCirclePlus} from "react-icons/ci";
import moment from "moment";
import {GoComment} from "react-icons/go";
import MessageComponent from "./MessageComponent";
import {IoIosAdd} from "react-icons/io";
import {PiEyeThin} from "react-icons/pi";
import FeatherIcon from "feather-icons-react";
//

const getComparator = (order, orderBy) => {
    return (a, b) => {
        if (order === 'desc') {
            return b[orderBy] < a[orderBy] ? -1 : 1;
        }
        return a[orderBy] < b[orderBy] ? -1 : 1;

    };
};

// Stable sorting function
const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
};

const TaskList = (props) => {
    const [form] = Form.useForm();
    const {listUser, tasks, setTasks, isHome} = props;
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const params = useParams()
    const {id} = params;
    const {pathname} = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedUser, setSelectedUser] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(''); // Default status
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [taskSelected, setTaskSelected] = useState(null);
    const [statusAnchorEl, setStatusAnchorEl] = useState(null)
    const [nameAnchorEl, setNameAnchorEl] = useState(null)
    const [userAnchorEl, setUserAnchorEl] = useState(null)
    const [startDateAnchorEl, setStartDateAnchorEl] = useState(null);
    const [endDateAnchorEl, setEndDateAnchorEl] = useState(null);
    const [task_name, setTaskName] = useState('')
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    //
    const [showComment, setShowComment] = useState(false);
    const handleCloseComment = () => {
        setShowComment(false);
    }

    const [dataCreateTask, setDataCreateTask] = useState({
        task_name: '',
        task_description: '',
        task_start_date: '',
        task_end_date: '',
    });
    const handleChange = (e) => {
        setDataCreateTask({
            ...dataCreateTask,
            [e.target.name]: e.target.value
        })
    }
    //

    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectMember = (member) => {
        if (!selectedMembers.some((selected) => selected.email === member.email)) {
            setSelectedMembers([...selectedMembers, member]);
        }
        setSearchTerm(''); // Clear search term after selection
    };

    const handleRemoveMember = (email) => {
        setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
    };
    const listUserFilter = listUser || tasks?.users;
    const filteredMembers = listUserFilter.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase()));

    //
    // Sorting state
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('task_name');

    // Handle sort request
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
// click
    const handleNameClick = (event, task) => {
        setNameAnchorEl(event.currentTarget);
        setSelectedTask(task);
        setTaskName(task.task_name);
    };
    const handleUserClick = (event, task) => {
        if (isHome) {
            return;
        }
        setSelectedUser(task.users || []);
        setUserAnchorEl(event.currentTarget);
        setSelectedTask(task);
        setSelectedMembers(task.users || []);
    }
    const handleStatusClick = (event, task) => {
        if (task?.task_status?.toString() !== '3') {
            setStatusAnchorEl(event.currentTarget);
            setSelectedTask(task);
            setSelectedStatus(task.task_status);
        }
    };

    const handleStartDateClick = (event, task) => {
        setStartDateAnchorEl(event.currentTarget);
        setSelectedTask(task);
        setStartDate(task.task_start_date);
    };

    const handleEndDateClick = (event, task) => {
        setEndDateAnchorEl(event.currentTarget);
        setSelectedTask(task);
        setEndDate(task.task_end_date);
    };
    const handleInfoClick = (event, task) => {
        setShowModalInfo(true);
        setSelectedTask(task);
    }
    const handleCommentClick = (event, task) => {
        setShowComment(true);
        setSelectedTask(task);
    }
    const handleClose = () => {
        setUserAnchorEl(null);
        setStatusAnchorEl(null);
        setNameAnchorEl(null)
        setSelectedTask(null);
        setStartDateAnchorEl(null);
        setEndDateAnchorEl(null);
    };

    const handleNameSave = async (e) => {
        e.preventDefault()
        e.stopPropagation();
        if (selectedTask) {
            try {
                setLoadingUpdate(true);
                const payload = {
                    task_name, pathname
                }
                const res = await updateNameTask(payload, selectedTask.task_id)
                setTasks(tasks.map((task) => task.task_id === selectedTask.task_id ? res.data : task))
                toast.success('Thực hiện cập nhật tên công việc thành công', {
                    position: "top-right", autoClose: 1000
                })
                setLoadingUpdate(false);
            } catch (error) {
                setLoadingUpdate(false);
                toast.error(error.response.data.message, {
                    position: "top-right", autoClose: 1000
                });
                console.log(error);
            }
            handleClose()
        }
    };

    const handleStartDateSave = async () => {
        if (selectedTask) {
            try {
                setLoadingUpdate(true);
                const payload = {
                    task_start_date: startDate, pathname
                }
                const res = await updateStartDateTask(payload, selectedTask.task_id)
                if (res.error) {
                    toast.error(res.message, {
                        position: "top-right", autoClose: 1000
                    });
                    setLoadingUpdate(false);
                    handleClose();
                    return;
                }
                setTasks(tasks.map((task) => task.task_id === selectedTask.task_id ? res.data : task))
                toast.success('Thực hiện cập nhật ngày bắt đầu công việc thành công', {
                    position: "top-right", autoClose: 1000
                })
                setLoadingUpdate(false);
            } catch (error) {
                setLoadingUpdate(false);
                toast.error(error.response.data.message, {
                    position: "top-right", autoClose: 1000
                });
                console.log(error);
            }
            handleClose();
        }
    };

    const handleEndDateSave = async () => {
        if (selectedTask) {
            try {
                setLoadingUpdate(true);
                const payload = {
                    task_end_date: endDate, pathname
                }
                const res = await updateEndDateTask(payload, selectedTask.task_id)
                if (res.error) {
                    toast.error(res.message, {
                        position: "top-right", autoClose: 1000
                    });
                    handleClose();
                    setLoadingUpdate(false);
                    return;
                }
                setTasks(tasks.map((task) => task.task_id === selectedTask.task_id ? res.data : task))
                toast.success('Thực hiện cập nhật ngày kết thúc công việc thành công', {
                    position: "top-right", autoClose: 1000
                })
                setLoadingUpdate(false);
            } catch (error) {
                setLoadingUpdate(false);
                toast.error(error.response.data.message, {
                    position: "top-right", autoClose: 1000
                });
                console.log(error);
            }
            // eslint-disable-next-line no-use-before-define
            handleClose();
        }
    };


// change
    const handleSaveUser = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedTask) {
            try {
                setLoadingUpdate(true);
                const members = selectedMembers.map((member) => member.id)
                const payload = {
                    members, pathname
                }
                const res = await updateMemberTask(payload, selectedTask.task_id)
                if (res.error) {
                    toast.error(res.message, {
                        position: "top-right", autoClose: 1000
                    });
                    handleClose();
                    setLoadingUpdate(false);
                    return;
                }
                setTasks(tasks.map((task) => task.task_id === selectedTask.task_id ? res.data : task))
                toast.success('Thực hiện cập nhật người thực hiện công việc thành công', {
                    position: "top-right", autoClose: 1000
                })
                setSelectedMembers([]);
                setLoadingUpdate(false);
            } catch (error) {
                setLoadingUpdate(false);
                toast.error(error.response.data.message, {
                    position: "top-right", autoClose: 1000
                });
                console.log(error);
            }
            handleClose();
        }
    }

    const handleStatusChange = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (selectedTask) {
            try {
                setLoadingUpdate(true);
                const payload = {
                    task_status: event.target.value, pathname
                }
                const res = await updateStatusTask(payload, selectedTask.task_id)
                setTasks(tasks.map((task) => task.task_id === selectedTask.task_id ? res.data : task))
                toast.success('Thực hiện cập nhật trạng thái công việc thành công', {
                    position: "top-right", autoClose: 1000
                })
                setLoadingUpdate(false);
            } catch (error) {
                setLoadingUpdate(false);
                toast.error(error.response.data.message, {
                    position: "top-right", autoClose: 1000
                });
                console.log(error);
            }
            handleClose();
        }

    };
    //confirm create task
    const handleConfirmCreateTask = () => {
        setShowModalCreate(true);
    }
    const handleCloseCreateTask = () => {
        setShowModalCreate(false);
    }
    //confirm delete task

    //
    const handleShowModalConfirm = (task_id) => {
        setTaskSelected(task_id);
        setShowModalConfirm(true)
    }
    const handleCloseModalConfirm = () => {
        setShowModalConfirm(false);
        setTaskSelected(null);
    }
    const handleDeleteTask = async (task_id) => {
        try {
            setLoadingDelete(true);
            const res = await deleteTask(task_id)
            if (res.error) {
                toast.error(res.message, {
                    position: "top-right", autoClose: 1000
                })
                setLoadingDelete(false);
                setShowModalConfirm(false);
                return;
            }
            setTasks(tasks.filter((task) => task?.task_id?.toString() !== task_id?.toString()))
            setLoadingDelete(false);
            toast.success('Thực hiện xóa công việc thành công', {
                position: "top-right", autoClose: 1000
            })
            setShowModalConfirm(false);
        } catch (error) {
            setLoadingDelete(false);
            toast.error(error.response.data.message, {
                position: "top-right", autoClose: 1000
            });
            console.log(error);
        }
    }
    const handleCreateTask = async () => {
        try {
            setLoadingCreate(true);
            console.log(dataCreateTask)
            if (!dataCreateTask.task_name || !dataCreateTask.task_start_date || !dataCreateTask.task_end_date) {
                toast.error('Vui lòng nhập đầy đủ thông tin', {
                    position: "top-right", autoClose: 1000
                });
                setLoadingCreate(false);
                return;
            }
            const payload = {
                "project_id": id,
                "task_name": dataCreateTask.task_name,
                "task_description": dataCreateTask.task_description,
                "task_start_date": dataCreateTask.task_start_date,
                "task_end_date": dataCreateTask.task_end_date,
                "members": []
            }
            console.log(payload)
            const res = await createTask(payload)
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right", autoClose: 1000
                });
                setLoadingCreate(false);
                return;
            }
            setTasks([...tasks, res.data]);
            toast.success('Thực hiện tạo công việc thành công', {
                position: "top-right", autoClose: 1000
            })
            setLoadingCreate(false);
            setShowModalCreate(false);
            setDataCreateTask({
                task_name: '',
                task_description: '',
                task_start_date: '',
                task_end_date: '',
            })
            form.resetFields();
        } catch (error) {
            setLoadingCreate(false);
            toast.error(error?.response?.data?.message, {
                position: "top-right", autoClose: 1000
            });
            console.log(error);
        }
    };

    const userOpen = Boolean(userAnchorEl);
    const nameOpen = Boolean(nameAnchorEl);
    const statusOpen = Boolean(statusAnchorEl)
    const startDateOpen = Boolean(startDateAnchorEl);
    const endDateOpen = Boolean(endDateAnchorEl);

//
    const userId = userOpen ? 'start-user' : undefined;
    const nameId = nameOpen ? 'start-name' : undefined;
    const statusId = statusOpen ? 'start-status' : undefined
    const startDateId = startDateOpen ? 'start-date-popover' : undefined;
    const endDateId = endDateOpen ? 'end-date-popover' : undefined;

// Sort the tasks using the comparator and stable sort function
    const sortedTasks = stableSort(tasks, getComparator(order, orderBy));

    //
    return (<div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead
                        style={{
                            background: "#f1f2f4",
                        }}
                    >
                        <TableRow>
                            <TableCell>
                                STT
                            </TableCell>
                            {/* Sortable Task Name Column */}
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'task_name'}
                                    direction={orderBy === 'task_name' ? order : 'asc'}
                                    onClick={() => handleRequestSort('task_name')}
                                >
                                    Tên công việc
                                </TableSortLabel>
                            </TableCell>

                            {/* Sortable Status Column */}
                            <TableCell>
                                Trạng thái
                            </TableCell>
                            <TableCell>
                                Thời gian
                            </TableCell>

                            <TableCell>
                                Ngày bắt đầu
                            </TableCell>
                            <TableCell>
                                Ngày kết thúc
                            </TableCell>
                            <TableCell>
                                Ghi chú
                            </TableCell>
                            <TableCell style={{width: '200px'}}>
                                Người thực hiện
                            </TableCell>
                            <TableCell>
                                Hành động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <AnimatePresence>
                            {sortedTasks.length > 0 && sortedTasks?.map((task, index) => (<motion.tr
                                key={task.task_id}
                                initial={{opacity: 0, y: -10, z: 0}} // Start animation
                                animate={{opacity: 1, y: 0, z: 0}}   // End animation
                                exit={{opacity: 0, y: 10, z: 0}}     // Animation when removed
                                layout                          // Automatically animate position changes
                                transition={{duration: 0.5}}   // Adjust animation speed
                                whileHover={{background: '#f1f2f4'}}     // Hover animation
                                style={{
                                    willChange: 'inherit', backfaceVisibility: 'inherit'
                                }} // Đưa phần tử lên layer mới
                            >
                                <TableCell className="table-cell" style={{
                                    minWidth: '50px'
                                }}>
                                    {index + 1}
                                </TableCell>
                                <TableCell
                                    className="table-cell"
                                    style={{
                                        textAlign: 'left'
                                    }}
                                    onClick={(event) => handleNameClick(event, task)}
                                >
                                    {task?.task_name || '....'}
                                </TableCell>
                                <TableCell
                                    onClick={(event) => handleStatusClick(event, task)}
                                    className={`table-cell ${task.task_status?.toString() !== '0' ? 'table-cell-clickable' : ''}`}
                                >
                                    <Chip
                                        style={{fontSize: '12px'}}
                                        label={checkStatus(task.task_status).status}
                                        className="chip-status"
                                        icon={task.task_status?.toString() === '3' ? <MdCheck/> : null}
                                        color={(task.task_status?.toString() === '2' || task.task_status?.toString() === '3') ? 'success' : task.task_status?.toString() === '1' ? 'info' : task.task_status?.toString() === '0' ? 'warning' : 'warning'}
                                    />
                                    {new Date(task.task_end_date) < new Date() && (task.task_status?.toString() !== '2' && task.task_status?.toString() !== '3') && (
                                        <Chip label="Quá hạn" style={{fontSize: '12px'}}
                                              className="chip-status ms-1"
                                              color="error"/>
                                    )}
                                </TableCell>

                                <TableCell className="table-cell">
                                    {/* eslint-disable-next-line no-restricted-globals */}
                                    {isNaN(Math.floor((new Date(task.task_end_date) - new Date(task.task_start_date)) / (1000 * 60 * 60 * 24))) ? '' : `${Math.floor((new Date(task.task_end_date) - new Date(task.task_start_date)) / (1000 * 60 * 60 * 24))} Ngày`}
                                </TableCell>
                                <TableCell className="table-cell"
                                           onClick={(event) => handleStartDateClick(event, task)}>
                                    <div className='d-flex align-items-center justify-content-center'>
                                        {moment(task?.task_start_date).format('DD-MM-YYYY')}
                                        <MdOutlineDateRange
                                            size={16}
                                            className='d-block ms-1 fs-4 text-secondary'/>
                                    </div>
                                </TableCell>
                                <TableCell className="table-cell"
                                           onClick={(event) => handleEndDateClick(event, task)}>
                                    <div className='d-flex align-items-center justify-content-center'>
                                        {moment(task?.task_end_date).format('DD-MM-YYYY')}
                                        <MdOutlineDateRange
                                            size={16}
                                            className='d-block ms-1 fs-4 text-secondary'/>
                                    </div>
                                </TableCell>
                                <TableCell className="table-cell">

                                    {task.task_date_update_status_completed && (<>
                                        {new Date(task.task_date_update_status_completed) > new Date(task.task_end_date) ? (
                                            <span className='text-danger'>
                                                                Quá hạn {Math.floor((new Date(task.task_date_update_status_completed) - new Date(task.task_end_date)) / (1000 * 60 * 60 * 24))} ngày
                                                            </span>) : new Date(task.task_date_update_status_completed) < new Date(task.task_end_date) ? (
                                            <span className='text-success'>
                                                                hoàn thành sớm {Math.floor((new Date(task.task_end_date) - new Date(task.task_date_update_status_completed)) / (1000 * 60 * 60 * 24))} ngày
                                                            </span>) : (<span className='text-success'>
                                                                hoàn thành đúng hạn
                                                            </span>)}
                                    </>)}
                                    {!task.task_date_update_status_completed && (<>
                                        {new Date() > new Date(task.task_end_date) ? <span className='text-danger'>
                                                            Quá hạn {Math.floor((new Date() - new Date(task.task_end_date)) / (1000 * 60 * 60 * 24))} ngày
                                                        </span> : <span className='text-warning'>
                                                            còn&nbsp;{(Math.floor((new Date(task.task_end_date) - new Date()) / (1000 * 60 * 60 * 24)))}&nbsp;ngày
                                                        </span>}
                                    </>)}
                                </TableCell>
                                <TableCell className="table-cell"
                                           onClick={(event) => handleUserClick(event, task)}
                                >

                                    <div className='d-flex align-items-center'>
                                        {task?.users?.length > 0 && task.users.map((user) => (<div
                                            key={user.id}
                                            title={user.name}
                                            style={{
                                                marginLeft: '-8px', fontSize: '16px'
                                            }}>
                                            <Avatar width={30} height={30} name={user.name}
                                                    imageUrl={user.avatar ? LARAVEL_SERVER + user.avatar : ''}
                                                    key={user.id}/>
                                        </div>))}
                                        <CiCirclePlus size={30} style={{opacity: '0.2'}}/>
                                    </div>

                                </TableCell>
                                <TableCell className="table-cell">
                                    <div className='d-flex justify-content-center' style={{
                                        gap: '10px'
                                    }}>
                                        <div className='btn p-1'
                                             title='Chi tiết'
                                             onClick={(event) => handleInfoClick(event, task)}
                                        >
                                            <PiEyeThin color='gray' size={30} className='icon-delete'/>
                                        </div>
                                        {/* eslint-disable-next-line react/button-has-type */}
                                        <div className='btn p-1'
                                             title='Bình luận'
                                             onClick={(event) => handleCommentClick(event, task)}
                                        >
                                            <GoComment color='gray' size={30} className='icon-delete'/>
                                        </div>
                                        {/* eslint-disable-next-line react/button-has-type */}
                                        <div className='btn p-1'
                                             title='Xóa công việc'
                                             onClick={() => handleShowModalConfirm(task.task_id)}
                                        >
                                            <MdDelete color='red' size={30} className='icon-delete'/>
                                        </div>
                                    </div>
                                    {/* eslint-disable-next-line react/button-has-type */}

                                </TableCell>
                            </motion.tr>))}
                        </AnimatePresence>

                        <tr>
                            <TableCell colSpan={6}>

                                {
                                    !isHome && (
                                        <Button

                                            type="default"
                                            onClick={handleConfirmCreateTask}
                                            style={{
                                                marginTop: '10px',
                                                minWidth: '150px',
                                                borderColor: '#d9d9d9',
                                                color: '#fff',
                                                backgroundColor: 'rgb(89 89 89)'
                                            }}
                                        >
                                            {loadingCreate ? (
                                                <Spin/>
                                            ) : (
                                                <div className='d-flex align-items-center'>
                                                    <IoIosAdd size={24}/>
                                                    <span className='me-1'>Thêm công việc</span>
                                                </div>
                                            )}
                                        </Button>
                                    )
                                }

                            </TableCell>
                        </tr>
                    </TableBody>
                </Table>

                {/* Popover to display status update options */}
                <Popover
                    id={statusId}
                    open={statusOpen}
                    anchorEl={statusAnchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom', horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top', horizontal: 'left',
                    }}
                >
                    <Typography sx={{p: 2}}>Cập nhật trạng thái công việc</Typography>
                    {loadingUpdate && <div style={{
                        position: 'absolute',
                        left: '0',
                        right: '0',
                        top: '0',
                        bottom: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '2',
                        background: 'rgba(255, 255, 255, 0.5)',

                    }}>
                        <Spin/>
                    </div>}
                    <FormControl component="fieldset" sx={{padding: 2}}>
                        <RadioGroup value={selectedStatus} onChange={handleStatusChange}>
                            <FormControlLabel value="0" control={<Radio/>}
                                              label="Đang chờ (Tiến độ hoàn thành = 0%)"/>
                            <FormControlLabel value="1" control={<Radio/>}
                                              label="Đang làm (0% < Tiến độ hoàn thành < 100%)"/>
                            <FormControlLabel value="2" control={<Radio/>}
                                              label="Hoàn thành (Tiến độ hoàn thành = 100%)"/>
                            <FormControlLabel value="3" control={<Radio/>}
                                              label="Xác nhận hoàn thành (leader xác nhận)"/>
                        </RadioGroup>
                    </FormControl>
                </Popover>

                {/* Popover to edit task name */}
                <Popover
                    id={nameId}
                    open={nameOpen}
                    anchorEl={nameAnchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom', horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top', horizontal: 'left',
                    }}
                >
                    <form style={{padding: '16px'}} onSubmit={(e) => {
                        if (loadingUpdate) return;
                        handleNameSave(e)
                    }}>
                        <TextField
                            label="Edit Task Name"
                            value={task_name}
                            autoFocus
                            className='fs-6'
                            onChange={(e) => setTaskName(e.target.value)}
                            fullWidth
                        />
                        <Button type='primary'
                                onClick={(e) => {
                                    if (loadingUpdate) return;
                                    handleNameSave(e)
                                }}
                                style={{marginTop: '8px', minWidth: '200px'}}>
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Lưu'}
                        </Button>
                    </form>
                </Popover>

                {/* Popover to edit start date */}
                <Popover
                    id={startDateId}
                    open={startDateOpen}
                    anchorEl={startDateAnchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom', horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top', horizontal: 'left',
                    }}
                >
                    <div style={{padding: '16px'}}>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={startDate}
                            autoFocus
                            onChange={(e) => setStartDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <Button type="primary"
                                onClick={() => {
                                    if (loadingUpdate) return;
                                    handleStartDateSave()
                                }}
                                style={{marginTop: '8px', minWidth: '200px'}}>
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Lưu'}
                        </Button>
                    </div>
                </Popover>

                {/* Popover to edit end date */}
                <Popover
                    id={endDateId}
                    open={endDateOpen}
                    anchorEl={endDateAnchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom', horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top', horizontal: 'left',
                    }}
                >
                    <div style={{padding: '16px'}}>
                        <TextField
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <Button type="primary"
                                onClick={() => {
                                    if (loadingUpdate) return;
                                    handleEndDateSave()
                                }}
                                style={{marginTop: '8px', minWidth: '200px'}}>
                            {loadingUpdate ? <div>
                                <Spin/>
                            </div> : 'Lưu'}
                        </Button>
                    </div>
                </Popover>
                {/*popup edit user*/}


                <Popover
                    id={userId}
                    open={userOpen}
                    anchorEl={userAnchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom', horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top', horizontal: 'left',
                    }}
                >
                    <div className="ant-popover-inner-content p-3 mt-4 form-add-members" style={{
                        minWidth: '400px',
                    }}>
                        {/* Input field with selected members */}
                        <Input
                            type="text"
                            placeholder="Thêm thành viên"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{marginBottom: '16px'}}
                        />

                        {/* Display selected members as badges */}
                        <div className="mb-3">
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

                        {/* Dropdown list for selecting members */}
                        {filteredMembers.length > 0 && (
                            <List
                                className="mb-3"
                                dataSource={filteredMembers}
                                renderItem={(member) => (
                                    <List.Item
                                        key={member.email}
                                        onClick={() => handleSelectMember(member)}
                                        className="d-flex align-items-center"
                                        style={{cursor: 'pointer', justifyContent: "start"}}
                                    >
                                        <div className='me-3'>
                                            <Avatar
                                                name={member.name}
                                                width={40}
                                                height={40}
                                                imageUrl={member.avatar ? `${LARAVEL_SERVER}${member.avatar}` : ''}
                                            />
                                        </div>
                                        <div style={{
                                            marginLeft: '8px',
                                        }}>
                                            <strong>{member.name}</strong>
                                            <br/>
                                            <small className="text-muted">{member.email}</small>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}

                        <div className='d-flex justify-content-center'>
                            <Button type="primary" onClick={handleSaveUser} style={{minWidth: '200px'}}>
                                {
                                    loadingUpdate ? <div>
                                        <Spin/>
                                    </div> : 'Lưu'
                                }
                            </Button>
                        </div>
                    </div>
                </Popover>
            </TableContainer>
            {/*modal create task*/}
            <Modal
                visible={showModalCreate}
                onCancel={handleCloseCreateTask}
                centered
                title="Thêm mới công việc"
                footer={null}
            >
                <Form layout="vertical" form={form}>
                    <div className="row">
                        <div className="col-md-12">
                            <Form.Item
                                label="Tên công việc"
                                className="form-label fs-4"
                                name="task_name"
                            >
                                <Input
                                    className="form-control fs-5"
                                    id="input1"
                                    name="task_name"
                                    value={dataCreateTask.task_name || ''}
                                    onChange={handleChange}
                                    placeholder="Nhập tên công việc"
                                />
                            </Form.Item>
                        </div>
                        <div className="col-md-12">
                            <Form.Item
                                label="Mô tả công việc"
                                className="form-label fs-4"
                                name="task_description"
                            >
                                <Input.TextArea
                                    rows={2}
                                    className="form-control fs-5"
                                    name="task_description"
                                    value={dataCreateTask.task_description}
                                    onChange={handleChange}
                                    id="input2"
                                    placeholder="Nhập mô tả"
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <Form.Item
                                label="Ngày bắt đầu"
                                className="form-label fs-4"
                                name="task_start_date"
                            >
                                <Input
                                    type="date"
                                    className="form-control fs-5"
                                    id="input4"
                                    name="task_start_date"
                                    value={dataCreateTask.task_start_date}
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </div>
                        <div className="col-md-6">
                            <Form.Item
                                label="Ngày kết thúc"
                                className="form-label fs-4"
                                name="task_end_date"
                            >
                                <Input
                                    type="date"
                                    className="form-control fs-5"
                                    id="input4"
                                    name="task_end_date"
                                    value={dataCreateTask.task_end_date}
                                    onChange={handleChange}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </Form>
                <div className='d-flex justify-content-center'>
                    <Button
                        type="primary"
                        style={{minWidth: '300px'}}
                        onClick={handleCreateTask}
                        className='btn btn-primary bg-primary text-white fs-4'
                    >
                        {loading ? <Spin/> : 'Tạo công việc'}
                    </Button>
                </div>
            </Modal>
            {/*modal show confirm*/}

            <Modal
                visible={showModalConfirm}
                onCancel={handleCloseModalConfirm}
                centered
                title="Thông báo hệ thống"
                footer={null}
            >
                <Typography>Bạn có chắc chắn muốn xóa nhóm này không?</Typography>
                <div className='d-flex justify-content-center' style={{marginTop: '16px'}}>
                    <Button
                        type=""
                        style={{
                            minWidth: '300px',
                            backgroundColor: '#ff0000',
                            color: 'fff',
                            fontWeight: '600'
                        }}
                        onClick={() => handleDeleteTask(taskSelected)}
                    >
                        {loadingDelete ? <Spin/> : 'Xác nhận xóa'}
                    </Button>
                </div>
            </Modal>
            {/*modal show info*/}

            <Modal
                visible={showModalInfo}
                onCancel={() => setShowModalInfo(false)}
                centered
                title="Thông tin công việc"
                footer={null}
            >
                <div className='pt-0'>
                    {selectedTask && (
                        <div className="mt-3">
                            <div className="card-body">
                                <Typography.Title level={5} className="mb-3">
                                    <strong>Tên công
                                        việc:</strong> {selectedTask?.task_name?.trim() || 'Không có tên công việc'}
                                </Typography.Title>
                                <Typography.Paragraph className="fs-5">
                                    <strong>Mô tả:</strong> {selectedTask?.task_description?.trim() || 'Không có mô tả'}
                                </Typography.Paragraph>
                                <Typography.Paragraph className="fs-5">
                                    <strong>Ngày bắt
                                        đầu:</strong> {moment(selectedTask?.task_start_date).format('DD-MM-YYYY')}
                                </Typography.Paragraph>
                                <Typography.Paragraph className="fs-5">
                                    <strong>Ngày kết
                                        thúc:</strong> {moment(selectedTask?.task_end_date).format('DD-MM-YYYY')}
                                </Typography.Paragraph>
                                {selectedTask.task_date_update_status_completed && (
                                    <Typography.Paragraph className="fs-5">
                                        <strong>Ngày hoàn
                                            thành:</strong> {moment(selectedTask?.task_date_update_status_completed).format('DD-MM-YYYY')}
                                    </Typography.Paragraph>
                                )}
                                <Typography.Paragraph className="fs-5">
                                    <strong>Trạng thái: </strong>
                                    <span
                                        style={{
                                            backgroundColor: checkStatus(selectedTask?.task_status).color,
                                            padding: '4px', borderRadius: '4px', color: '#fff'
                                        }}
                                    >
                                        {checkStatus(selectedTask?.task_status).status}
                        </span>
                                </Typography.Paragraph>
                                <Typography.Paragraph className="fs-5">
                                    <strong>Người thực hiện:</strong>
                                </Typography.Paragraph>
                                <div className='d-flex flex-wrap ms-3'>
                                    {selectedTask.users && selectedTask.users.map((user) => (
                                        <div key={user.id} title={user?.name} style={{marginLeft: '-8px'}}>
                                            <Avatar width={40} height={40}
                                                    name={user?.name}
                                                    imageUrl={user.avatar ? `${LARAVEL_SERVER}${user.avatar}` : ''}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {
                showComment && selectedTask &&
                <MessageComponent task={selectedTask} handleCloseComment={handleCloseComment}/>
            }

        </div>
    )
}
export default TaskList;