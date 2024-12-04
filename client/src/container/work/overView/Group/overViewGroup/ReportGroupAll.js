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
            const initialPagination = res.data.reduce((acc, item, index) => {
                acc[index] = {current: 1, pageSize: 5, total: item.list_project.length};
                return acc;
            }, {});
            setData(res.data);
            setPagination(initialPagination);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            console.log(e);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handlePageChange = (page, pageSize, index) => {
        setPagination(prev => ({
            ...prev,
            [index]: {...prev[index], current: page, pageSize}
        }));
    };

    return (
        <div>
            <ProjectHeader>
                <PageHeader
                    ghost
                    title='Báo cáo công việc'
                />
            </ProjectHeader>
            <Main>
                {
                    loading ?
                        <div className='spin'><Spin/></div> :
                        <Row gutter={[16, 16]}>
                            {
                                data?.length > 0 ? data?.map((item, index) => {
                                    const {current, pageSize, total} = pagination[index] || {};
                                    const startIndex = (current - 1) * pageSize;
                                    const endIndex = startIndex + pageSize;
                                    const paginatedProjects = item?.list_project?.slice(startIndex, endIndex);

                                    return (
                                        <Col md={24} key={index}>
                                            <Card title={item?.group_name}
                                                  hoverable
                                                  headStyle={{
                                                      background: `linear-gradient(45deg, rgba(${parseInt(item?.color.slice(1, 3), 16)}, ${parseInt(item?.color.slice(3, 5), 16)}, ${parseInt(item?.color.slice(5, 7), 16)}, 0.2), #dadada)`,
                                                  }}
                                            >
                                                <Collapse accordion>
                                                    {
                                                        paginatedProjects?.length > 0 ? paginatedProjects?.map((project, projectIndex) => (
                                                            <Panel header={project?.project_name} key={projectIndex}>
                                                                {
                                                                    project?.tasks?.length > 0 ?
                                                                        <TaskList listUser={[]} tasks={project?.tasks}
                                                                                  setTasks={() => {
                                                                                  }}
                                                                                  isHome/> :
                                                                        <div>Không có công việc nào</div>
                                                                }

                                                            </Panel>
                                                        )) : <div>Không có dự án nào</div>
                                                    }
                                                </Collapse>
                                                <div style={{marginTop: '16px'}}>
                                                    <Pagination
                                                        current={current}
                                                        pageSize={pageSize}
                                                        total={total}
                                                        onChange={(page, pageSize) => handlePageChange(page, pageSize, index)}
                                                        style={{textAlign: 'center'}}
                                                    />
                                                </div>

                                            </Card>
                                        </Col>
                                    );
                                }) : <Col md={12} sm={12} xs={24}>
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                                </Col>
                            }
                        </Row>
                }
            </Main>
        </div>
    );
}
export default ReportGroupAll;