import React, {useState, useEffect} from 'react';
import {Form, Input, Select, Col, Row, DatePicker, Spin} from 'antd';
import propTypes from 'prop-types';
import {Button} from '../../../../../components/buttons/buttons';
import {Modal} from '../../../../../components/modals/antd-modals';
import {CheckboxGroup} from '../../../../../components/checkbox/checkbox';
import {BasicFormWrapper} from '../../../../styled';
import {useHistory, useLocation, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {createProject} from "../../../../../apis/work/project";

const dateFormat = 'MM/DD/YYYY';

function CreateProject({visible, onCancel, group_id}) {
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

    const handleOk = async () => {
        try {
            setIsLoading(true);
            const data = form.getFieldsValue();
            if (!data?.project_name) {
                toast.warn('Tên dự án không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                return;
            }
            if (!data?.project_start_date) {
                toast.warn('Ngày bắt đầu không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                return;
            }
            if (!data?.project_end_date) {
                toast.warn('Ngày kết thúc không được để trống', {
                    position: "top-right",
                    autoClose: 1000,
                });
                return;
            }
            const payload = {
                project_name: data?.project_name,
                project_description: data?.project_description,
                project_start_date: data?.project_start_date?.format('YYYY-MM-DD'),
                project_end_date: data?.project_end_date?.format('YYYY-MM-DD'),
                group_id,
                pathname
            }
            const res = await createProject(payload);
            if (res.error) {
                toast.error('Tạo dự án thất bại', {
                    position: "top-right",
                    autoClose: 1000,
                });
            }
            toast.success('Tạo dự án thành công', {
                position: "top-right",
                autoClose: 1000,
            });
            form.resetFields();
            onCancel();
            history.push(pathname, {
                key: 'createProject',
                data: res?.data
            });
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false)
            console.log(e);
        }

    };

    const handleCancel = () => {
        onCancel();
    };


    return (
        <Modal
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
                        <Form.Item name="project_name" label="">
                            <Input placeholder="Tên dự án"/>
                        </Form.Item>
                        <Form.Item name="project_description" label="">
                            <Input.TextArea rows={4} placeholder="Mô tả dự án"/>
                        </Form.Item>
                        <Row gutter={15}>
                            <Col md={12}>
                                <Form.Item name="project_start_date" label="Ngày bắt đầu">
                                    <DatePicker placeholder="mm/dd/yyyy" format={dateFormat}/>
                                </Form.Item>
                            </Col>
                            <Col md={12}>
                                <Form.Item name="project_end_date" label="Ngày kết thúc">
                                    <DatePicker placeholder="mm/dd/yyyy" format={dateFormat}/>
                                </Form.Item>
                            </Col>
                        </Row>
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
