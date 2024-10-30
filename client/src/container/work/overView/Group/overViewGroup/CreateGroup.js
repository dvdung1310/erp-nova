import React, {useState, useEffect} from 'react';
import {Form, Input, Select, Col, Row, DatePicker, Spin, List} from 'antd';
import propTypes from 'prop-types';
import {Button} from '../../../../../components/buttons/buttons';
import {Modal} from '../../../../../components/modals/antd-modals';
import {BasicFormWrapper} from '../../../../styled';
import {useHistory, useLocation, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import Avatar from "../../../../../components/Avatar/Avatar";
import {checkRole} from "../../../../../utility/checkValue";
import {createGroup} from "../../../../../apis/work/group";

const dateFormat = 'MM/DD/YYYY';

function CreateGroup({visible, onCancel, group_id, listUser = [], admin = false}) {
    const [listUserData, setListUser] = useState(listUser);
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const location = useLocation();
    const {pathname} = location;
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory()
    const [form] = Form.useForm();
    const [state, setState] = useState({
        visible,
        modalType: 'primary',
        checked: [],
    });

    useEffect(() => {
        let unmounted = false;
        if (!unmounted) {
            setState({
                visible,
            });
        }
        return () => {
            unmounted = true;
        };
    }, [visible]);
    useEffect(() => {
        setListUser(listUser);
    }, [listUser]);
    //
    const [selectedMembers, setSelectedMembers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const filteredMembers = listUserData && listUserData.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectMember = (member) => {
        // Add the member if it's not already selected
        setSelectedMembers(member);
    };

    const handleOk = async () => {
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
            const data = {
                group_name: values.group_name,
                group_description: values.group_description,
                parent_group_id: group_id,
                color: values.color,
                leader_id: selectedMembers.id,
            };
            const res = await createGroup(data);
            if (res.error) {
                toast.error(res.error, {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            toast.success('Tạo dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            onCancel();
            setSelectedMembers([]);
            form.resetFields();
            if (admin) {
                history.push('/admin/lam-viec', {
                    key: 'createGroup',
                    data: res.data,
                });
                setIsLoading(false);
                return;
            }
            history.push({pathname}, {
                key: 'createGroup',
                data: res.data,
            })

            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.log(e);
            toast.error(e?.response?.data?.message, {
                position: "top-right",
                autoClose: 1000,
            });
        }


    };

    const handleCancel = () => {
        onCancel();
    };


    return (
        <Modal
            type={state.modalType}
            title="Tạo nhóm"
            visible={state.visible}
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
                        </div> : 'Tạo nhóm'}

                    </Button>
                </div>,
            ]}
            onCancel={handleCancel}
        >
            <div className="project-modal">
                <BasicFormWrapper>
                    <Form form={form} name="createProject" onFinish={handleOk}>
                        <Form.Item name="group_name" label=""
                                   rules={[{required: true, message: 'Vui lòng nhập tên nhóm!'}]}
                        >
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
                                    <List.Item onClick={() => handleSelectMember(member)} style={{cursor: 'pointer'}}>
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
                                                    <strong className="text-muted">{checkRole(member.role_id)}</strong>
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
    );
}

CreateGroup.propTypes = {
    visible: propTypes.bool.isRequired,
    onCancel: propTypes.func.isRequired,
};

export default CreateGroup;
