import React, {useState} from 'react';
import {Form, Input, List, Progress, Spin, Tag} from 'antd';
import FeatherIcon from 'feather-icons-react';
import {Link, useHistory, useLocation, useRouteMatch} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {Dropdown} from '../../../../../components/dropdown/dropdown';
import {textRefactor} from '../../../../../components/utilities/utilities';
import {ProjectCard} from '../style';
import {MdDelete, MdEdit, MdGroups, MdOutlineDateRange} from "react-icons/md";
import {GrInProgress} from "react-icons/gr";
import {Modal} from "../../../../../components/modals/antd-modals";
import {Button} from "../../../../../components/buttons/buttons";
import {BasicFormWrapper} from "../../../../styled";
import Avatar from "../../../../../components/Avatar/Avatar";
import {checkRole} from "../../../../../utility/checkValue";
import {toast} from "react-toastify";
import {deleteGroup, updateGroup} from "../../../../../apis/work/group";

function GridCard({value, listUser}) {
    const {group_id, group_name, color, leader} = value;
    const [form] = Form.useForm();
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [listUserData, setListUser] = useState(listUser);
    const history = useHistory();
    const location = useLocation();
    const {pathname} = location;
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
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
    const handleShowModalConfirm = () => {
        setShowModalConfirm(true);
    }
    const handleShowModalEdit = () => {
        setShowModalEdit(true);
    }
    const handleCloseModal = () => {
        setShowModalConfirm(false);
        setShowModalEdit(false);
    }

    const handleEditClick = (type, value) => {
        switch (type) {
            case 'name':
                form.setFieldsValue({
                    group_name: value.group_name,
                    group_description: value.group_description,
                    color: value.color,
                });
                setSelectedMembers(value.leader);
                handleShowModalEdit();
                break;
            case 'delete':
                handleShowModalConfirm();
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
                color: values.color,
                leader_id: selectedMembers?.id,
            }
            const res = await updateGroup(payload, group_id);
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
            history.push({pathname}, {
                key: 'updateGroup',
                data: res.data,
            })
            setIsLoading(false);

        } catch (e) {
            setIsLoading(false);
            console.log(e);
        }
    }
    const handleDeleteGroup = async () => {
        try {
            setIsLoading(true);
            const res = await deleteGroup(group_id);
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
            history.push({pathname}, {
                key: 'deleteGroup',
                data: value,
            })
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.log(e);
        }
    }
    return (
        <>
            <ProjectCard>
                <Cards headless>
                    <div className='d-flex align-items-center project-container'>
                        <div className="card-top">
                            <div style={{
                                backgroundColor: color,
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                            }}></div>
                        </div>
                        <div className="project-top">
                            <div className="project-title">
                                <h1>
                                    <Link to={`/admin/lam-viec/nhom-lam-viec/${group_id}`}>{group_name}</Link>
                                </h1>

                            </div>
                            <div className="project-timing">
                                <span>Trưởng nhóm: {leader?.name}</span>
                            </div>
                        </div>
                        <Dropdown
                            className="wide-dropdwon"
                            content={
                                <div className='popover-content'>
                                    <div className='action-item' onClick={() => handleEditClick('name', value)}>
                                        <MdEdit size={30} className='d-block ms-1 fs-4 text-secondary'/>
                                        <span>Sửa tên, mô tả ...</span>
                                    </div>
                                    <div className='action-item' onClick={() => handleEditClick('delete', value)}>
                                        <MdDelete color='red' size={30} className='icon-delete'/>
                                        <span>Xóa dự án</span>
                                    </div>
                                </div>
                            }
                        >
                            <div role='button' style={{cursor: 'pointer'}}>
                                <FeatherIcon icon="more-horizontal" size={18}/>
                            </div>
                        </Dropdown>
                    </div>

                </Cards>
            </ProjectCard>
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
        </>

    );
}

GridCard.propTypes = {
    value: PropTypes.object,
};

export default GridCard;
