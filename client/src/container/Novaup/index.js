
import React, { useEffect, useState } from 'react'; // Import React và các hook từ React
import axios from 'axios'; // Import axios để gọi API
import { 
  Row, Col, Table, Spin, message, Button, Popconfirm, Modal, Form, Input 
} from 'antd'; // Import các thành phần UI từ Ant Design
import { PageHeader } from '../../components/page-headers/page-headers'; // Import tiêu đề trang
import { Cards } from '../../components/cards/frame/cards-frame'; // Import thẻ Card từ thư viện
import { Main } from '../styled'; // Import phần tử được styled

function Dashboard() {
  // Khai báo state để lưu dữ liệu và trạng thái của ứng dụng
  const [dataSource, setDataSource] = useState([]); // Dữ liệu của bảng
  const [loading, setLoading] = useState(true); // Trạng thái loading khi tải dữ liệu
  const [isModalVisible, setIsModalVisible] = useState(false); // Kiểm soát việc hiển thị modal
  const [currentItem, setCurrentItem] = useState(null); // Lưu bản ghi đang chỉnh sửa
  const [form] = Form.useForm(); // Tạo form từ Ant Design để quản lý dữ liệu biểu mẫu

  // Gọi API để lấy dữ liệu khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/nvustatus'); // Gọi API để lấy dữ liệu
        if (!response.data.error) { // Kiểm tra nếu không có lỗi từ server
          setDataSource(response.data.data); // Lưu dữ liệu vào state
        } else {
          message.error(response.data.message); // Thông báo lỗi từ server nếu có
        }
      } catch (err) {
        message.error('An error occurred while fetching data.'); // Thông báo lỗi khi API lỗi
      } finally {
        setLoading(false); // Ngừng trạng thái loading
      }
    };
    fetchData(); // Gọi hàm fetchData khi component được mount
  }, []); // Chạy 1 lần duy nhất khi component được render lần đầu

  // Hàm xử lý khi nhấn nút "Edit"
  const handleEdit = (record) => {
    setCurrentItem(record); // Lưu bản ghi đang chỉnh sửa vào state
    form.setFieldsValue(record); // Đổ dữ liệu của bản ghi vào form
    setIsModalVisible(true); // Hiển thị modal
  };

  // Hàm xử lý khi nhấn nút "Delete"
  const handleDelete = async (statusId) => {
    try {
      await axios.delete(`http://localhost:8000/api/nvustatus/${statusId}`); // Gọi API để xóa
      message.success('Deleted successfully'); // Thông báo thành công
      setDataSource((prevData) =>
        prevData.filter(item => item.status_id !== statusId) // Loại bỏ bản ghi khỏi state
      );
    } catch (error) {
      message.error('Failed to delete the record'); // Thông báo lỗi nếu xóa thất bại
    }
  };

  // Hàm xử lý khi nhấn "OK" trên modal
  const handleModalOk = async () => {
    try {
      const updatedItem = form.getFieldsValue(); // Lấy dữ liệu đã chỉnh sửa từ form
      await axios.put(`http://localhost:8000/api/nvustatus/${currentItem.status_id}`, updatedItem); // Gửi yêu cầu API để cập nhật
      message.success('Updated successfully'); // Thông báo cập nhật thành công

      // Cập nhật dữ liệu trong state để hiển thị thay đổi
      setDataSource((prevData) =>
        prevData.map(item =>
          item.status_id === currentItem.status_id ? { ...item, ...updatedItem } : item
        )
      );

      setIsModalVisible(false); // Đóng modal
    } catch (error) {
      message.error('Failed to update the record'); // Thông báo nếu cập nhật thất bại
    }
  };

  // Hàm xử lý khi nhấn "Cancel" trên modal
  const handleModalCancel = () => {
    setIsModalVisible(false); // Đóng modal
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    { title: 'Status ID', dataIndex: 'status_id', key: 'status_id' }, // Cột ID
    { title: 'Status Name', dataIndex: 'status_name', key: 'status_name' }, // Cột Tên
    { 
      title: 'Status Color', 
      dataIndex: 'status_color', 
      key: 'status_color',
      render: (text) => <div style={{ backgroundColor: text }}>{text}</div>, // Hiển thị màu nền tương ứng
    },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' }, // Cột ngày tạo
    { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at' }, // Cột ngày cập nhật
    {
      title: 'Actions', // Cột chứa các nút hành động
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button type="primary" onClick={() => handleEdit(record)}>Edit</Button> {/* Nút chỉnh sửa */}
          <Popconfirm
            title="Are you sure to delete this status?" // Xác nhận khi xóa
            onConfirm={() => handleDelete(record.status_id)} // Gọi hàm xóa khi xác nhận
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button> {/* Nút xóa */}
          </Popconfirm>
        </span>
      ),
    },
  ];

  // Trả về giao diện JSX
  return (
    <>
      <PageHeader ghost title="Table" /> {/* Tiêu đề trang */}
      <Main>
        <Row gutter={15}> {/* Tạo hàng với khoảng cách 15px */}
          <Col xs={24}> {/* Cột chiếm toàn bộ màn hình trên các thiết bị nhỏ */}
            <Cards title="Basic Usage"> {/* Thành phần Card */}
              {loading ? ( // Kiểm tra nếu đang loading
                <Spin tip="Loading..." /> // Hiển thị spinner khi đang tải
              ) : (
                <Table
                  className="table-responsive" // Bảng có thể cuộn
                  pagination={false} // Không dùng phân trang
                  dataSource={dataSource} // Dữ liệu của bảng
                  columns={columns} // Các cột trong bảng
                  rowKey="status_id" // Khóa duy nhất cho mỗi hàng
                />
              )}
            </Cards>
          </Col>
        </Row>

        <Modal
          title="Edit Status" // Tiêu đề modal
          visible={isModalVisible} // Kiểm soát hiển thị modal
          onOk={handleModalOk} // Xử lý khi nhấn OK
          onCancel={handleModalCancel} // Xử lý khi nhấn Cancel
        >
          <Form form={form} layout="vertical"> {/* Biểu mẫu với layout dọc */}
            <Form.Item label="Status ID" name="status_id">
              <Input disabled /> {/* Input không thể chỉnh sửa */}
            </Form.Item>
            <Form.Item 
              label="Status Name" 
              name="status_name" 
              rules={[{ required: true, message: 'Please enter status name!' }]} // Kiểm tra bắt buộc
            >
              <Input />
            </Form.Item>
            <Form.Item 
              label="Status Color" 
              name="status_color" 
              rules={[{ required: true, message: 'Please enter status color!' }]} // Kiểm tra bắt buộc
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default Dashboard; // Xuất component để sử dụng trong các phần khác
