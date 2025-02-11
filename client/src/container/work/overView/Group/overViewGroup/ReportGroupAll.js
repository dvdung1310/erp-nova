import {Main} from "../../../../styled";
import {Card, Col, Collapse, Empty, Row, Spin, Pagination} from "antd";
import React, {useEffect, useState} from "react";
import {ProjectHeader} from "../../Project/style";
import {PageHeader} from "../../../../../components/page-headers/page-headers";
import TaskList from "../../Task/overViewTask/TaskList";
import {getReportGroupAll} from "../../../../../apis/work/group";
import {Cards} from "../../../../../components/cards/frame/cards-frame";

const {Panel} = Collapse;
const ReportGroupAll = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getReportGroupAll();
            setData(res.data);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            console.log(e);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <div>
            <ProjectHeader>
                <PageHeader
                    ghost
                    title='Báo cáo công việc trong tháng'
                />
            </ProjectHeader>
            <Main>
                {
                    loading ?
                        <div className='spin'><Spin/></div> :
                        <Row gutter={[16, 16]}>


                            <Col md={24}>
                                <Collapse accordion defaultActiveKey='0' bordered={false}
                                          style={{background: '#f4f5f7'}}>
                                    {
                                        data?.length > 0 ? data?.sort((a, b) => b.list_tasks.length - a.list_tasks.length)?.map((item, index) => {
                                            return (
                                                <Panel
                                                    header={`${item?.group_name} (${item?.list_tasks?.reduce((total, group) => total + group.tasks.length, 0)} công việc)`}
                                                    key={index.toString()} style={{
                                                    background: `linear-gradient(45deg, rgba(${parseInt(item?.color.slice(1, 3), 16)}, ${parseInt(item?.color.slice(3, 5), 16)}, ${parseInt(item?.color.slice(5, 7), 16)}, 0.2), #dadada)`,
                                                    margin: '16px 0',
                                                    borderRadius: '5px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {
                                                        item?.list_tasks?.length > 0 ?
                                                            <div style={{maxHeight: '500px', overflow: 'auto'}}>
                                                                <TaskList listUser={[]} tasks={item?.list_tasks}
                                                                          setTasks={() => {
                                                                          }}
                                                                          report
                                                                          isHome/>
                                                            </div>
                                                            :
                                                            <div>Không có công việc nào</div>
                                                    }
                                                </Panel>
                                            )
                                        }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                                    }
                                </Collapse>
                            </Col>
                        </Row>
                }
            </Main>
        </div>
    );
}
export default ReportGroupAll;