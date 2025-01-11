/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useState} from 'react';
import FeatherIcon from 'feather-icons-react';
import {FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaSadTear, FaAngry, FaThumbsDown} from 'react-icons/fa';
import ExampleComment from './ExampleComment';
import {Link} from 'react-router-dom';
import Masonry from 'react-masonry-css';
import {Input, Upload, message, Comment, Avatar, Modal, Tooltip, Popover} from 'antd';
import Picker from 'emoji-picker-react';
import moment from 'moment';
import 'moment/locale/vi';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import SimpleReactLightbox, {SRLWrapper} from 'simple-react-lightbox';
import {AllPosts, BackShadowEmoji, Title} from './style';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {Button} from '../../../../../components/buttons/buttons';
import {toast} from "react-toastify";
import {
    MdOutlineImage,
} from "react-icons/md";
import {createComment} from "../../../../../apis/socials/comments";
import {Dropdown} from "../../../../../components/dropdown/dropdown";
import {createOrUpdateReaction, deletePost} from "../../../../../apis/socials/posts";
import {checkReaction} from "../../../../../utility/checkValue";

moment.locale('vi');

// function ExampleComment({children, replay}) {
//     const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
//     return (
//         <Comment
//             actions={[
//                 <span className="com-like" key="comment-like">
//                     Like{' '}
//                 </span>,
//                 <span className="com-reply" key="comment-reply">
//                     Trả lời{' '}
//                 </span>,
//                 <span className="com-time" key="comment-time">
//                     {moment(replay.time).fromNow()}{' '}
//                 </span>,
//                 replay?.children && (
//                     <>
//                         <span className="com-reply" key="comment-view-replies">
//                             <Link to="#">Xem trả lời</Link>
//                         </span>
//                     </>
//
//                 )
//             ]}
//             author={<span>{replay.name}</span>}
//             avatar={<Avatar src={LARAVEL_SERVER + replay.createByUser?.avatar}
//                             icon={<FeatherIcon icon={'user'} size={20}/>}
//                             alt={replay?.createByUser?.name}/>}
//             content={
//                 <div>
//                     <p>{replay.text}</p>
//                     {replay.image && <>
//                         <SRLWrapper>
//                             <Masonry
//                                 breakpointCols={replay.image.length <= 2 ? replay.image.length : 2}
//                                 className="my-masonry-grid"
//                                 columnClassName="my-masonry-grid_column"
//                             >
//                                 {replay.image.map((src, key) => {
//                                     return (
//                                         key <= 1 && (
//                                             <a key={key + 1}
//                                                href={LARAVEL_SERVER + '/storage/' + src?.media_url}
//                                                data-attribute="SRL">
//                                                 <img
//                                                     key={key + 1}
//                                                     style={{width: '100%'}}
//                                                     src={LARAVEL_SERVER + '/storage/' + src?.media_url}
//                                                     alt=""
//                                                 />
//                                             </a>
//                                         )
//                                     );
//                                 })}
//                             </Masonry>
//                             {replay?.image?.length > 2 && (
//                                 <Masonry
//                                     breakpointCols={replay?.image?.length <= 2 ? replay?.image?.length : 3}
//                                     className="my-masonry-grid"
//                                     columnClassName="my-masonry-grid_column"
//                                 >
//                                     {replay.image.map((src, key) => {
//                                         return (
//                                             key > 1 && (
//                                                 <a key={key + 1}
//                                                    href={src?.media_url}
//                                                    data-attribute="SRL">
//                                                     <img
//                                                         key={key + 1}
//                                                         style={{width: '100%'}}
//                                                         src={src?.media_url}
//                                                         alt=""
//                                                     />
//                                                 </a>
//                                             )
//                                         );
//                                     })}
//                                 </Masonry>
//                             )}
//                         </SRLWrapper>
//                     </>}
//
//                 </div>
//             }
//         >
//             {children}
//         </Comment>
//     );
// }

ExampleComment.propTypes = {
    children: PropTypes.node,
    replay: PropTypes.object,
};

function Posts({
                   comment = [],
                   create_by_user,
                   comments,
                   galleries,
                   reactions,
                   hashtags,
                   list_user_tag,
                   userLogin,
                   setListPosts,
                   ...prop
               }) {
    const {post_id, post_content, created_at} = prop;
    const user_id = userLogin?.id;
    const [userReaction, setUserReaction] = useState(reactions?.find((item) => item?.user_id === user_id));
    const [commentRender, setCommentRender] = useState(comments || []);
    const [reactionsRender, setReactionsRender] = useState(reactions || []);
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const [fileList, setFileList] = useState([]);
    const [loadingCreateComment, setLoadingCreateComment] = useState(false);
    const [showModalComment, setShowModalComment] = useState(false);
    const [pickerShow, setPickerShow] = useState(false);
    const [textValue, setTextValue] = useState('');
    const handleShowModalComment = () => {
        setShowModalComment(true);
    }
    const handleCloseModalComment = () => {
        setShowModalComment(false);
    }


    const onEmojiClick = (event, emojiObject) => {
        console.log(emojiObject);
        setTextValue(textValue + emojiObject.unified);
    };

    const onPickerShow = () => {
        setPickerShow(!pickerShow);
    };

    const onTextChange = (e) => {
        setTextValue(e.target.value);
    };

    const handleCreateOrUpdateReaction = async (post_id, reaction_type) => {
        try {
            const response = await createOrUpdateReaction({post_id, reaction_type});
            setUserReaction(response?.data);
        } catch
            (error) {
            console.log(error);
        }
    }

    const onCommentUpdate = async (post_id) => {
        try {
            setLoadingCreateComment(true);
            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append('files[]', file.originFileObj);
            });
            formData.append('post_id', post_id);
            formData.append('comment_content', textValue);
            const response = await createComment(formData);
            setCommentRender([response?.data, ...commentRender]);
            setLoadingCreateComment(false);
            setTextValue('');
            setFileList([]);

        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau', {autoClose: 1000});
            setLoadingCreateComment(false);
            console.log(error);
        }
    };

    const onPostDelete = async (id) => {
        try {
            const response = await deletePost(id);
            setListPosts((prevState) => prevState.filter((item) => item?.post_id !== id));
            if (response?.status === 200) {
                toast.success('Xóa bài viết thành công', {autoClose: 1000});
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau', {autoClose: 1000});
            console.log(error);
        }
    };
    const handleUploadChange = ({fileList}) => {
        setFileList(fileList);
    };
    const handleDeleteImagePreview = (uid) => {
        const newFileList = fileList.filter((file) => file.uid !== uid);
        setFileList(newFileList);
    }
    const ReactionIcon = checkReaction(userReaction?.reaction_type).icon;
    const reactionColor = checkReaction(userReaction?.reaction_type).color;
    console.log(ReactionIcon, reactionColor)
    return (
        <SimpleReactLightbox>
            <AllPosts>
                <Cards
                    title={
                        <Title>
                            <img src={LARAVEL_SERVER + create_by_user?.avatar} alt=""/>
                            <p>
                                {create_by_user?.name} <span>{moment(created_at).fromNow()}</span>
                            </p>
                        </Title>
                    }
                    more={
                        <>
                            <Link onClick={() => onPostDelete(post_id)} to="#">
                                Delete
                            </Link>
                        </>
                    }
                >
                    <div className="post-content">
                        <div className="gallery">
                            {galleries?.length ? (
                                <SRLWrapper>
                                    <Masonry
                                        breakpointCols={galleries?.length <= 2 ? galleries?.length : 2}
                                        className="my-masonry-grid"
                                        columnClassName="my-masonry-grid_column"
                                    >
                                        {galleries?.map((src, key) => {
                                            return (
                                                key <= 1 && (
                                                    <a key={key + 1}
                                                       href={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                       data-attribute="SRL">
                                                        <img
                                                            key={key + 1}
                                                            style={{width: '100%'}}
                                                            src={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                            alt=""
                                                        />
                                                    </a>
                                                )
                                            );
                                        })}
                                    </Masonry>
                                    {galleries?.length > 2 && (
                                        <Masonry
                                            breakpointCols={galleries?.length <= 2 ? galleries?.length : 3}
                                            className="my-masonry-grid"
                                            columnClassName="my-masonry-grid_column"
                                        >
                                            {galleries?.map((src, key) => {
                                                return (
                                                    key > 1 && (
                                                        <a key={key + 1}
                                                           href={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                           data-attribute="SRL">
                                                            <img
                                                                key={key + 1}
                                                                style={{width: '100%'}}
                                                                src={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                                alt=""
                                                            />
                                                        </a>
                                                    )
                                                );
                                            })}
                                        </Masonry>
                                    )}
                                </SRLWrapper>
                            ) : null}
                        </div>
                        <div className="post-text">
                            <div dangerouslySetInnerHTML={{__html: post_content}}/>
                            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                {hashtags?.map((item, key) => {
                                    return (
                                        <Link key={key} to="#"
                                              style={{
                                                  color: '#007bff',
                                                  textDecoration: 'none',
                                                  marginRight: '5px'
                                              }}>
                                            #{item?.hashtag_name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        {
                            list_user_tag?.length > 0 &&
                            <div className="post-text">
                                <span>Cùng với: </span>
                                {list_user_tag?.map((item, key) => {
                                    return (
                                        <Link key={key} to="#" className="user-tag">
                                            {item?.name},
                                        </Link>
                                    );
                                })}
                            </div>
                        }
                        <div className="post-actions">
                            <span>
                       <Popover
                           className="wide-dropdown"
                           action="hover"
                           content={
                               <div className='popover-content'>
                                   <span onClick={() => handleCreateOrUpdateReaction(post_id, 'like')}
                                         className="reaction"><FaThumbsUp color='#1E90FF' size={20}/> Like</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(post_id, 'love')}
                                         className="reaction"><FaHeart color='#FF4500' size={20}/> Love</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(post_id, 'haha')}
                                         className="reaction"><FaLaugh color='#FFD700' size={20}/> Haha</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(post_id, 'wow')}
                                         className="reaction"><FaSurprise color='#FF6347' size={20}/> Wow</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(post_id, 'sad')}
                                         className="reaction"><FaSadTear color='#4682B4' size={20}/> Sad</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(post_id, 'angry')}
                                         className="reaction"><FaAngry color='#DC143C' size={20}/> Angry</span>
                               </div>
                           }
                       >
                      <>
                        <Link to="#">
                            {
                                userReaction?.reaction_type === 'like' ? <FaThumbsUp size={24} color={reactionColor}/> :
                                    userReaction?.reaction_type === 'love' ?
                                        <FaHeart size={24} color={reactionColor}/> :
                                        userReaction?.reaction_type === 'haha' ?
                                            <FaLaugh size={24} color={reactionColor}/> :
                                            userReaction?.reaction_type === 'wow' ?
                                                <FaSurprise size={24} color={reactionColor}/> :
                                                userReaction?.reaction_type === 'sad' ?
                                                    <FaSadTear size={24} color={reactionColor}/> :
                                                    userReaction?.reaction_type === 'angry' ?
                                                        <FaAngry size={24} color={reactionColor}/> :
                                                        <FaThumbsUp size={24}/>

                            }
                        </Link>
                          {reactionsRender?.length}
                      </>
                       </Popover>
                        </span>
                            <span>
                            <Link to="#" onClick={handleShowModalComment}>
                              <FeatherIcon icon="message-square" size={24}/>
                            </Link>
                                {commentRender?.length}
                          </span>
                            <Link to="#">
                                <FeatherIcon icon="share-2" size={24}/>
                                Share
                            </Link>
                        </div>

                    </div>
                </Cards>
            </AllPosts>
            <Modal
                title={`Bài viết của ${create_by_user?.name}`}
                visible={showModalComment}
                className="modal-comment"
                onCancel={handleCloseModalComment}
                footer={null}
            >
                <>
                    <div className="commentReplay">
                        <AllPosts>
                            <Cards
                                title={
                                    <Title>
                                        <img src={LARAVEL_SERVER + create_by_user?.avatar} alt=""/>
                                        <p>
                                            {create_by_user?.name} <span>{moment(created_at).fromNow()}</span>
                                        </p>
                                    </Title>
                                }
                                more={
                                    <>
                                        <Link onClick={() => onPostDelete(post_id)} to="#">
                                            Delete
                                        </Link>
                                    </>
                                }
                            >
                                <div className="post-content">
                                    <div className="gallery">
                                        {galleries?.length ? (
                                            <SRLWrapper>
                                                <Masonry
                                                    breakpointCols={galleries?.length <= 2 ? galleries?.length : 2}
                                                    className="my-masonry-grid"
                                                    columnClassName="my-masonry-grid_column"
                                                >
                                                    {galleries?.map((src, key) => {
                                                        return (
                                                            key <= 1 && (
                                                                <a key={key + 1}
                                                                   href={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                                   data-attribute="SRL">
                                                                    <img
                                                                        key={key + 1}
                                                                        style={{width: '100%'}}
                                                                        src={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                                        alt=""
                                                                    />
                                                                </a>
                                                            )
                                                        );
                                                    })}
                                                </Masonry>
                                                {galleries?.length > 2 && (
                                                    <Masonry
                                                        breakpointCols={galleries?.length <= 2 ? galleries?.length : 3}
                                                        className="my-masonry-grid"
                                                        columnClassName="my-masonry-grid_column"
                                                    >
                                                        {galleries?.map((src, key) => {
                                                            return (
                                                                key > 1 && (
                                                                    <a key={key + 1}
                                                                       href={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                                       data-attribute="SRL">
                                                                        <img
                                                                            key={key + 1}
                                                                            style={{width: '100%'}}
                                                                            src={LARAVEL_SERVER + '/storage/' + src?.media_url}
                                                                            alt=""
                                                                        />
                                                                    </a>
                                                                )
                                                            );
                                                        })}
                                                    </Masonry>
                                                )}
                                            </SRLWrapper>
                                        ) : null}
                                    </div>
                                    <div className="post-text">
                                        <div dangerouslySetInnerHTML={{__html: post_content}}/>
                                        <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                            {hashtags?.map((item, key) => {
                                                return (
                                                    <Link key={key} to="#"
                                                          style={{
                                                              color: '#007bff',
                                                              textDecoration: 'none',
                                                              marginRight: '5px'
                                                          }}>
                                                        #{item?.hashtag_name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {
                                        list_user_tag?.length > 0 &&
                                        <div className="post-text">
                                            <span>Cùng với: </span>
                                            {list_user_tag?.map((item, key) => {
                                                return (
                                                    <Link key={key} to="#" className="user-tag">
                                                        {item?.name},
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    }
                                    <div className="post-actions">
                                            <span>
                                                <Dropdown
                                                    className="wide-dropdown"
                                                    action='click'
                                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                                    content={
                                                        <div className='popover-content' style={{zIndex: 99999}}>
                                                            <span
                                                                onClick={() => handleCreateOrUpdateReaction(post_id, 'like')}
                                                                className="reaction">
                                                                <FaThumbsUp color='#1E90FF' size={20}/> Like
                                                            </span>
                                                            <span
                                                                onClick={() => handleCreateOrUpdateReaction(post_id, 'love')}
                                                                className="reaction">
                                                                <FaHeart color='#FF4500' size={20}/> Love
                                                            </span>
                                                            <span
                                                                onClick={() => handleCreateOrUpdateReaction(post_id, 'haha')}
                                                                className="reaction">
                                                                <FaLaugh color='#FFD700' size={20}/> Haha
                                                            </span>
                                                            <span
                                                                onClick={() => handleCreateOrUpdateReaction(post_id, 'wow')}
                                                                className="reaction">
                                                                <FaSurprise color='#FF6347' size={20}/> Wow
                                                            </span>
                                                            <span
                                                                onClick={() => handleCreateOrUpdateReaction(post_id, 'sad')}
                                                                className="reaction">
                                                                <FaSadTear color='#4682B4' size={20}/> Sad
                                                            </span>
                                                            <span
                                                                onClick={() => handleCreateOrUpdateReaction(post_id, 'angry')}
                                                                className="reaction">
                                                                <FaAngry color='#DC143C' size={20}/> Angry
                                                            </span>
                                                        </div>
                                                    }
                                                >
                                                    <>
                                                        <Link to="#">
                                                            {
                                                                userReaction?.reaction_type === 'like' ?
                                                                    <FaThumbsUp size={24} color={reactionColor}/> :
                                                                    userReaction?.reaction_type === 'love' ?
                                                                        <FaHeart size={24} color={reactionColor}/> :
                                                                        userReaction?.reaction_type === 'haha' ?
                                                                            <FaLaugh size={24} color={reactionColor}/> :
                                                                            userReaction?.reaction_type === 'wow' ?
                                                                                <FaSurprise size={24}
                                                                                            color={reactionColor}/> :
                                                                                userReaction?.reaction_type === 'sad' ?
                                                                                    <FaSadTear size={24}
                                                                                               color={reactionColor}/> :
                                                                                    userReaction?.reaction_type === 'angry' ?
                                                                                        <FaAngry size={24}
                                                                                                 color={reactionColor}/> :
                                                                                        <FaThumbsUp size={24}/>
                                                            }
                                                        </Link>
                                                        {reactionsRender?.length}
                                                    </>
                                                </Dropdown>
                                            </span>
                                        <span>
                                        <Link to="#">
                                            <FeatherIcon icon="message-square" size={24}/>
                                        </Link>
                                            {commentRender?.length}
                                        </span>
                                        <Link to="#">
                                            <FeatherIcon icon="share-2" size={24}/>
                                            Share
                                        </Link>
                                    </div>
                                </div>
                            </Cards>
                        </AllPosts>
                        {
                            commentRender?.length > 0 &&
                            <div style={{marginTop: '-40px', padding: '0 20px'}}>

                                {commentRender?.length > 0
                                    ? commentRender.map((item, key) => (
                                        <ExampleComment
                                            key={key}
                                            replay={{
                                                time: item.created_at,
                                                name: item.create_by_user.name,
                                                text: item.comment_content,
                                                image: item.galleries,
                                                createByUser: item.create_by_user,
                                                children: item.children,
                                                reactions: item.reactions,
                                                user_id: user_id,
                                                comment_id: item.comment_id
                                            }}
                                        />
                                    ))
                                    : null}

                            </div>

                        }

                    </div>
                    <div className="post-comments">
                        {
                            fileList?.length > 0 && <div className="image-preview">
                                {fileList?.map(file => (
                                    <div className="image-container" key={file.uid}>
                                        <img
                                            src={file.originFileObj ? URL.createObjectURL(file.originFileObj) : URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="image-preview"
                                        />
                                        <div className="icon-overlay"
                                             onClick={() => handleDeleteImagePreview(file.uid)}>
                                            <FeatherIcon icon={'trash-2'} size={16}/>
                                        </div>
                                    </div>


                                ))}
                            </div>
                        }

                        <div className="commentArea">
                            <div className="comment-form">
                                <Avatar size={40} style={{marginRight: '10px'}} alt={userLogin?.name}
                                        className='post-author'
                                        icon={<FeatherIcon icon={'user'} size={20}/>}
                                        src={LARAVEL_SERVER + userLogin?.avatar}/>
                                <Input.TextArea onChange={onTextChange} value={textValue}
                                                placeholder="Write comment...."/>
                                <div className="chatbox-reply-action d-flex">
                                        <span className="smile-icon">
                                          {pickerShow && (
                                              <Picker
                                                  onEmojiClick={(event, emojiObject) => onEmojiClick(event, emojiObject)}/>
                                          )}
                                            <Link onClick={onPickerShow} to="#">
                                            <FeatherIcon icon="smile" size={24}/>
                                          </Link>
                                        </span>

                                    <Link to="#">
                                        <Upload
                                            name="image"
                                            listType="picture"
                                            fileList={fileList}
                                            beforeUpload={() => false}
                                            onChange={handleUploadChange}
                                            accept="image/*,video/*"
                                            multiple
                                        >
                                            <MdOutlineImage size={18}/>
                                        </Upload>
                                    </Link>
                                </div>
                            </div>
                            <Button
                                onClick={() => (textValue === '' ?
                                    toast.warn('Vui lòng nhập nội dung comment', {autoClose: 1000}) :
                                    onCommentUpdate(post_id))}
                                type="primary"
                                loading={loadingCreateComment}
                                className="btn-send"
                            >
                                {!loadingCreateComment && <FeatherIcon icon="send" size={18}/>}
                            </Button>
                        </div>
                    </div>

                </>
            </Modal>

        </SimpleReactLightbox>
    )
        ;
}

Posts.propTypes = {
    like: PropTypes.number,
    comment:
    PropTypes.array,
};

export default Posts;
