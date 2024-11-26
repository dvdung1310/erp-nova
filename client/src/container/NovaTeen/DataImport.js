import React, { useState, useEffect } from 'react';
import { NavLink, useRouteMatch, Switch, Route } from 'react-router-dom';
import {
  Form,
  Col,
  Row,
  Select,
  Upload,
  Button,
  message,
  Space,
  Popconfirm,
  Spin,
  Card,
  Table,
  Drawer,
  Input,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './style.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx'; // Import thư viện xlsx
import { DeleteCustomer } from '../../apis/novaup/customer';
import { importdata, getDataImport, divideData } from '../../apis/novateen/index';
const { Option } = Select;
const DataImport = () => {
  const [file, setFile] = useState(null);
  const [customer, setCustomer] = useState([]);
  const [sales, setSale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDataImport();
      setCustomer(response.data);
      setSale(response.sale);
    } catch (error) {
      console.error('Error fetching ListCustomer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  // Chuyển đổi file Excel sang CSV trên client
  const convertExcelToCSV = (excelFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      // Chuyển đổi toàn bộ sheet thành CSV
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);

      // Tạo file CSV từ dữ liệu đã chuyển đổi
      const csvBlob = new Blob([csv], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `${excelFile.name.split('.')[0]}.csv`, { type: 'text/csv' });
      // Trả về file CSV đã chuyển đổi
      setFile(csvFile);
      message.success(`${excelFile.name} đã được chuyển thành file CSV!`);
    };

    reader.readAsBinaryString(excelFile);
  };
  // Xử lý thay đổi file khi người dùng chọn file
  const handleFileChange = ({ file }) => {
    // Kiểm tra nếu file là Excel
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // XLSX
      file.type === 'application/vnd.ms-excel'; // XLS

    if (!isExcel && file.type !== 'text/csv') {
      message.error('Chỉ chấp nhận file Excel (.xls, .xlsx) hoặc CSV!');
      setFile(null); // Xóa file nếu không đúng định dạng
      return;
    }

    setFile(file); // Lưu file vào state
    message.success(`${file.name} đã được chọn thành công!`);

    // Nếu là file Excel, chuyển đổi sang CSV ngay sau khi file được chọn
    if (file.type !== 'text/csv') {
      convertExcelToCSV(file);
    }
  };

  // Xử lý import file
  const handleImport = async () => {
    if (!file) {
      message.error('Vui lòng chọn file trước khi import!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // Thêm file vào FormData

    try {
      const response = await importdata(formData);
      message.success('Import dữ liệu thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi import file, vui lòng thử lại!');
    }
  };
  const handleDelete = (id) => {
    DeleteCustomer(id)
      .then((response) => {
        setCustomer(customer.filter((s) => s.id !== id));
        toast.success('Xóa khách hàng thành công!');
        fetchData();
      })
      .catch((error) => {
        toast.error('Xóa khách hàng thất bại!');
      });
  };
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const handleSubmit = async (values) => {
    try {
      const response = await divideData(values);
      if (response.error) {
        message.error(response.message);
      } else {
        message.success(response.message);
        onClose();
        fetchData(); // Làm mới dữ liệu
      }
    } catch (error) {
      message.error('Lỗi không xác định, vui lòng thử lại!');
    }
  };
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    // {
    //   title: 'Tên',
    //   dataIndex: 'name',
    //   key: 'name',
    //   render: (text, record) => (
    //     <NavLink to={`/admin/novateen/khach-hang/chi-tiet/${record.id}`}>
    //       {text}
    //     </NavLink>
    //   ),
    // },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <>
          <div>{text}</div> {/* Hiển thị tên phụ huynh */}
          <div style={{ color: 'gray' }}>({record.student_name})</div> {/* Hiển thị tên con */}
        </>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nguồn data',
      dataIndex: 'source_name',
      key: 'source_name',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* <Button type="primary" onClick={() => showModal(record)}>
            Sửa
          </Button> */}
          <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="danger" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center',marginBottom:'10px', justifyContent: 'space-between' }}>
        <h3 >Danh sách Data import</h3>
        <a href="/file_excel/file_import1.xlsx" download>
          <Button type="primary">Tải File Excel</Button>
        </a>
      </div>
      <Spin spinning={loading}>
        <Card>
          <div className="d-flex justify-content-between">
            <h2 className="fw-bold">Nguồn Khách Hàng</h2>
            <div>
              <Button type="primary" onClick={showDrawer}>
                Tùy chọn
              </Button>
              <Drawer title="Data Import" onClose={onClose} open={open}>
                <div>
                  <h4 style={{ textAlign: 'end' }}>Import file data</h4>
                  <Form layout="vertical">
                    <div>
                      <Form.Item style={{ width: '100%', height: '40px' }}>
                        <Upload
                          name="file"
                          accept=".xls,.xlsx,.csv" // Cho phép chọn các file Excel và CSV
                          beforeUpload={() => false} // Ngăn không cho upload tự động
                          showUploadList={false} // Không hiển thị danh sách file đã chọn
                          onChange={handleFileChange}
                        >
                          <Button icon={<UploadOutlined />}>Chọn File</Button>
                        </Upload>
                      </Form.Item>

                      <div>
                        <span style={{ marginLeft: '10px' }}>
                          {file ? `Đã chọn: ${file.name}` : 'Chưa có file nào được chọn'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'end' }}>
                        <Form.Item style={{ height: '40px', marginLeft: '10px' }}>
                          <Button type="primary" onClick={handleImport}>
                            Import File Data
                          </Button>
                        </Form.Item>
                      </div>
                    </div>
                  </Form>
                </div>
                <hr />
                <div>
                  <h4 style={{ textAlign: 'end' }}>Chia data cho Sale</h4>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit} // Gắn hàm xử lý bên ngoài
                  >
                    <Row gutter={24}>
                      <Col className="gutter-row" span={24}>
                        <Form.Item
                          name="data_quantity"
                          label="Số lượng data"
                          rules={[{ required: true, message: 'Vui lòng nhập số lượng data' }]}
                        >
                          <Input type="number" />
                        </Form.Item>
                      </Col>
                      <Col className="gutter-row" span={24}>
                        <Form.Item
                          name="sale_id"
                          label="Sales"
                          rules={[{ required: true, message: 'Vui lòng chọn Sale' }]}
                        >
                          <Select placeholder="Chọn Sale">
                            {sales.map((sale) => (
                              <Option key={sale.account_id} value={sale.account_id}>
                                {sale.employee_name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col className="gutter-row" span={24} style={{ display: 'flex', justifyContent: 'end' }}>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            Chia Data
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Drawer>
            </div>
          </div>
          <Table columns={columns} dataSource={customer} rowKey="id" />
        </Card>
      </Spin>
    </div>
  );
};

export default DataImport;
