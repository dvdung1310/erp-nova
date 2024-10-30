import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  Table,
  Spin,
  message,
  Popconfirm,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
} from 'antd';
import moment from 'moment';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import {
  getEmployeesFile,
  createEmployeesFile,
  storeEmployeesFile,
  updateEmployeesFile,
  deleteEmployeesFile,
} from '../../apis/employees/employee';

const { Option } = Select;
const { Dragger } = Upload;
const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
function CrmEmployees() {
  const { path } = useRouteMatch();
  const { employee_id } = useParams();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [categoryFile, setCategoryFile] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployeesFile(employee_id);
      if (!res.error) {
        setDataSource(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreateData = async () => {
    try {
      const res = await createEmployeesFile();
      if (!res.error) {
        setCategoryFile(res.data.categoryFile || []);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu tạo mới.');
    }
  };

  useEffect(() => {
    fetchData();
    fetchCreateData();
  }, []);

  const handleOpenModal = (employee = null) => {
    form.resetFields();
    if (employee) {
      form.setFieldsValue({
        category_id: employee.category_id ?? '',
        file_name: employee.file_name ?? '',
        file_discription: employee.file_discription ?? '',
        file_date: employee.file_date ? moment(employee.file_date) : null,
        file_status: employee.file_status ?? 1,
        employee_id: employee.employee_id ?? '',
      });
    }
    setEditingEmployee(employee);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      // Append form data
      for (const key in values) {
        if (values[key] instanceof moment) {
          formData.append(key, values[key].format('YYYY-MM-DD'));
        } else {
          formData.append(key, values[key]);
        }
      }

      // Append file if uploaded
      const fileList = form.getFieldValue('file');
      if (fileList && fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      }

      let response;
      if (editingEmployee) {
        response = await updateEmployeesFile(formData, editingEmployee.file_id);
        message.success('Cập nhật hồ sơ thành công!');
      } else {
        response = await storeEmployeesFile(formData);
        setDataSource((prev) => [...prev, response.data.data]);
        message.success('Thêm mới hồ sơ thành công!');
      }

      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lưu thông tin thất bại: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteEmployeesFile(id);
      if (res.success) {
        setDataSource((prev) => prev.filter((item) => item.file_id !== id));
        message.success('Xóa nhân sự thành công!');
      } else {
        message.error('Xóa nhân sự thất bại.');
      }
    } catch (error) {
      message.error('Xóa nhân sự thất bại.');
    }
  };
  const handleFileClick = (file) => {
    const completePath = `${LARAVEL_SERVER}/storage/${file}`; // Thay bằng đường dẫn file thực tế
    setPreviewFile(completePath);
    setFileModalVisible(true); // Hiển thị modal khi nhấn vào tên file
  };

  const columns = [
    { title: 'ID', dataIndex: 'file_id', key: 'file_id' },
    { title: 'Tên hồ sơ', dataIndex: 'file_name', key: 'file_name' },
    { title: 'Mô tả', dataIndex: 'file_discription', key: 'file_discription' },
    // { title: 'Ngày', dataIndex: 'file_date', key: 'file_date' },
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      render: (file) => (
        <Button type="link" onClick={() => handleFileClick(file)}>
          hồ sơ
        </Button>
      ),
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => moment(created_at).format('DD-MM-YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa không?"
            onConfirm={() => handleDelete(record.file_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <Main>
      <Switch>
        <Route exact path={path}>
          <Row gutter={15}>
            <Col xs={24}>
              <Cards title="Danh sách hồ sơ nhân sự">
                <Button type="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
                  Thêm mới hồ sơ
                </Button>
                {loading ? (
                  <Spin tip="Loading..." />
                ) : (
                  <Table
                    className="table-responsive"
                    pagination={false}
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="file_id"
                  />
                )}
              </Cards>
            </Col>
          </Row>
        </Route>
      </Switch>

      <Modal
        title={editingEmployee ? 'Sửa hồ sơ' : 'Thêm hồ sơ'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          {/* <Form.Item name="category_id" label="Danh mục" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục">
              {categoryFile.map((item) => (
                <Option key={item.category_id} value={item.category_id}>
                  {item.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
          <Form.Item name="file_name" label="Tên file" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên file" />
          </Form.Item>
          <Form.Item name="file_discription" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả" rows={3} />
          </Form.Item>
          {/* <Form.Item name="file_date" label="Ngày tạo hồ sơ" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item> */}
          <Form.Item name="file" label="Tải file" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Dragger beforeUpload={() => false}>
              <p>Click hoặc kéo tệp vào đây để tải lên</p>
            </Dragger>
          </Form.Item>
          <Form.Item name="employee_id" initialValue={employee_id} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="file_status" initialValue={1} hidden>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
  title="Xem trước file"
  visible={fileModalVisible}
  footer={null}
  onCancel={() => setFileModalVisible(false)}
  width={800}
>
  {previewFile ? (
    previewFile.match(/\.(pdf)$/i) ? (
      <iframe src={previewFile} title="PDF Preview" width="100%" height="500px" style={{ border: 'none' }} />
    ) : previewFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
      <img src={previewFile} alt="Preview" style={{ width: '100%' }} />
    ) : previewFile.match(/\.(doc|docx|xls|xlsx)$/i) ? (
      <iframe
        src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewFile)}`}
        title="Office Preview"
        width="100%"
        height="500px"
        style={{ border: 'none' }}
      />
    ) : (
      <div style={{ textAlign: 'center' }}>
        <p>Không thể hiển thị loại tệp này trong modal.</p>
        <Button type="primary" href={previewFile} target="_blank" rel="noopener noreferrer">
          Tải xuống hoặc xem file
        </Button>
      </div>
    )
  ) : (
    <p>Không có file để xem trước.</p>
  )}
</Modal>

    </Main>
  );
}

export default CrmEmployees;
