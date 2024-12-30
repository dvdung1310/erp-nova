import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, LeftOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Thêm style cho Quill
import { SaveInstructionalDocument } from '../../apis/document/index';

const { Sider, Content } = Layout;

const GitBookClone = () => {
  const [pages, setPages] = useState(['Page 1']);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [newPageCount, setNewPageCount] = useState(1);
  const [pageData, setPageData] = useState([{ title: 'Page 1', description: '', content: '' }]);
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input change for document name
  const handleDocumentNameChange = (e) => {
    setDocumentName(e.target.value);
  };

  // Handle adding a new page
  const handleAddPage = () => {
    setLoading(true);
    const newPageName = `New Page ${newPageCount}`;
    
    setPages((prevPages) => {
      const updatedPages = [...prevPages, newPageName];
      return updatedPages;
    });

    setPageData((prevPageData) => {
      const updatedPageData = [
        ...prevPageData,
        { title: `New Page ${newPageCount}`, description: '', content: '' },
      ];
      return updatedPageData;
    });

    setSelectedPageIndex(pages.length);
    setNewPageCount(newPageCount + 1);

    setLoading(false);
  };

  // Handle saving the document to the database
  const handleSaveDocument = async () => {
    if (documentName.trim() === '') {
      alert('Please enter a document name');
      return;
    }
    const documentData = {
      name: documentName,
      pages: pageData,
    };
    try {
      setLoading(true);
      const response = await SaveInstructionalDocument(documentData);
      if (response.success) {
        message.success('Tạo tài liệu thành công!');
      }
    } catch (error) {
      message.error('Tạo tài liệu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to next page
  const handleNextPage = () => {
    if (selectedPageIndex < pages.length - 1) {
      setSelectedPageIndex(selectedPageIndex + 1);
    }
  };

  // Handle navigation to previous page
  const handlePreviousPage = () => {
    if (selectedPageIndex > 0) {
      setSelectedPageIndex(selectedPageIndex - 1);
    }
  };

  // Handle input changes for page data
  const handleInputChange = (field, value) => {
    const updatedPageData = [...pageData];
    updatedPageData[selectedPageIndex] = {
      ...updatedPageData[selectedPageIndex],
      [field]: value, // Cập nhật đúng field (title, description, content)
    };
    setPageData(updatedPageData);
  
    // Cập nhật title trong sidebar nếu cần
    if (field === 'title') {
      const updatedPages = [...pages];
      updatedPages[selectedPageIndex] = value;
      setPages(updatedPages);
    }
  };

  // Handle deleting a page
  const handleDeletePage = (index) => {
    const updatedPages = pages.filter((_, i) => i !== index);
    const updatedPageData = pageData.filter((_, i) => i !== index);
    setPages(updatedPages);
    setPageData(updatedPageData);

    if (selectedPageIndex >= updatedPages.length) {
      setSelectedPageIndex(updatedPages.length - 1);
    }
  };

  // Custom toolbar for image upload
  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  // Ensure that pageData is updated properly and persist content changes
  useEffect(() => {
    // Kiểm tra xem có trang nào không có nội dung chưa được lưu chưa
    const currentPageData = pageData[selectedPageIndex];
    if (currentPageData && currentPageData.content === '') {
      const updatedPageData = [...pageData];
      updatedPageData[selectedPageIndex] = {
        ...currentPageData,
        content: currentPageData.content || '', // Đảm bảo nội dung không bị mất
      };
      setPageData(updatedPageData);
    }
  }, [selectedPageIndex]);

  return (
    <div style={{ height: '100vh', background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop:'10px'
        }}
      >
        <Input
          placeholder="Nhập tên tài liệu"
          value={documentName}
          onChange={handleDocumentNameChange}
          style={{ width: '300px', border: 'none', outline: 'none' }}
        />
        <Button type="primary" onClick={handleSaveDocument} loading={loading}>
          Save Document
        </Button>
      </div>
      <hr />
      <Layout>
        <Sider
          width={250}
          style={{
            background: '#fff',
            borderRight: '1px solid #e0e0e0',
            padding: '20px',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddPage} block loading={loading}>
              Add new...
            </Button>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pages[selectedPageIndex]]}
            onClick={(e) => setSelectedPageIndex(pages.findIndex((page) => page === e.key))}
            items={pages.map((page, index) => ({
              key: page,
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{page}</span>
                  {index !== 0 && (
                    <Popconfirm
                      title="Are you sure you want to delete this page?"
                      onConfirm={() => handleDeletePage(index)}
                    >
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        style={{ padding: 0 }}
                      />
                    </Popconfirm>
                  )}
                </div>
              ),
            }))}
          />
        </Sider>

        <Content style={{ padding: '40px', background: '#fff' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Input
              style={{
                width: '100%',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px',
                border: 'none',
                padding: '10px',
                borderRadius: '4px',
                outline: 'none',
              }}
              value={pageData[selectedPageIndex]?.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />

            <Input
              style={{
                width: '100%',
                color: '#888',
                marginBottom: '20px',
                border: 'none',
                padding: '10px',
                borderRadius: '4px',
                outline: 'none',
              }}
              placeholder="Page description (optional)"
              value={pageData[selectedPageIndex]?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />

            <ReactQuill
              value={pageData[selectedPageIndex]?.content || ''}
              onChange={(value) => handleInputChange('content', value)}
              modules={modules}
              style={{
                width: '100%',
                height: '300px',
                border: 'none',
                padding: '10px',
                borderRadius: '4px',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '40px',
              }}
            >
              <Button
                type="default"
                icon={<LeftOutlined />}
                onClick={handlePreviousPage}
                disabled={selectedPageIndex === 0}
              >
                Previous
              </Button>
              <Button
                type="default"
                icon={<RightOutlined />}
                onClick={handleNextPage}
                disabled={selectedPageIndex === pages.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default GitBookClone;
