import React, {lazy, useState} from 'react';
import {useSelector} from 'react-redux';
import {Row, Col} from 'antd';
import FeatherIcon from 'feather-icons-react';
import CreateProject from './overViewProject/CreateProject';
import {ProjectHeader} from './style';
import {Button} from '../../../../components/buttons/buttons';
import {Main} from '../../../styled';
import {PageHeader} from '../../../../components/page-headers/page-headers';
import CreateGroup from "../Group/overViewGroup/CreateGroup";

const List = lazy(() => import('./overViewProject/List'));
const Grid = lazy(() => import('./overViewProject/Grid'));

function Project({listProject, listUser, group_id, listGroup, currentGroup}) {
    const [state, setState] = useState({
        visible: false,
        visible_group: false,
    });

    const {visible, visible_group} = state;
    const showModal = () => {
        setState({
            ...state,
            visible: true,
        });
    };
    const showModalGroup = () => {
        setState({
            ...state,
            visible_group: true,
        });
    }
    const onCancelGroup = () => {
        setState({
            ...state,
            visible_group: false,
        });
    }

    const onCancel = () => {
        setState({
            ...state,
            visible: false,
        });
    };

    return (
        <>
            <>
                <ProjectHeader>
                    <PageHeader
                        ghost
                        title={currentGroup?.group_name}
                        subTitle={<>{listGroup?.length} Nhóm con</>}
                        buttons={[
                            <Button onClick={showModalGroup} key="1" type="primary" size="default">
                                <FeatherIcon icon="plus" size={16}/> Tạo nhóm
                            </Button>,
                        ]}
                    />
                </ProjectHeader>
                <Main>
                    <Row gutter={25}>
                        <Col xs={24}>
                            <div>
                                <Grid listGroup={listGroup} listUser={listUser}/>
                            </div>
                        </Col>
                    </Row>
                    <CreateGroup group_id={group_id} listUser={listUser} onCancel={onCancelGroup} visible={visible_group}/>
                </Main>
            </>

            {/**/}
            <>
                <ProjectHeader>
                    <PageHeader
                        ghost
                        title="Danh sách dự án"
                        subTitle={<>{listProject?.length} dự án</>}
                        buttons={[
                            <Button onClick={showModal} key="1" type="primary" size="default">
                                <FeatherIcon icon="plus" size={16}/> Tạo dự án
                            </Button>,
                        ]}
                    />
                </ProjectHeader>
                <Main>
                    <Row gutter={25}>
                        <Col xs={24}>
                            <div>
                                <List listProject={listProject} listUser={listUser}/>
                            </div>
                        </Col>
                    </Row>
                    <CreateProject group_id={group_id} listUser={listUser} onCancel={onCancel} visible={visible}/>
                </Main>
            </>


        </>
    );
}


export default Project;