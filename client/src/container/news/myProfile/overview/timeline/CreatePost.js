/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useState} from 'react';
import FeatherIcon from 'feather-icons-react';
import {Input, Modal, Upload} from 'antd';
import {useSelector, useDispatch} from 'react-redux';
import {BackShadow, CreatePost} from './style';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {Button} from '../../../../../components/buttons/buttons';
import {submitPost} from '../../../../../redux/profile/actionCreator';

const dateFormat = 'MM/DD/YYYY';
import RichTextEditor from 'react-rte';
import {toast} from "react-toastify";
import {createPost} from "../../../../../apis/socials/posts";

const typeFake = [
    {
        id: 1,
        name: 'Thông báo',
        description: 'Thông báo'
    },
    {
        id: 2,
        name: 'Chia sẻ',
        description: 'Chia sẻ'
    },
    {
        id: 3,
        name: 'Hỏi đáp',
        description: 'Hỏi đáp'
    }
]

function Post() {
    const dispatch = useDispatch();

    const [drawer, setDrawer] = useState(false);
    const [showModalCategory, setShowModalCategory] = useState(false);
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());
    const [postTitle, setPostTitle] = useState('');
    const [typeSelected, setTypeSelected] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleChangeEditer = (value) => {
        setEditorState(value);
    };
    const onCreate = async () => {
        try {
            setLoading(true);
            const form = new FormData();
            if (!postTitle) {
                toast.error('Vui lòng nhập tiêu đề bài viết');
                setLoading(false);
                return;
            }
            if (!editorState.toString('html')) {
                toast.error('Vui lòng nhập nội dung bài viết');
                setLoading(false);
                return;
            }
            if (!typeSelected) {
                toast.error('Vui lòng chọn thể loại bài viết');
                setLoading(false);
                return;
            }
            form.append('post_title', postTitle);
            form.append('post_content', editorState.toString('html'));
            form.append('post_category', typeSelected.id);
            fileList.forEach(file => {
                form.append('files[]', file.originFileObj);
            });
            const res = await createPost(form);
            console.log(res)
            toast.success('Đăng bài thành công');
            setDrawer(false);
            setPostTitle('');
            setEditorState(RichTextEditor.createEmptyValue());
            setTypeSelected(null);
            setFileList([]);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('Đã có lỗi xảy ra')
            console.log(error)
        }
    };
    const handleUploadChange = ({fileList}) => {
        setFileList(fileList);
    };
    const onTextChange = (e) => {
        setPostTitle(e.target.value);
    };

    return (
        <>
            <CreatePost>
                <Cards title="Tạo bài viết trên bảng tin nội bộ">
                    <div onClick={() => setDrawer(true)} className="postBody">
                        <img className="post-author" src={require('../../../../../static/img/chat-author/t4.jpg')}
                             alt=""/>
                        <Input.TextArea placeholder="Bạn đang nghĩ gì ..."/>
                    </div>
                </Cards>
                <Modal
                    title="Tạo bài viết trên bảng tin nội bộ"
                    visible={drawer}
                    onOk={onCreate}
                    centered
                    footer={null}
                    className='modal-post'
                    onCancel={() => setDrawer(false)}
                >
                    <CreatePost>
                        <Cards title="">
                            <div className="postBody">
                                <div>
                                    <Input value={postTitle} placeholder="Tiêu đề bài viết" onChange={onTextChange}/>
                                </div>
                                <div>
                                    <RichTextEditor
                                        style={{minHeight: '100px'}}
                                        className='custom-rich-text-editor'
                                        placeholder="Nội dung bài viết ..."
                                        name={'project_description'}
                                        value={editorState}
                                        onChange={handleChangeEditer}/>
                                </div>
                                <div>
                                    <Button className="btn-more" type='light' onClick={() => setShowModalCategory(true)}
                                            icon={<FeatherIcon icon="plus"/>}>
                                        Chọn thể loại
                                    </Button>
                                    <div>
                                        {typeSelected && (
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                backgroundColor: '#f0f0f0',
                                                margin: '5px 0',
                                                display: 'inline-block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#333',
                                                marginTop: '10px'
                                            }}>
                                                {typeSelected.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="postFooter">
                                <div className="postFooter_left">
                                    <Upload
                                        name="image"
                                        listType="picture"
                                        fileList={fileList}
                                        beforeUpload={() => false}
                                        onChange={handleUploadChange}>
                                        <Button shape="circle" type="light">
                                            <img src={require('../../../../../static/img/icon/image.png')} alt=""/>
                                            Photo/Video
                                        </Button>
                                    </Upload>
                                </div>
                                <div className="postFooter_right">
                                    {drawer && (
                                        <Button className="btn-post" loading={loading} onClick={onCreate}
                                                type="primary">
                                            Đăng bài
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Cards>
                    </CreatePost>
                </Modal>
            </CreatePost>
            <Modal
                title="Chọn thể loại"
                visible={showModalCategory}
                centered
                onCancel={() => setShowModalCategory(false)}
                footer={null}
                bodyStyle={{display: 'flex', justifyContent: 'space-around', padding: '20px 0'}}
                style={{borderRadius: '8px', padding: '20px'}}
                titleStyle={{textAlign: 'center', fontSize: '18px', fontWeight: 'bold'}}
            >
                {
                    typeFake.map((type) => {
                        return (
                            <Button key={type.id} onClick={() => {
                                setTypeSelected(type);
                                setShowModalCategory(false);
                            }} type="default" style={{
                                borderRadius: '4px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #d9d9d9'
                            }}>{type.name}</Button>
                        )
                    })
                }
            </Modal>
        </>

    );
}

export default Post;
