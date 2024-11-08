import React, {useState} from 'react';
import FeatherIcon from 'feather-icons-react';
import RichTextEditor from 'react-rte';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import {Link} from 'react-router-dom';
import propTypes from 'prop-types';
import {Upload, message, Spin} from 'antd';
import {MailBox} from './style';
import {Button} from '../../components/buttons/buttons';
import {createNotification} from "../../apis/work/notification";
import {toast} from "react-toastify";

function MailComposer({handleClose}) {
    console.log(handleClose)
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());
    const [notification_title, setNotificationTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const handleChangeEditer = (value) => {
        setEditorState(value);
    };

    const handleUploadChange = info => {
        let files = [...info.fileList];
        files = files.map(file => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });
        setFileList(files);

        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };
    console.log(fileList);
    const onSubmit = async () => {
        try {
            setLoading(true);
            if (!notification_title) {
                toast.error('Vui lòng nhập tiêu đề thông báo', {
                    position: 'top-right',
                    autoClose: 1000
                });
                setLoading(false);
                return;
            }
            if (editorState.toString('html') === '<p><br></p>') {
                toast.error('Vui lòng nhập nội dung thông báo', {
                    position: 'top-right',
                    autoClose: 1000
                });
                setLoading(false);
                return;
            }
            const formData = new FormData();
            fileList.forEach(file => {
                formData.append('files[]', file.originFileObj);
            });
            formData.append('notification_title', notification_title);
            formData.append('notification_content', editorState.toString('html'));
            formData.append('pathname', '/admin/thong-bao/chi-tiet');
            const res = await createNotification(formData);
            if (res?.error) {
                toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau', {
                    position: 'top-right',
                    autoClose: 1000
                });
                setLoading(false);
                return;
            }
            if (res?.success) {
                toast.success('Gửi thông báo thành công', {
                    position: 'top-right',
                    autoClose: 1000
                });
                setLoading(false);
                return
            }
            setFileList([]);
            setEditorState(RichTextEditor.createEmptyValue());
            setNotificationTitle('');
            handleClose();
            setLoading(false);
        } catch (e) {
            toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau', {
                position: 'top-right',
                autoClose: 1000
            });
            setLoading(false)
            console.log(e);
        }
    };

    const uploadProps = {
        name: 'file',
        headers: {
            authorization: 'authorization-text',
        },
        multiple: true,
        onChange: handleUploadChange,
        beforeUpload: (file) => {
            // Add the selected file to the state
            setFileList(prevFileList => [...prevFileList, file]);
            // Prevent automatic upload
            return false;
        },
    };

    return (
        <MailBox>
            <div className="body">

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                     className="group">
                    <div className="reply-inner" style={{display: 'flex', alignItems: 'center'}}>
                        <input
                            className='ant-input'
                            type="text"
                            placeholder={'Tiêu đề'}
                            value={notification_title}
                            onChange={(e) => setNotificationTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="group">
                    <RichTextEditor
                        className='custom-rich-text-editor'
                        placeholder="Nhập mô tả dự án"
                        name={'project_description'}
                        value={editorState}
                        onChange={handleChangeEditer}
                    />
                </div>
            </div>

            <div className="footer">
                <div className="left d-flex align-items-center">
                    <Button size="default" style={{minWidth: '200px'}} type="primary" onClick={onSubmit} raised>
                        {
                            loading ? <Spin/> : 'Gửi'
                        }

                    </Button>
                    <Link to="#">
                        <Upload {...uploadProps}>
                            <FeatherIcon icon="paperclip" size={16}/>
                        </Upload>
                    </Link>
                </div>
            </div>

        </MailBox>
    );
}

MailComposer.propTypes = {
    onClose: propTypes.func,
};

export default MailComposer;