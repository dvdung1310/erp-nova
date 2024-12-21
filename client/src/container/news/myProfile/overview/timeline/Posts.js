/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useState} from 'react';
import FeatherIcon from 'feather-icons-react';
import {Link} from 'react-router-dom';
import Masonry from 'react-masonry-css';
import {Input, Upload, message, Comment, Avatar} from 'antd';
import Picker from 'emoji-picker-react';
import moment from 'moment';
import 'moment/locale/vi';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import SimpleReactLightbox, {SRLWrapper} from 'simple-react-lightbox';
import {AllPosts, BackShadowEmoji, Title} from './style';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {Button} from '../../../../../components/buttons/buttons';
import {likeUpdate, commentUpdate, postDelete} from '../../../../../redux/profile/actionCreator';

moment.locale('vi');

function ExampleComment({children, replay}) {
    return (
        <Comment
            actions={[
                <span className="com-like" key="comment-nested-reply-to">
          Like{' '}
        </span>,
                <span className="com-reply" key="comment-nested-reply-to">
          Reply{' '}
        </span>,
                <span className="com-time" key="comment-nested-reply-to">
          {moment(parseInt(replay.time, 10)).fromNow()}
        </span>,
            ]}
            author={<span>{replay.name}</span>}
            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" alt="Han Solo"/>}
            content={<p>{replay.text}</p>}
        >
            {children}
        </Comment>
    );
}

ExampleComment.propTypes = {
    children: PropTypes.node,
    replay: PropTypes.object,
};

function Posts({
                   postId = 1,
                   from = "",
                   time = "1602131139130",
                   img = ['static/img/profile/post/postImage.png'],
                   like = 5,
                   comment = [],
                   content = "Nam malesuada dolor tellus pretium amet was hendrerit facilisi  tempor quis enim sed ornare there suspendisse sed orci neque ac sed aliquet risus faucibus in pretium molestee",
                   author = "static/img/chat-author/t1.jpg",
                   user, comments, galleries, categories, reactions, ...prop
               }) {
    const dispatch = useDispatch();
    console.log(galleries)
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const {posts} = useSelector((state) => {
        return {
            posts: state.Profile.posts,
        };
    });

    const [state, setState] = useState({
        inputValue: '',
        fileList: [],
        fileList2: [],
    });

    const [pickerShow, setPickerShow] = useState(false);
    const [textValue, setTextValue] = useState('');

    const onEmojiClick = (event, emojiObject) => {
        setTextValue(textValue + emojiObject.emoji);
    };

    const onPickerShow = () => {
        setPickerShow(!pickerShow);
    };

    const onTextChange = (e) => {
        setTextValue(e.target.value);
    };

    const props = {
        name: 'file',
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        headers: {
            authorization: 'authorization-text',
        },
        listType: 'picture-card',
        onChange(info) {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
                setState({
                    ...state,
                    fileList: info.fileList,
                });
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const attachment = {
        name: 'file',
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
                setState({
                    ...state,
                    fileList2: info.fileList,
                });
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const onLikeUpdate = (id) => {
        return dispatch(likeUpdate(posts, id));
    };

    const onCommentUpdate = (id) => {
        dispatch(commentUpdate(posts, id, textValue));
        setTextValue('');
    };

    const onPostDelete = (id) => {
        dispatch(postDelete(posts, id));
    };

    return (
        <SimpleReactLightbox>
            <AllPosts>
                <Cards
                    title={
                        <Title>
                            <img src={LARAVEL_SERVER + user?.avatar} alt=""/>
                            <p>
                                {user?.name} <span>{moment(prop?.created_at).fromNow()}</span>
                            </p>
                        </Title>
                    }
                    more={
                        <>
                            <Link onClick={() => onPostDelete(postId)} to="#">
                                Delete
                            </Link>
                        </>
                    }
                >
                    <div className="post-content">
                        <div className="post-text">
                            <h2>{prop?.post_title}</h2>
                        </div>
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
                            <div dangerouslySetInnerHTML={{__html: prop?.post_content}}/>
                        </div>
                        <div className="post-actions">
              <span>
                <Link onClick={() => onLikeUpdate(postId)} to="#">
                  <FeatherIcon icon="thumbs-up" size={14}/>
                </Link>
                  {like}
              </span>
                            <span>
                <Link to="#">
                  <FeatherIcon icon="message-square" size={14}/>
                </Link>
                                {comments?.length}
              </span>

                            <Link to="#">
                                <FeatherIcon icon="share-2" size={14}/>
                                Share
                            </Link>
                        </div>

                        <div className="post-comments">
                            <div className="commentArea">
                                <div className="comment-form">
                                    <img src={require('../../../../../static/img/chat-author/t2.jpg')} alt=""/>
                                    <Input.TextArea onChange={onTextChange} value={textValue}
                                                    placeholder="Write comment...."/>
                                    <div className="chatbox-reply-action d-flex">
                    <span className="smile-icon">
                      {pickerShow && (
                          <>
                              <BackShadowEmoji onClick={() => setPickerShow(false)}/>
                              <Picker onEmojiClick={onEmojiClick}/>
                          </>
                      )}
                        <Link onClick={onPickerShow} to="#">
                        <FeatherIcon icon="smile" size={24}/>
                      </Link>
                    </span>

                                        <Link to="#">
                                            <Upload {...props}>
                                                <FeatherIcon icon="image" size={18}/>
                                            </Upload>
                                        </Link>
                                        <Link to="#">
                                            <Upload {...attachment}>
                                                <FeatherIcon icon="paperclip" size={18}/>
                                            </Upload>
                                        </Link>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => (textValue === '' ? alert('Please input your comment...') : onCommentUpdate(postId))}
                                    type="primary"
                                    className="btn-send"
                                >
                                    <FeatherIcon icon="send" size={18}/>
                                </Button>
                            </div>
                        </div>
                        {comment.length ? (
                            <div className="commentReplay">
                                <ExampleComment
                                    replay={{
                                        time: comment[0].time,
                                        name: comment[0].from,
                                        text: comment[0].text,
                                    }}
                                >
                                    {comment.length > 1
                                        ? comment.map((item, key) => {
                                            return (
                                                key >= 1 && (
                                                    <ExampleComment
                                                        replay={{
                                                            time: item.time,
                                                            name: item.name,
                                                            text: item.text,
                                                        }}
                                                    />
                                                )
                                            );
                                        })
                                        : null}
                                </ExampleComment>
                            </div>
                        ) : null}
                    </div>
                </Cards>
            </AllPosts>
        </SimpleReactLightbox>
    );
}

Posts.propTypes = {
    postId: PropTypes.number,
    from: PropTypes.string,
    time: PropTypes.string,
    img: PropTypes.array,
    like: PropTypes.number,
    comment: PropTypes.array,
    content: PropTypes.string,
    author: PropTypes.string,
};

export default Posts;
