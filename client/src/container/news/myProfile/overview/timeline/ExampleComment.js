import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Comment, Avatar, Popover} from 'antd';
import {Link} from 'react-router-dom';
import moment from 'moment';
import FeatherIcon from 'feather-icons-react';
import Masonry from 'react-masonry-css';
import {SRLWrapper} from 'simple-react-lightbox';
import {FaAngry, FaHeart, FaLaugh, FaSadTear, FaSurprise, FaThumbsUp} from "react-icons/fa";
import {checkReaction} from "../../../../../utility/checkValue";
import {createOrUpdateReactionComment} from "../../../../../apis/socials/comments";

function ExampleComment({replay}) {
    console.log(replay);
    const [showChildren, setShowChildren] = useState(false);
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const user_id = replay?.user_id;
    const [userReaction, setUserReaction] = useState(replay?.reactions?.find((item) => item?.user_id === user_id));
    const reactionColor = checkReaction(userReaction?.reaction_type).color;
    const handleCreateOrUpdateReaction = async (comment_id, reaction_type) => {
        try {
            const response = await createOrUpdateReactionComment({comment_id, reaction_type});
            setUserReaction(response?.data);
        } catch
            (error) {
            console.log(error);
        }
    }
    const renderChildren = (children) => {
        return children.map((child, key) => (
            <ExampleComment
                key={key}
                replay={{
                    time: child.created_at,
                    name: child.create_by_user.name,
                    text: child.comment_content,
                    image: child.galleries,
                    createByUser: child.create_by_user,
                    children: child.children,
                    reactions: child.reactions,
                    user_id: child.user_id,
                    comment_id: child.comment_id
                }}
            />
        ));
    };

    return (
        <Comment
            actions={[
                <span>
                       <Popover
                           className="wide-dropdown"
                           action="hover"
                           content={

                               <div className='popover-content'>
                                   <span onClick={() => handleCreateOrUpdateReaction(replay.comment_id, 'like')}
                                         className="reaction"><FaThumbsUp color='#1E90FF' size={20}/> Like</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(replay.comment_id, 'love')}
                                         className="reaction"><FaHeart color='#FF4500' size={20}/> Love</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(replay.comment_id, 'haha')}
                                         className="reaction"><FaLaugh color='#FFD700' size={20}/> Haha</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(replay.comment_id, 'wow')}
                                         className="reaction"><FaSurprise color='#FF6347' size={20}/> Wow</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(replay.comment_id, 'sad')}
                                         className="reaction"><FaSadTear color='#4682B4' size={20}/> Sad</span>
                                   <span onClick={() => handleCreateOrUpdateReaction(replay.comment_id, 'angry')}
                                         className="reaction"><FaAngry color='#DC143C' size={20}/> Angry</span>
                               </div>
                           }
                       >
                      <>
                        <span className="com-like" key="comment-like">
                            {
                                <>
                                    {
                                        userReaction?.reaction_type === 'like' ?
                                            <FaThumbsUp size={24} color={reactionColor}/> :
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
                                    {replay?.reactions?.length > 0 ? replay?.reactions?.length : ''}
                                </>
                            }
                        </span>
                      </>
                       </Popover>
                        </span>,
                <span className="com-reply" key="comment-reply">
                    Trả lời{' '}
                </span>,
                <span className="com-time" key="comment-time">
                    {moment(replay.time).fromNow()}{' '}
                </span>,
                replay?.children && (
                    <span
                        className="com-reply"
                        key="comment-view-replies"
                        onClick={() => setShowChildren(!showChildren)}
                    >
                        <Link to="#">{showChildren ? 'Ẩn trả lời' : 'Xem trả lời'}</Link>
                    </span>
                )
            ]}
            author={<span>{replay.name}</span>}
            avatar={<Avatar src={LARAVEL_SERVER + replay.createByUser?.avatar}
                            icon={<FeatherIcon icon={'user'} size={20}/>}
                            alt={replay?.createByUser?.name}/>}
            content={
                <div>
                    <p>{replay.text}</p>
                    {replay.image && (
                        <SRLWrapper>
                            <Masonry
                                breakpointCols={replay.image.length <= 2 ? replay.image.length : 2}
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column"
                            >
                                {replay.image.map((src, key) => (
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
                                ))}
                            </Masonry>
                            {replay?.image?.length > 2 && (
                                <Masonry
                                    breakpointCols={replay?.image?.length <= 2 ? replay?.image?.length : 3}
                                    className="my-masonry-grid"
                                    columnClassName="my-masonry-grid_column"
                                >
                                    {replay.image.map((src, key) => (
                                        key > 1 && (
                                            <a key={key + 1}
                                               href={src?.media_url}
                                               data-attribute="SRL">
                                                <img
                                                    key={key + 1}
                                                    style={{width: '100%'}}
                                                    src={src?.media_url}
                                                    alt=""
                                                />
                                            </a>
                                        )
                                    ))}
                                </Masonry>
                            )}
                        </SRLWrapper>
                    )}
                </div>
            }
        >
            {showChildren && replay.children && renderChildren(replay.children)}
        </Comment>
    );
}

ExampleComment.propTypes = {
    replay: PropTypes.object.isRequired,
};

export default ExampleComment;