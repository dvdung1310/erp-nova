import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select } from 'antd';
import { Cards } from '../../components/cards/frame/cards-frame';
import { allSuppliers, storeSuppliers, updateSuppliers } from '../../apis/aaifood/index';
const suppliers = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null); // Thêm trạng thái
  const [form] = Form.useForm();

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allSuppliers();
      setDataSource(response.data);
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
    setEditingSupplier(null); // Đặt lại trạng thái chỉnh sửa
    setIsAddModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSupplier(record);
    form.setFieldsValue(record); // Đặt giá trị ban đầu cho form
    setIsAddModalVisible(true);
  };

  const handleCancel = () => {
    setIsAddModalVisible(false);
    setEditingSupplier(null); // Đặt lại trạng thái chỉnh sửa
    form.resetFields();
  };

  const handleAddModalOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      if (editingSupplier) {
        const response = await updateSuppliers(values, editingSupplier.id); // Gọi API cập nhật
        if (response.success) {
          message.success('Cập nhật nhà cung cấp thành công');
          fetchDocument();
        } else {
          message.error(response.message);
        }
      } else {
        console.log('====================================');
        console.log(values);
        console.log('====================================');
        const response = await storeSuppliers(values); // Gọi API thêm mới
        if (response.success) {
          message.success('Thêm nhà cung cấp thành công');
          fetchDocument();
        } else {
          message.error(response.message);
        }
      }
      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'suppliers_id', key: 'suppliers_id' },
    { title: 'Nhà cung cấp', dataIndex: 'suppliers_name', key: 'suppliers_name' },
    { title: 'Mã số thuế', dataIndex: 'suppliers_mst', key: 'suppliers_mst' },
    { title: 'Số điện thoại', dataIndex: 'suppliers_phone', key: 'suppliers_phone' },
    { title: 'Địa chỉ', dataIndex: 'suppliers_address', key: 'suppliers_address' },
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
          <Cards title="Quản lý nhà cung cấp">
            <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
              Thêm nhà cung cấp
            </Button>
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
                rowKey="suppliers_id"
              />
            )}
          </Cards>
        </Col>
      </Row>
      <Modal
        title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" initialValues={editingSupplier ? editingSupplier : {}}>
          <Form.Item
            label="Mã nhà cung cấp (Lưu ý: Mã nhập vào phải viết liền, không dấu)"
            name="suppliers_id"
            rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp!' }]}
          >
            <Input disabled={!!editingSupplier} />
          </Form.Item>
          <Form.Item
            label="Tên nhà cung cấp"
            name="suppliers_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mã số thuế" name="suppliers_mst">
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="suppliers_phone"

          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="suppliers_address"
  
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default suppliers;