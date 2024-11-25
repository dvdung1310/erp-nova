import './GroupList.scss';
import React, {useState} from "react";
import {Link, useHistory, useLocation} from "react-router-dom";
import {Card, Col, Form, Input, List, Progress, Row, Select, Spin} from 'antd';
import {Dropdown} from "../../../../../components/dropdown/dropdown";
import {MdDelete, MdEdit, MdOutlineRemoveRedEye} from "react-icons/md";
import FeatherIcon from "feather-icons-react";
import {Modal} from "../../../../../components/modals/antd-modals";
import {Button} from "../../../../../components/buttons/buttons";
import {BasicFormWrapper} from "../../../../styled";
import Avatar from "../../../../../components/Avatar/Avatar";
import {checkRole} from "../../../../../utility/checkValue";
import {toast} from "react-toastify";
import {deleteGroup, updateGroup} from "../../../../../apis/work/group";
import {FaClipboardList} from "react-icons/fa";
import TaskList from "../../Task/overViewTask/TaskList";
import {CiWarning} from "react-icons/ci";
import {IoWarningOutline} from "react-icons/io5";
import {TbReportAnalytics} from "react-icons/tb";

const ListGroupComponent = ({listGroup, listUser = [], listDepartments}) => {
    const URL_LARAVEL = process.env.REACT_APP_LARAVEL_SERVER;
    const [form] = Form.useForm();
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [listUserData, setListUser] = useState(listUser);
    const history = useHistory();
    const location = useLocation();
    const {pathname} = location;
    const [tasks, setTasks] = useState([]);
    const [taskOverdue, setTaskOverdue] = useState([]);
    const [showModalTask, setShowModalTask] = useState(false);
    const [showModalTaskOverdue, setShowModalTaskOverdue] = useState(false);
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null)
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const filteredMembers = listUserData?.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSelectMember = (member) => {
        // Add the member if it's not already selected
        setSelectedMembers(member);
    };
    const handleShowModalTask = () => {
        setShowModalTask(true);
    }
    const handleShowModalTaskOverdue = () => {
        setShowModalTaskOverdue(true);
    }
    const handleShowModalConfirm = () => {
        setShowModalConfirm(true);
    }
    const handleShowModalEdit = () => {
        setShowModalEdit(true);
    }
    const handleCloseModal = () => {
        setShowModalConfirm(false);
        setShowModalEdit(false);
        setShowModalTask(false);
        setShowModalTaskOverdue(false);
    }
    const handleEditClick = (type, value) => {
        switch (type) {
            case 'name':
                form.setFieldsValue({
                    group_name: value.group_name,
                    group_description: value.group_description,
                    color: value.color,
                });
                setSelectedGroup(value)
                setSelectedMembers(value?.leader);
                handleShowModalEdit();
                break;
            case 'delete':
                setSelectedGroup(value)
                handleShowModalConfirm();
                break;
            case 'doing':
                const taskDeadlineWeekArray = Object.values(value?.taskDeadlineWeek || {});
                setTasks(taskDeadlineWeekArray);
                handleShowModalTask();
                break;
            case 'overdue':
                const taskOverdueArray = Object.values(value?.taskOverdueWeek || {});
                setTaskOverdue(taskOverdueArray);
                handleShowModalTaskOverdue();
                break;
            case 'report':
                history.push('/admin/lam-viec/bao-cao/' + value?.group_id);
                break;
            default:
                break
        }
    }
    const handleUpdateGroup = async () => {
        try {
            setIsLoading(true);
            const values = await form.validateFields();
            if (!values.group_name) {
                setIsLoading(false);
                return toast.warn('Tên nhóm không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
            }
            if (!values?.department_id) {
                setIsLoading(false);
                return toast.warn('Chọn phòng ban', {
                    position: "top-right",
                    autoClose: 1000,
                });
            }
            if (!values.color) {
                setIsLoading(false);
                return toast.warn('Màu không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
            }
            if (!selectedMembers || !selectedMembers.id) {
                setIsLoading(false);
                return toast.warn('Chọn trưởng nhóm', {
                    position: "top-right",
                    autoClose: 1000,
                });
            }
            const payload = {
                group_name: values.group_name,
                group_description: values.group_description,
                department_id: values.department_id,
                color: values.color,
                leader_id: selectedMembers?.id,
            }
            const res = await updateGroup(payload, selectedGroup?.group_id);
            if (res.error) {
                toast.error(res.error, {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            toast.success('Cập nhật nhóm thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            handleCloseModal();
            history.push('/admin/lam-viec', {
                key: 'createGroup',
                data: res.data,
            });
            setIsLoading(false);

        } catch (e) {
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            setIsLoading(false);
            console.log(e);
        }
    }
    const handleDeleteGroup = async () => {
        try {
            setIsLoading(true);
            const res = await deleteGroup(selectedGroup?.group_id);
            if (res.error) {
                toast.error(res.error, {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            toast.success('Xóa nhóm thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            handleCloseModal();
            history.push('/admin/lam-viec', {
                key: 'createGroup',
                data: res.data,
            });
            setIsLoading(false);
        } catch (e) {
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            setIsLoading(false);
            console.log(e);
        }
    }
    return (
        <div className='list-project'>
            <Row gutter={[16, 16]}>
                {
                    listGroup.length > 0 && listGroup.map((group, index) => {
                        return (
                            <Col xs={24} md={8} key={index}>
                                <Card
                                    hoverable
                                    style={{
                                        background: `linear-gradient(45deg, rgba(${parseInt(group?.color.slice(1, 3), 16)}, ${parseInt(group?.color.slice(3, 5), 16)}, ${parseInt(group?.color.slice(5, 7), 16)}, 0.2), #dadada)`,
                                        height: '100%',
                                    }}
                                >
                                    <div>
                                        <Card.Meta
                                            title={
                                                <div className="d-flex justify-content-between align-items-center"
                                                     style={{marginBottom: '20px', flexWrap: 'wrap'}}>
                                                    <div className='d-flex align-items-center'>
                                                        <div style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            backgroundColor: group?.color,
                                                            borderRadius: '4px',
                                                            marginRight: '10px',
                                                        }}></div>
                                                        <Link to={`/admin/lam-viec/nhom-lam-viec/${group?.group_id}`}
                                                              style={{fontSize: '24px'}}>
                                                            {group?.group_name}
                                                        </Link>
                                                    </div>
                                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                                        <div className='action-item'
                                                             style={{marginRight: '10px'}}
                                                             title='Báo cáo công việc'
                                                             onClick={() => handleEditClick('report', group)}>
                                                            <TbReportAnalytics size={20}

                                                                               className='d-block ms-1 fs-4 text-secondary'/>
                                                        </div>
                                                        <div className='action-item'
                                                             style={{marginRight: '10px'}}
                                                             title='Công việc quá hạn'
                                                             onClick={() => handleEditClick('overdue', group)}>
                                                            <IoWarningOutline size={20}

                                                                              className='d-block ms-1 fs-4 text-secondary'/>
                                                        </div>
                                                        <div className='action-item'
                                                             style={{marginRight: '10px'}}
                                                             title='Công việc đang làm'
                                                             onClick={() => handleEditClick('doing', group)}>
                                                            <MdOutlineRemoveRedEye size={20}

                                                                                   className='d-block ms-1 fs-4 text-secondary'/>
                                                        </div>

                                                        <Dropdown
                                                            className="wide-dropdwon"
                                                            content={
                                                                <div className='popover-content'>
                                                                    <div className='action-item'
                                                                         onClick={() => handleEditClick('name', group)}>
                                                                        <MdEdit size={30}

                                                                                className='d-block ms-1 fs-4 text-secondary'/>
                                                                        <span>Sửa tên, mô tả ...</span>
                                                                    </div>

                                                                    <div className='action-item'
                                                                         onClick={() => handleEditClick('delete', group)}>
                                                                        <MdDelete color='red' size={30}

                                                                                  className='icon-delete'/>
                                                                        <span>Xóa nhóm</span>
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <div role='button' style={{cursor: 'pointer'}}>
                                                                <FeatherIcon icon="more-horizontal" size={18}/>
                                                            </div>
                                                        </Dropdown>
                                                    </div>

                                                </div>
                                            }
                                        />
                                        <Link to={`/admin/lam-viec/nhom-lam-viec/${group?.group_id}`}>
                                            <p><strong>Trưởng nhóm:</strong> {group?.leader?.name}</p>
                                            <p><strong>Tổng số dự án:</strong> {group?.total_projects}</p>
                                            <p><strong>Tổng số công việc:</strong> {group?.total_tasks}</p>
                                            <Progress
                                                percent={Math.round((group?.total_overdue_tasks / group?.total_tasks) * 100)}
                                                status="exception"
                                                showInfo={false}
                                            />
                                            <p className='d-flex justify-content-between'>
                                                <span><strong>Quá hạn</strong> {group?.total_overdue_tasks} / {group?.total_tasks} công việc</span>
                                                <span className="float-right">
                                                {/* eslint-disable-next-line no-restricted-globals */}
                                                    {isNaN(group?.total_overdue_tasks) || isNaN(group?.total_tasks) || group?.total_tasks === 0
                                                        ? '0%'
                                                        : `${Math.round((group?.total_overdue_tasks / group?.total_tasks) * 100)}%`}
                                        </span>
                                            </p>
                                            <Progress
                                                percent={Math.round((group?.total_doing_tasks / group?.total_tasks) * 100)}
                                                status="active"
                                                showInfo={false}
                                            />
                                            <p className='d-flex justify-content-between'>
                                                <span><strong>Đang làm</strong> {group?.total_doing_tasks} / {group?.total_tasks} công việc</span>
                                                <span className="float-right">
                                                {/* eslint-disable-next-line no-restricted-globals */}
                                                    {isNaN(group?.total_doing_tasks) || isNaN(group?.total_tasks) || group?.total_tasks === 0
                                                        ? '0%'
                                                        : `${Math.round((group?.total_doing_tasks / group?.total_tasks) * 100)}%`}
                                        </span>
                                            </p>
                                            <Progress
                                                percent={Math.round((group?.total_completed_tasks / group?.total_tasks) * 100)}
                                                status="success"
                                                showInfo={false}
                                            />
                                            <p className='d-flex justify-content-between'>
                                                <span><strong>Hoàn thành</strong> {group?.total_completed_tasks} / {group?.total_tasks} công việc</span>
                                                <span className="float-right">
                                                {/* eslint-disable-next-line no-restricted-globals */}
                                                    {isNaN(group?.total_completed_tasks) || isNaN(group?.total_tasks) || group?.total_tasks === 0
                                                        ? '0%'
                                                        : `${Math.round((group?.total_completed_tasks / group?.total_tasks) * 100)}%`}
                                        </span>
                                            </p>
                                        </Link>
                                    </div>
                                </Card>
                            </Col>
                        )
                    })
                }
            </Row>
            {/*modal update*/}
            <Modal
                type="primary"
                title="Tạo dự án"
                visible={showModalEdit}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" type="primary" key="submit" onClick={handleUpdateGroup}
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
                onCancel={handleCloseModal}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <Form form={form} name="createProject" onFinish={handleUpdateGroup}>
                            <Form.Item name="group_name" label="">
                                <Input placeholder="Tên nhóm"/>
                            </Form.Item>
                            <Form.Item name="group_description" label="">
                                <Input.TextArea rows={2} placeholder="Mô tả"/>
                            </Form.Item>
                            <Form.Item name="color" label="Chọn màu">
                                <Input type="color" placeholder="Chọn màu"/>
                            </Form.Item>
                            <Form.Item name="department_id" label="Chọn phòng ban">
                                <Select
                                    showSearch
                                    placeholder="Chọn phòng ban"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {
                                        listDepartments && listDepartments?.map((department, index) => (
                                            <Select.Option key={index}
                                                           value={department.department_id}>{department.department_name}</Select.Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item name="leader" label="Chọn trưởng nhóm">
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
                                                        <small className="text-muted">{member.email}</small>
                                                        <br/>
                                                        <strong
                                                            className="text-muted">{checkRole(member.role_id)}</strong>
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
            {/*    modal confirm delete*/}
            <Modal
                type='primary'
                title=" Xác nhận xóa nhóm"
                visible={showModalConfirm}
                onCancel={handleCloseModal}
                footer={[
                    <div key="1" className="project-modal-footer">
                        <Button size="default" key="submit" className='btn' onClick={handleDeleteGroup}
                                style={{
                                    backgroundColor: "#dc3545",
                                    minWidth: '150px',
                                    color: 'white',
                                }}
                        >
                            {isLoading ? <div>
                                <Spin/>
                            </div> : 'Xóa'}
                        </Button>
                    </div>,
                ]}
            >
                <div className="project-modal">
                    <BasicFormWrapper>
                        <p>Bạn có chắc chắn muốn xóa nhóm này không?</p>
                    </BasicFormWrapper>
                </div>
            </Modal>
            {/*    modal show tasks*/}
            <Modal
                type='primary'
                title="Danh sách công việc đang làm"
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
            {/*    modal show overdue task*/}
            <Modal
                type='primary'
                title="Danh sách công việc quá hạn"
                visible={showModalTaskOverdue}
                className='modal-main'
                onCancel={handleCloseModal}
                footer={null}
            >
                <div>
                    {
                        taskOverdue?.length > 0 ? <>
                            <TaskList listUser={[]} tasks={taskOverdue} setTasks={setTaskOverdue} isHome/>
                        </> : <div className='text-center mt-5'>Không có công việc nào</div>
                    }

                </div>
            </Modal>
        </div>
    )
        ;
}
export default ListGroupComponent;