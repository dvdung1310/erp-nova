import {Button, DatePicker, Input, List, Radio, Select, Spin} from "antd";
import {Modal} from "../../../../../components/modals/antd-modals";
import React, {useEffect, useState} from "react";
import {PlusOutlined, RightOutlined} from "@ant-design/icons";
import {toast} from "react-toastify";
import {getAllGroupParent, getGroupByParentId} from "../../../../../apis/work/group";
import {IoMdArrowRoundBack} from "react-icons/io";
import {copyProject} from "../../../../../apis/work/project";
import {useHistory, useParams} from "react-router-dom";
import moment from "moment/moment";

const CopyProject = ({project, visible, onCancel}) => {
    const params = useParams();
    const {id} = params;
    const history = useHistory();
    const [currentGroup, setCurrentGroup] = useState(null);
    const [prevGroup, setPrevGroup] = useState([{}]);
    const [groups, setGroups] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [workGroup, setWorkGroup] = useState({});
    const [memberSetting, setMemberSetting] = useState("remove");
    const [startDate, setStartDate] = useState();
    const [loading, setLoading] = useState(false);
    //
    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await getAllGroupParent();
            setGroups(res?.data);
            setLoading(false);
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu nhóm làm việc");
            setLoading(false);
            console.log(error);
        }
    }
    useEffect(() => {
        setTaskName(`${project?.project_name} - Copy`)
        fetchGroups();
    }, [project]);
    const fetchGroupChildren = async (id) => {
        try {
            setLoading(true);
            const res = await getGroupByParentId(id);
            setGroups(res?.data?.groups);
            setPrevGroup([...prevGroup, res?.data?.currentGroup]);
            setCurrentGroup(res?.data?.currentGroup);
            setLoading(false);
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu nhóm làm việc");
            setLoading(false);
            console.log(error);
        }
    }
    const handleBack = async () => {
        const newPrevGroup = [...prevGroup];
        newPrevGroup.pop();
        setPrevGroup(newPrevGroup);

        if (newPrevGroup.length === 1) {
            await fetchGroups();
            setCurrentGroup(null);
        } else {
            const prevGroupLast = newPrevGroup[newPrevGroup.length - 1];
            setCurrentGroup(prevGroupLast);
            const res = await getGroupByParentId(prevGroupLast.group_id);
            setGroups(res?.data?.groups);
        }
    }
    const handleFetchGroupChildren = async (id) => {
        await fetchGroupChildren(id);
    }

    const [showModalChildren, setShowModalChildren] = useState(false);
    const handleCloseModalChildren = () => {
        setShowModalChildren(false);
    }
    const handleOpenModalChildren = () => {
        setShowModalChildren(true);
    }
    const [searchTerm, setSearchTerm] = useState("");

    const filteredGroups = groups.filter((group) =>
        group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleSelectGroup = (group) => {
        setWorkGroup(group);
        setShowModalChildren(false);
    }
    const handleOk = async () => {
        try {
            if (!taskName) {
                toast.error("Vui lòng nhập tên bảng việc");
                return;
            }
            if (!workGroup?.group_id) {
                toast.error("Vui lòng chọn nhóm làm việc");
                return;
            }
            if (!startDate) {
                toast.error("Vui lòng chọn ngày bắt đầu tiến độ");
                return;
            }
            const payload = {
                project_id: project?.project_id,
                project_name: taskName,
                group_id: workGroup?.group_id,
                memberSetting,
                start_date: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
            }
            const res = await copyProject(payload);
            console.log(res)
            if (res.error) {
                toast.error(res.message);
                return
            }
            toast.success("Sao chép dự án thành công");
            if (workGroup?.group_id.toString() === id.toString()) {
                console.log('reload')
                window.location.reload();
            }
            history.push(`/admin/lam-viec/nhom-lam-viec/${workGroup?.group_id}`);
        } catch (error) {
            toast.error("Lỗi khi sao chép dự án");
            console.log(error);
        }
    }
    return (
        <div>
            {/*modal parent*/}
            <Modal
                title="Sao chép Bảng việc"
                visible={visible}
                onCancel={onCancel}
                footer={[
                    <Button key="cancel" onClick={onCancel}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>
                        Hoàn thành
                    </Button>,
                ]}
            >
                <div style={{marginBottom: 16}}>
                    <label style={{marginBottom: '10px', display: 'block'}}>Tên Bảng việc mới <span
                        style={{color: 'red'}}>*</span></label>
                    <Input
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="Nhập tên bảng việc mới"
                    />
                </div>

                <div style={{marginBottom: 16}}>
                    <label style={{marginBottom: '10px', display: 'block'}}>Nhóm làm việc <span
                        style={{color: 'red'}}>*</span></label>
                    <Select
                        value={workGroup?.group_name}
                        onClick={handleOpenModalChildren}
                        style={{width: "100%"}}
                    >
                        {/* Add more options as needed */}
                    </Select>
                </div>

                <div style={{marginBottom: 16}}>
                    <div style={{marginBottom: '10px', display: 'block'}}>Cài đặt thành viên</div>
                    <Radio.Group
                        onChange={(e) => setMemberSetting(e.target.value)}
                        value={memberSetting}
                    >
                        <Radio value="keep">Giữ nguyên thành viên</Radio>
                        <Radio value="remove">Xóa toàn bộ thành viên</Radio>
                    </Radio.Group>
                </div>

                <div style={{marginBottom: 16}}>
                    <label style={{marginBottom: '10px', display: 'block'}}>Chọn ngày bắt đầu tiến độ <span
                        style={{color: 'red'}}>*</span></label>
                    <DatePicker
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        style={{width: "100%"}}
                        format="DD/MM/YYYY"
                    />
                </div>

                <p style={{color: "gray", fontSize: "12px"}}>
                    Mọi hoạt động thảo luận, tài liệu trong bảng sẽ không được sao chép sang
                    bảng mới.
                </p>
            </Modal>
            {/*modal children*/}
            <Modal
                className='modal-copy-project'
                title="Nhóm làm việc"
                visible={showModalChildren}
                onCancel={handleCloseModalChildren}
                footer={[
                    <Button key="cancel" onClick={handleCloseModalChildren}>
                        Thoát
                    </Button>,
                ]}
            >
                <Input
                    placeholder="Tìm nhóm làm việc"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{marginBottom: 16}}
                />
                {
                    loading ? <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                        <Spin/>
                    </div> : <>
                        {
                            currentGroup &&
                            <div style={{marginBottom: 16, display: 'flex', alignItems: 'center', fontSize: '20px'}}>
                                <IoMdArrowRoundBack style={{cursor: 'pointer'}}
                                                    onClick={handleBack} size={20}/>
                                <span style={{marginLeft: '10px'}}>{currentGroup?.group_name}</span>
                            </div>
                        }

                        <List
                            itemLayout="horizontal"
                            dataSource={filteredGroups}
                            renderItem={(group) => (
                                <List.Item
                                    style={{
                                        paddingLeft: "16px",
                                        borderLeft: `5px solid ${group.color}`,
                                    }}
                                    actions={[
                                        <RightOutlined onClick={() => handleFetchGroupChildren(group?.group_id)}
                                                       style={{fontSize: "16px", color: "#aaa", cursor: 'pointer'}}/>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        style={{cursor: 'pointer'}}
                                        onClick={() => handleSelectGroup(group)}
                                        title={group.group_name}
                                    />
                                </List.Item>
                            )}
                        />
                    </>
                }

            </Modal>
        </div>

    );
}
export default CopyProject;