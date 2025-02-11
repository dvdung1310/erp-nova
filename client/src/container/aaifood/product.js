import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import { Cards } from '../../components/cards/frame/cards-frame';
import { allProduct, storeProduct, updateProduct } from '../../apis/aaifood/index';
import { NumericFormat } from 'react-number-format';
import moment from 'moment';
const { Option } = Select;

const suppliers = () => {
  const [dataSource, setDataSource] = useState([]);
    const [allData, setAllData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Thêm trạng thái
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');
  const debounceTimeout = useRef(null);
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allProduct();
      setDataSource(response.data);
      setAllData(response.data);
      setSuppliers(response.suppliers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ListSource:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const handleAddNew = () => {
    form.resetFields();
    setEditingProduct(null); // Đặt lại trạng thái chỉnh sửa
    setIsAddModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);

    // Kiểm tra giá trị ngày có hợp lệ không trước khi thiết lập vào form
    // const product_quantity_remaining = moment(record.product_quantity_remaining, 'DD/MM/YYYY');
    // const inputDate = moment(record.product_input_date, 'DD/MM/YYYY');
    // const shelfLifeDate = moment(record.product_shelf_life, 'DD/MM/YYYY');

    // Kiểm tra và set giá trị cho form, đảm bảo rằng ngày hợp lệ
    form.setFieldsValue({
      product_id: record.product_id,
      product_name: record.product_name,
      product_unit: record.product_unit,
      product_input_price: record.product_input_price,
      product_output_price: record.product_output_price,
      product_input_quantity: record.product_input_quantity,
      suppliers_id: record.suppliers_id,
      product_date_manufacture: moment(record.product_date_manufacture),
      product_input_date: moment(record.product_input_date),
      product_shelf_life: moment(record.product_shelf_life),
      // product_input_date: inputDate.isValid() ? inputDate : null,  // Chỉ set nếu hợp lệ
      // product_shelf_life: shelfLifeDate.isValid() ? shelfLifeDate : null // Chỉ set nếu hợp lệ
    });

    setIsAddModalVisible(true);
  };

  const handleCancel = () => {
    setIsAddModalVisible(false);
    setEditingProduct(null); // Đặt lại trạng thái chỉnh sửa
    form.resetFields();
  };

  const handleAddModalOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields(); // Lấy dữ liệu từ form
      // Xử lý định dạng ngày tháng năm trước khi gửi
      const formattedValues = {
        ...values,
        product_date_manufacture: values.product_date_manufacture
          ? values.product_date_manufacture.format('YYYY-MM-DD')
          : null,
        product_shelf_life: values.product_shelf_life ? values.product_shelf_life.format('YYYY-MM-DD') : null,
        product_input_date: values.product_input_date ? values.product_input_date.format('YYYY-MM-DD') : null,
      };

      if (editingProduct) {
        // Nếu đang chỉnh sửa, gọi API update
        const response = await updateProduct(formattedValues, editingProduct.id);
        if (response.success) {
          message.success('Cập nhật nhà cung cấp thành công');
          fetchDocument();
        } else {
          message.error(response.message || 'Cập nhật thất bại!');
        }
      } else {
        // Nếu thêm mới, gọi API store
        const response = await storeProduct(formattedValues);
        if (response.success) {
          message.success('Thêm nhà cung cấp thành công');
          fetchDocument();
        } else {
          message.error(response.message || 'Thêm mới thất bại!');
        }
      }

      // Đóng modal và reset form
      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    const filteredData = allData.filter((product) => {
      const keyword = searchKeyword.toLowerCase();
      return (
        product.product_name?.toLowerCase().includes(keyword) || // Tìm kiếm theo tên
        product.product_id?.toLowerCase().includes(keyword)
      );
    });
    setDataSource(filteredData); // Cập nhật danh sách nhân sự
  };
  const columns = [
    { title: 'ID', dataIndex: 'product_id', key: 'product_id' },
    { title: 'Tên sản phẩm', dataIndex: 'product_name', key: 'product_name' },
    {
      title: 'Đơn vị tính',
      dataIndex: 'product_unit',
      key: 'product_unit',
    },
    {
      title: 'Giá nhập',
      dataIndex: 'product_input_price',
      key: 'product_input_price',
      render: (text) => {
        // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
        return text
          ? parseFloat(text).toLocaleString('en-US', {
              style: 'decimal',
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
          : '';
      },
    },

    {
      title: 'Giá bán',
      dataIndex: 'product_output_price',
      key: 'product_output_price',
      render: (text) => {
        // Kiểm tra và định dạng số với dấu phân cách hàng nghìn là dấu phẩy và phần thập phân có dấu chấm
        return text
          ? parseFloat(text).toLocaleString('en-US', {
              style: 'decimal',
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })
          : '';
      },
    },
    { title: 'Số lượng nhập', dataIndex: 'product_input_quantity', key: 'product_input_quantity' },
    { title: 'Số lượng còn', dataIndex: 'product_quantity_remaining', key: 'product_quantity_remaining' },
    {
      title: 'Ngày nhập kho',
      dataIndex: 'product_input_date',
      key: 'product_input_date',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Chuyển đổi định dạng ngày tháng
    },
    {
      title: 'Ngày sản xuất',
      dataIndex: 'product_date_manufacture',
      key: 'product_date_manufacture',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Chuyển đổi định dạng ngày tháng
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'product_shelf_life',
      key: 'product_shelf_life',
      render: (text) => moment(text).format('DD/MM/YYYY'), // Chuyển đổi định dạng ngày tháng
    },
    { title: 'Nhà cung cấp', dataIndex: 'suppliers_name', key: 'suppliers_name' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleEdit(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={15}>
        <Col xs={24}>
          <Cards title="Quản lý kho sản phẩm">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
                Nhập kho sản phẩm
              </Button>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Search Form */}
                <Input
                  placeholder="Tìm kiếm sản phẩm"
                  style={{ width: 200, height: '40px' }}
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    handleSearch();
                  }}
                />
              </div>
            </div>
            {loading ? (
              <div className="spin">
                <Spin />
              </div>
            ) : (
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={dataSource}
                columns={columns}
                rowKey="product_id"
              />
            )}
          </Cards>
        </Col>
      </Row>
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Mã sản phẩm (Lưu ý: Nhập mã viết liền không dấu)"
                name="product_id"
                rules={[{ required: true, message: 'Vui lòng nhập sản phẩm!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Tên sản phẩm"
                name="product_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label="Đơn vị tính"
                name="product_unit"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Giá nhập"
                name="product_input_price"
                rules={[{ required: true, message: 'Vui lòng nhập giá nhập kho!' }]}
              >
                <NumericFormat
                  customInput={Input}
                  thousandSeparator={true} // Thêm dấu phân cách hàng nghìn
                  decimalSeparator="." // Dấu phân cách phần thập phân
                  decimalScale={3} // Giới hạn số chữ số thập phân (ví dụ: 3 chữ số thập phân)
                  fixedDecimalScale={true} // Cố định số chữ số thập phân
                  allowNegative={false} // Không cho phép số âm
                  placeholder="Nhập giá nhập kho"
                  onValueChange={(values) => {
                    form.setFieldsValue({ product_input_price: values.value });
                  }}
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={12}>
              <Form.Item label="Giá bán" name="product_output_price">
                <NumericFormat
                  customInput={Input}
                  thousandSeparator={true} // Thêm dấu phân cách hàng nghìn
                  decimalSeparator="." // Dấu phân cách phần thập phân
                  decimalScale={3} // Giới hạn số chữ số thập phân (ví dụ: 3 chữ số thập phân)
                  fixedDecimalScale={true} // Cố định số chữ số thập phân
                  allowNegative={false} // Không cho phép số âm
                  placeholder="Nhập giá bán"
                  onValueChange={(values) => {
                    form.setFieldsValue({ product_output_price: values.value });
                  }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item
                label="Số lượng nhập"
                name="product_input_quantity"
                rules={[{ required: true, message: 'Vui lòng số lượng nhập!' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={12}>
              <Form.Item label="Nhà cung cấp" name="suppliers_id">
                <Select
                  placeholder="Chọn nhà cung cấp"
                  allowClear // Cho phép xóa lựa chọn
                  showSearch // Hiển thị khung tìm kiếm
                >
                  {suppliers && suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <Option key={supplier.suppliers_id} value={supplier.suppliers_id}>
                        {supplier.supplier_name}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>Không có dữ liệu</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item label="Ngày sản xuất" name="product_date_manufacture">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  // disabledDate={(current) => current && current < moment().startOf('day')}
                  style={{ height: '45px', padding: '10px', with: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item label="Hạn sử dụng sản phẩm" name="product_shelf_life">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  style={{ height: '45px', padding: '10px', with: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={24}>
              <Form.Item label="Ngày nhập kho" name="product_input_date">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  style={{ height: '45px', padding: '10px', with: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default suppliers;
