import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Menu, Button, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, LeftOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Thêm style cho Quill
import { updateInstructionalDocument, detailInstructionalDocument } from '../../apis/document/index';

const { Sider, Content } = Layout;

const GitBookClone = () => {
  const { id } = useParams();
  const [dataSource, setDataSource] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [newPageCount, setNewPageCount] = useState(1);
  const [pageData, setPageData] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch document data
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await detailInstructionalDocument(id);
      setDataSource(response.data || []);
      setPages(response.data.map((page) => page.page_title)); // Set the page titles
      setPageData(response.data.map((page) => ({
        title: page.page_title,
        description: page.page_description,
        content: page.page_content,
      }))); // Set the page data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching document:', error);
      setLoading(false);
    }
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
      const updatedPageData = [...prevPageData, { title: `New Page ${newPageCount}`, description: '', content: '' }];
      return updatedPageData;
    });

    setSelectedPageIndex(pages.length);
    setNewPageCount(newPageCount + 1);

    setLoading(false);
  };

  // Handle saving the document to the database
  const handleSaveDocument = async () => {

    const documentData = {
      pages: pageData,
    };
    try {
      setLoading(true);
      const response = await updateInstructionalDocument(documentData,id);
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
      [field]: value,
    };
    setPageData(updatedPageData);

    // Update the title in sidebar if necessary
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
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline'],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  // Fetch document data when component mounts
  useEffect(() => {
    fetchDocument();
  }, []);

  return (
    <div style={{ height: '100vh', background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop:'10px'
        }}
      >
        <Button type="primary" onClick={handleSaveDocument} loading={loading}>
          Cập nhật tài liệu
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
                      <Button type="link" icon={<DeleteOutlined />} style={{ padding: 0 }} />
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
