import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Tag, Avatar , Tooltip ,Spin , Modal } from 'antd';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { ProjectList } from './style';
import { listWorkConfimationUser , deleteWorkConfimation } from '../../../apis/employees/workconfimation';
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
import './WorkConfimation.css';


function ListWorkConfirmation() {
  const [state, setState] = useState({
    confirmations: [],
    current: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await listWorkConfimationUser();
      setState((prevState) => ({
        ...prevState,
        confirmations: response || [],
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching work confirmations:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { confirmations } = state;

  const handleDelete = (id) => {
    Modal.confirm({
        title: `Bạn có chắc chắn muốn xóa xác nhận công ?`,
        content: 'Hành động này không thể hoàn tác!',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
              const delete_workconfirmation = deleteWorkConfimation(id);
              toast.success('Hoàn thành xóa xác nhận công');
              fetchData();
            } catch (error) {
              toast.error('Lỗi xóa xác nhận công');
            }
        },
    });
};

  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="gray">Đang chờ</Tag>;
      case 1:
        return <Tag color="green">Đã duyệt</Tag>;
      case 2:
        return <Tag color="red">Từ chối</Tag>;
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
        {confirmation.managers && confirmation.managers.map((manager) => (
          <Tooltip key={manager.id} title={manager.name}>
          <Avatar
            src={manager?.avatar ? `${LARAVEL_SERVER}${manager?.avatar}` : ''}
            alt={manager.name}
            description={manager.name}
          >
            {manager.name ? manager.name.split(" ").pop()[0] : 'U'}
          </Avatar>
        </Tooltip>
        ))}
      </Avatar.Group>
    ),
    action: (
      <>
        <Button style={{marginRight:'15px'}} type="primary" onClick={() => history.push(`/admin/nhan-su/chi-tiet-xac-nhan-cong/${confirmation.id}`)}>Chi tiết</Button>
        {
          confirmation.status === 0 && 
          <Button type="danger" onClick={() =>handleDelete(confirmation.id)}>Xóa</Button>
        }
        

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
    <div className="list-work-confirmation">
            {
                loading ? <div className='spin'>
                    <Spin/>
                </div> : (
                    <>
   
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2>Danh sách xác nhận công <span style={{ color: '#5F63F2', fontSize: '25px' }}></span></h2>
                    <Button type="primary" onClick={() => history.push(`/admin/nhan-su/xac-nhan-cong`)}>
                        Thêm xác nhận công
                    </Button>
    </div>
    <Row gutter={25} className='table-xacnhancong'>
      <Col xs={24}>
        <Cards headless>
          <ProjectList>
            <div className="table-responsive">
              <Table pagination={false} dataSource={dataSource} columns={columns} />
            </div>
          </ProjectList>
        </Cards>
      </Col>
    </Row>

    <Button type="primary" onClick={() => history.push(`/admin/nhan-su/kiem-tra-danh-sach-xac-nhan-cong`)}>
        Xác nhận công cho nhân viên
    </Button>
    
    </>
                )}
        </div>
  );
}

export default ListWorkConfirmation;
