/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useState} from 'react';
import FeatherIcon from 'feather-icons-react';
import {Badge, Card, Input, List, Modal, Upload} from 'antd';
import {useSelector, useDispatch} from 'react-redux';
import {BackShadow, CreatePost} from './style';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {Button} from '../../../../../components/buttons/buttons';
import {submitPost} from '../../../../../redux/profile/actionCreator';

const dateFormat = 'MM/DD/YYYY';
import RichTextEditor from 'react-rte';
import {toast} from "react-toastify";
import {createPost} from "../../../../../apis/socials/posts";
import Avatar from "../../../../../components/Avatar/Avatar";
import {checkRole} from "../../../../../utility/checkValue";
import {getAllUsers} from "../../../../../apis/work/user";

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
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [drawer, setDrawer] = useState(false);
    const [modalTag, setModalTag] = useState(false);
    const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());
    const [postTitle, setPostTitle] = useState('');
    const [typeSelected, setTypeSelected] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingGetUser, setLoadingGetUser] = useState(false);
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
    //
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [listUserData, setListUser] = useState([]);

    const filteredMembers = listUserData?.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleSelectMember = (member) => {
        if (!selectedMembers.some((selected) => selected.email === member.email)) {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const handleRemoveMember = (email) => {
        // Remove the member by email
        setSelectedMembers(selectedMembers.filter((member) => member.email !== email));
    };
    const handleGetUsers = async () => {
        try {
            setModalTag(true);
            const response = await getAllUsers();
            setListUser(response.data);
        } catch (error) {
            console.log(error);
        }
    }
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
                                    <RichTextEditor
                                        style={{minHeight: '100px'}}
                                        className='custom-rich-text-editor'
                                        placeholder="Nội dung bài viết ..."
                                        value={editorState}
                                        onChange={handleChangeEditer}/>
                                </div>
                            </div>
                            <div>
                                {
                                    selectedMembers.length > 0 && (
                                        <>
                                            <span style={{
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                lineHeight: '22px',
                                                padding: '10px 0'
                                            }}>Cùng với:</span>
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '20px',
                                                padding: '8px',
                                                border: '1px solid #e8e8e8',
                                                borderRadius: '4px',
                                                backgroundColor: '#f9f9f9',
                                            }}>
                                                {selectedMembers.map((member) => (
                                                    <Badge key={member.email}
                                                           onClick={() => handleRemoveMember(member.email)}>
                                                        <span style={{
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#f0f0f0',
                                                            color: '#000',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}>
                                                          {member.name}
                                                            <FeatherIcon icon="x" size={16} color="red"
                                                                         style={{marginLeft: '8px'}}/>
                                                        </span>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                            <div className="postFooter">
                                <Upload
                                    name="image"
                                    listType="picture"
                                    fileList={fileList}
                                    beforeUpload={() => false}
                                    onChange={handleUploadChange}
                                    accept="image/*,video/*">
                                    <Button shape="circle" type="light" title='Ảnh/video'>
                                        <img src={require('../../../../../static/img/icon/image.png')} alt=""/>
                                    </Button>
                                </Upload>
                                <div className='postFooter_right'>
                                    <Button shape="circle" onClick={handleGetUsers} type="light"
                                            title='Gắn thẻ người khác'>
                                        <FeatherIcon icon="tag"/>
                                    </Button>
                                    {/*<Button shape="circle" type="light" title='hashtag' style={{marginLeft: '8px'}}>*/}
                                    {/*    <FeatherIcon icon="hash"/>*/}
                                    {/*</Button>*/}
                                </div>
                            </div>

                        </Cards>
                    </CreatePost>
                    <div className="" style={{marginTop: '10px', display: 'flex', justifyContent: 'end'}}>
                        {drawer && (
                            <Button className="btn-post" loading={loading} style={{width: '50%'}} onClick={onCreate}
                                    type="primary">
                                Đăng bài
                            </Button>
                        )}
                    </div>
                </Modal>
            </CreatePost>
            {/*    modal tag*/}
            <Modal
                title="Gắn thẻ người khác"
                visible={modalTag}
                centered
                onOk={() => setModalTag(false)}
                onCancel={() => setModalTag(false)}
            >
                <>
                    <div style={{marginBottom: '16px'}}>
                        {selectedMembers.length > 0 && (
                            <>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '20px',
                                    padding: '8px',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '4px',
                                    backgroundColor: '#f9f9f9',
                                }}>
                                    {selectedMembers.map((member) => (
                                        <Badge key={member.email}
                                               onClick={() => handleRemoveMember(member.email)}>
                        <span style={{
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#f0f0f0',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                          {member.name}
                            <FeatherIcon icon="x" size={16} color="red" style={{marginLeft: '8px'}}/>
                        </span>
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <Input
                        type="text"
                        placeholder="Tìm kiếm ..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{marginBottom: '16px'}}
                    />
                    <List
                        itemLayout="horizontal"
                        loading={loadingGetUser}
                        style={{height: '300px', overflowY: 'auto'}}
                        dataSource={filteredMembers}
                        renderItem={(member) => (
                            <List.Item onClick={() => handleSelectMember(member)}
                                       style={{cursor: 'pointer'}}>
                                <List.Item.Meta
                                    avatar={<Avatar width={40} height={40} name={member?.name}
                                                    imageUrl={member?.avatar ? `${LARAVEL_SERVER}${member?.avatar}` : ''}/>}
                                    title={member.name}
                                    description={
                                        <>
                                            <small className="text-muted">{member?.email}</small>
                                            <br/>
                                            <strong
                                                className="text-muted">{checkRole(member?.role_id)}</strong>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </>
            </Modal>
        </>

    );
}

export default Post;
