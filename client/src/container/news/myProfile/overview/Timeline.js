import React, {lazy, Suspense, useEffect, useState} from 'react';
import {Row, Col, Skeleton} from 'antd';
import {useSelector} from 'react-redux';
import {Cards} from '../../../../components/cards/frame/cards-frame';
import {getAllPosts} from "../../../../apis/socials/posts";

const RightAside = lazy(() => import('./RightAside'));
const CreatePost = lazy(() => import('./timeline/CreatePost'));
const AllPosts = lazy(() => import('./timeline/Posts'));

function Timeline() {
    const {posts} = useSelector((state) => {
        return {
            posts: state.Profile.posts,
        };
    });
    const [listPosts, setListPosts] = useState(posts);
    const fetchPosts = async () => {
        try {
            const response = await getAllPosts();
            setListPosts(response.data);
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetchPosts()
    }, [])
    console.log(posts)
    return (
        <Row gutter={25}>
            <Col md={16}>
                <div style={{
                    height: '1000px',
                    overflow: 'auto',
                    msOverflowStyle: 'none',  // Hide scrollbar in IE and Edge
                    scrollbarWidth: 'none'  // Hide scrollbar in Firefox
                }}>
                    <style>
                        {`
                            div::-webkit-scrollbar {
                                display: none;  // Hide scrollbar in webkit browsers
                            }
                        `}
                    </style>
                    <Suspense
                        fallback={
                            <Cards headless>
                                <Skeleton active/>
                            </Cards>
                        }
                    >
                        <CreatePost/>
                    </Suspense>

                    {
                        listPosts
                            .map((post) => {
                                return (
                                    <Suspense
                                        key={post?.post_id}
                                        fallback={
                                            <Cards headless>
                                                <Skeleton active/>
                                            </Cards>
                                        }
                                    >
                                        <AllPosts {...post} />
                                    </Suspense>
                                );
                            })}
                </div>
            </Col>
            <Col md={8}>
                <Suspense
                    fallback={
                        <Cards headless>
                            <Skeleton active paragraph={{rows: 10}}/>
                        </Cards>
                    }
                >
                    <RightAside/>
                </Suspense>
            </Col>
        </Row>
    );
}

export default Timeline;
