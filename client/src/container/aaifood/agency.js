import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Row, Col, Table, Spin, message, Button, Modal, Form, Input, Select } from 'antd';
import { Cards } from '../../components/cards/frame/cards-frame';
import { allAgency, storeAgency, updateAgency } from '../../apis/aaifood/index';
const { Option } = Select;
const suppliers = () => {
  const [dataSource, setDataSource] = useState([]);
  const [agencyLevel, setAgencyLevel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null); // Thêm trạng thái
  const [form] = Form.useForm();

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await allAgency();
      setDataSource(response.data);
      setAgencyLevel(response.agency_level);
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
        const response = editingSupplier
            ? await updateAgency(values, editingSupplier.id)
            : await storeAgency(values);

        if (response.success) {
            message.success(editingSupplier ? 'Cập nhật nhà cung cấp thành công' : 'Thêm nhà cung cấp thành công');
            fetchDocument();
            setIsAddModalVisible(false);
            form.resetFields();
        } else if (response.errors) {
            // Set form fields with errors
            const fields = Object.keys(response.errors).map((field) => ({
                name: field,
                errors: response.errors[field],
            }));
            form.setFields(fields);
        } else {
            message.error(response.message || 'Đã xảy ra lỗi. Vui lòng thử lại!');
        }
    } catch (error) {
        message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
    setLoading(false);
};

  

  const columns = [
    { title: 'ID', dataIndex: 'agency_id', key: 'agency_id' },
    { title: 'Đại lý', dataIndex: 'agency_name', key: 'agency_name' },
    { title: 'Số điện thoại', dataIndex: 'agency_phone', key: 'agency_phone' },
    { title: 'Địa chỉ', dataIndex: 'agency_address', key: 'agency_address' },
    { title: 'Cấp đại lý', dataIndex: 'level_name', key: 'level_name' },
    { title: 'Mức triết khấu', dataIndex: 'agency_discount', key: 'agency_discount' },
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
          <Cards title="Quản lý đại lý">
            <Button type="primary" onClick={handleAddNew} style={{ marginBottom: 16 }}>
              Thêm đại lý
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
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã đại lý"
            name="agency_id"
            rules={[{ required: true, message: 'Vui lòng nhập mã đại lý!' }]}
          >
            <Input disabled={!!editingSupplier} />
          </Form.Item>
          <Form.Item
            label="Tên đại lý"
            name="agency_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên đại lý!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="agency_phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại đại lý!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="agency_address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ đại lý!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Nhà cung cấp"
            name="agency_level"
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
          >
            <Select
              placeholder="Chọn nhà cung cấp"
              allowClear // Cho phép xóa lựa chọn
              showSearch // Hiển thị khung tìm kiếm
            >
              {agencyLevel && agencyLevel.length > 0 ? (
                agencyLevel.map((level) => (
                  <Option key={level.id} value={level.id}>
                    {level.level_name}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có dữ liệu</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item
            label="Mức triết khấu (%)"
            name="agency_discount"
            rules={[{ required: true, message: 'Vui lòng nhập mức triết khấu!' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default suppliers;
