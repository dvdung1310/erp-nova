import React, {useState, useEffect, lazy, Suspense} from 'react';
import {Row, Col, Pagination, Skeleton} from 'antd';
import {useSelector} from 'react-redux';
import Heading from '../../../../../components/heading/heading';
import {Cards} from '../../../../../components/cards/frame/cards-frame';
import {ProjectPagination} from '../style';

const GridCard = lazy(() => import('./GridCard'));

function Grid({listGroup, listUser}) {
    const [state, setState] = useState({
        projects: listGroup,
    });
    const {projects} = state;

    useEffect(() => {
        if (listGroup) {
            setState({
                projects: listGroup,
            });
        }
    }, [listGroup]);


    return (
        <Row gutter={25}>
            {projects?.length ? (
                projects.map(value => {
                    return (
                        <Col key={value.id} xl={8} md={12} xs={24}>
                            <Suspense
                                fallback={
                                    <Cards headless>
                                        <Skeleton active/>
                                    </Cards>
                                }
                            >
                                <GridCard value={value} listUser={listUser}/>
                            </Suspense>
                        </Col>
                    );
                })
            ) : (
                <Col md={24}>
                    <Cards headless>
                        <Heading className='m-0' as='h6'>Chưa có nhóm làm việc nào</Heading>
                    </Cards>
                </Col>
            )}

        </Row>
    );
}

export default Grid;
