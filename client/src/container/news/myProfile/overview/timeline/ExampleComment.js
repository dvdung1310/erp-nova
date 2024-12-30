import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Comment, Avatar} from 'antd';
import {Link} from 'react-router-dom';
import moment from 'moment';
import FeatherIcon from 'feather-icons-react';
import Masonry from 'react-masonry-css';
import {SRLWrapper} from 'simple-react-lightbox';

function ExampleComment({replay}) {
    const [showChildren, setShowChildren] = useState(false);
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;

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
                }}
            />
        ));
    };

    return (
        <Comment
            actions={[
                <span className="com-like" key="comment-like">
                    Like{' '}
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