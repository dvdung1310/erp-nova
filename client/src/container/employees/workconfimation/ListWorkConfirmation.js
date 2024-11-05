import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Pagination, Tag, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { ProjectPagination, ProjectList } from './style';
import { listWorkConfimationUser } from '../../../apis/employees/workconfimation';

function ListWorkConfirmation() {
  const [state, setState] = useState({
    confirmations: [],
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await listWorkConfimationUser();
        setState((prevState) => ({
          ...prevState,
          confirmations: response || [],
        }));
      } catch (error) {
        console.error('Error fetching work confirmations:', error);
      }
    };

    fetchData();
  }, []);

  const { confirmations, current, pageSize } = state;

  const onShowSizeChange = (current, pageSize) => {
    setState({ ...state, current, pageSize });
  };

  const onHandleChange = (current) => {
    setState({ ...state, current });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="gray">Chưa duyệt</Tag>;
      case 1:
        return <Tag color="green">Đã duyệt</Tag>;
      case 2:
        return <Tag color="red">Không duyệt</Tag>;
      default:
        return null;
    }
  };

  const dataSource = confirmations.map((confirmation, index) => ({
    key: confirmation.id,
    stt: index + 1,
    createdAt: new Date(confirmation.created_at).toLocaleDateString(),
    status: getStatusTag(confirmation.status),
    invitedAvatars: (
      <Avatar.Group>
        {[1, 2, 3].map((id) => (
          <Avatar key={id} src={`https://randomuser.me/api/portraits/men/${id}.jpg`} />
        ))}
      </Avatar.Group>
    ),
    action: (
      <>
        <Link to={`/confirmation/details/${confirmation.id}`}>Chi tiết</Link> |{' '}
        <Link to={`/confirmation/delete/${confirmation.id}`}>Xóa</Link>
      </>
    ),
  }));

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Người được mời xác nhận',
      dataIndex: 'invitedAvatars',
      key: 'invitedAvatars',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
  ];

  return (
    <Row gutter={25}>
      <Col xs={24}>
        <Cards headless>
          <ProjectList>
            <div className="table-responsive">
              <Table pagination={false} dataSource={dataSource} columns={columns} />
            </div>
          </ProjectList>
        </Cards>
      </Col>
      <Col xs={24} className="pb-30">
        <ProjectPagination>
          <Pagination
            onChange={onHandleChange}
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            current={current}
            pageSize={pageSize}
            total={confirmations.length}
          />
        </ProjectPagination>
      </Col>
    </Row>
  );
}

export default ListWorkConfirmation;
