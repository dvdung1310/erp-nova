import React, {useState, useEffect} from 'react';
import {Form, Input, Select, Col, Row, DatePicker, Spin, List} from 'antd';
import propTypes from 'prop-types';
import {Button} from '../../../../../components/buttons/buttons';
import {Modal} from '../../../../../components/modals/antd-modals';
import {CheckboxGroup} from '../../../../../components/checkbox/checkbox';
import {BasicFormWrapper} from '../../../../styled';
import {useHistory, useLocation, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {createProject} from "../../../../../apis/work/project";
import Avatar from "../../../../../components/Avatar/Avatar";
import {checkRole} from "../../../../../utility/checkValue";

const dateFormat = 'MM/DD/YYYY';
import RichTextEditor from 'react-rte';

function CreateProject({visible, onCancel, group_id, listUser = []}) {
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
    //
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());
    const handleChangeEditer = (value) => {
        setEditorState(value);
    };

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
    ///
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
///
    const handleOk = async () => {
        try {
            setIsLoading(true);
            const data = form.getFieldsValue();
            if (!data?.project_name) {
                toast.warn('Tên dự án không được để trống', {
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
            if (!data?.project_start_date) {
                toast.warn('Ngày bắt đầu không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            if (!data?.project_end_date) {
                toast.warn('Ngày kết thúc không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                setIsLoading(false);
                return;
            }
            const payload = {
                project_name: data?.project_name,
                project_description: editorState.toString('html'),
                project_start_date: data?.project_start_date?.format('YYYY-MM-DD'),
                project_end_date: data?.project_end_date?.format('YYYY-MM-DD'),
                group_id,
                leader_id: selectedMembers?.id,
                pathname
            }
            const res = await createProject(payload);
            if (res.error) {
                toast.error('Tạo dự án thất bại', {
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
            form.resetFields();
            onCancel();
            setEditorState(RichTextEditor.createEmptyValue());
            history.push(pathname, {
                key: 'createProject',
                data: res?.data
            });
            setIsLoading(false);
        } catch (e) {
            toast.error('Tạo dự án thất bại', {
                position: "top-right",
                autoClose: 1000,
            })
            setIsLoading(false)
            console.log(e);
        }

    };

    const handleCancel = () => {
        onCancel();
    };


    return (
        <Modal
            className='modal-project'
            type={state.modalType}
            title="Tạo dự án"
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
                        </div> : 'Tạo dự án'}

                    </Button>
                </div>,
            ]}
            onCancel={handleCancel}
        >
            <div className="project-modal">
                <BasicFormWrapper>
                    <Form form={form} name="createProject" onFinish={handleOk}>
                        <Form.Item name="project_name" label=""
                                   rules={[{required: true, message: 'Vui lòng nhập tên dự án!'}]}
                        >
                            <Input placeholder="Tên dự án"/>
                        </Form.Item>
                        <Form.Item name="project_description" label="">
                            <div className="group">
                                <RichTextEditor
                                    style={{minHeight: '100px'}}
                                    className='custom-rich-text-editor'
                                    placeholder="Nhập mô tả dự án"
                                    name={'project_description'}
                                    value={editorState}
                                    onChange={handleChangeEditer}/>
                            </div>
                        </Form.Item>
                        <Row gutter={15}>
                            <Col md={12}>
                                <Form.Item name="project_start_date" label="Ngày bắt đầu"
                                           rules={[{required: true, message: 'Vui lòng nhập ngày bắt đầu!'}]}
                                >
                                    <DatePicker placeholder="mm/dd/yyyy" format={dateFormat}/>
                                </Form.Item>
                            </Col>
                            <Col md={12}>
                                <Form.Item name="project_end_date" label="Ngày kết thúc"
                                           rules={[{required: true, message: 'Vui lòng nhập ngày kết thúc!'}]}
                                >
                                    <DatePicker placeholder="mm/dd/yyyy" format={dateFormat}/>
                                </Form.Item>
                            </Col>
                        </Row>
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
    );
}

CreateProject.propTypes = {
    visible: propTypes.bool.isRequired,
    onCancel: propTypes.func.isRequired,
};

export default CreateProject;
