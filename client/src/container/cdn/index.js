import React, { useState, lazy, Suspense, useLayoutEffect } from 'react';
import { Row, Col, Form, Input, Select, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { Link, useRouteMatch, Switch, Route, NavLink } from 'react-router-dom';
import { NoteNav, NoteWrapper, Bullet } from './style';
import { BasicFormWrapper, Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Modal } from '../../components/modals/antd-modals';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { noteAddData } from '../../redux/note/actionCreator';
import { FaRegFolderOpen,FaFileExport } from "react-icons/fa6";
import { FaTrash,FaBusinessTime } from "react-icons/fa";
const All = lazy(() => import('./overview/all'));
const MyDocument = lazy(() => import('./overview/myDocumentFolder'));
const ShareMe = lazy(() => import('./overview/shareMe'));
const DocumentDelete = lazy(() => import('./overview/documentDelete'));
const FolderDetail = lazy(() => import('./overview/folder_detail'));
const FolderDetailShare = lazy(() => import('./overview/detail_document_share'));

const { Option } = Select;
function Note() {
  const { noteData } = useSelector((state) => {
    return {
      noteData: state.Note.data,
    };
  });
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { path } = useRouteMatch();
  const [state, setState] = useState({
    visible: false,
    modalType: 'primary',
    checked: [],
    responsive: 0,
    collapsed: false,
  });

  const { responsive, collapsed } = state;

  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      setState({ responsive: width });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const showModal = () => {
    setState({
      ...state,
      visible: true,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
    });
  };

  const handleOk = (values) => {
    onCancel();
    const arrayData = [];
    noteData.map((data) => {
      return arrayData.push(data.key);
    });
    const max = Math.max(...arrayData);
    dispatch(
      noteAddData([
        ...noteData,
        {
          ...values,
          key: max + 1,
          time: new Date().getTime(),
          stared: false,
        },
      ]),
    );
    form.resetFields();
  };

  const handleCancel = () => {
    onCancel();
  };

  const toggleCollapsed = () => {
    setState({
      ...state,
      collapsed: !collapsed,
    });
  };

  const collapseSidebar = () => {
    setState({
      ...state,
      collapsed: false,
    });
  };

  return (
    <>
      <PageHeader
        ghost
        title="QUẢN LÝ TÀI LIỆU"
        // buttons={[
        //   <div key="1" className="page-header-actions">
        //     <CalendarButtonPageHeader />
        //     <ExportButtonPageHeader />
        //     <ShareButtonPageHeader />
        //     <Button size="small" type="primary">
        //       <FeatherIcon icon="plus" size={14} />
        //       Add New
        //     </Button>
        //   </div>,
        // ]}
      />

      <Main>
        <NoteWrapper>
          <Row className="justify-content-center" gutter={25}>
            <Col className="trigger-col" xxl={5} xl={7} lg={9} xs={24}>
              {responsive <= 991 && (
                <Button type="link" className="mail-sidebar-trigger" style={{ marginTop: 0 }} onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'} />
                </Button>
              )}
              {responsive > 991 ? (
                <div className="sidebar-card">
                  <Cards headless>
                    <div className="note-sidebar-bottom">
                      <NoteNav>
                        <div className="nav-labels" style={{marginTop:'0px'}}>
                          <ul>
                            <li>
                              <NavLink to={`${path}/all`}>
                              <FaBusinessTime /> Gần đây
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${path}/cua-toi`}>
                              <FaRegFolderOpen /> Tài liệu của tôi
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${path}/duoc-chia-se`}>
                              <FaFileExport /> Được chia sẻ với tôi
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${path}/thung-rac`}>
                              <FaTrash /> Thùng rác
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </NoteNav>
                    </div>
                  </Cards>
                </div>
              ) : (
                <div className={collapsed ? 'sidebar-card note-sideabr show' : 'sidebar-card note-sideabr hide'}>
                  <Cards headless>
                    <div className="note-sidebar-bottom">
                      <NoteNav>
                        <div className="nav-labels" style={{marginTop:'0px'}}>
                          <ul>
                            <li>
                              <NavLink to={`${path}/all`} onClick={collapseSidebar}>
                                <Bullet className="personal" /> Gần đây
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${path}/cua-toi`} onClick={collapseSidebar}>
                                <Bullet className="work" /> Tài liệu của tôi
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${path}/duoc-chia-se`} onClick={collapseSidebar}>
                                <Bullet className="social" /> Được chia sẻ với tôi
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={`${path}/thung-rac`} onClick={collapseSidebar}>
                                <Bullet className="important" /> Thùng rác
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </NoteNav>
                    </div>
                  </Cards>
                </div>
              )}
            </Col>
            <Col xxl={19} xl={17} lg={15} xs={24}>
              <Switch>
                <Suspense
                  fallback={
                    <div className="spin">
                      <Spin />
                    </div>
                  }
                >
                  <Route exact path={`${path}/all`} component={All} />
                  <Route exact path={`${path}/tai-lieu/:id`} component={FolderDetail} />
                  <Route path={`${path}/cua-toi`} component={MyDocument} />
                  <Route path={`${path}/duoc-chia-se`} component={ShareMe} />
                  <Route path={`${path}/tai-lieu-chia-se/:id`} component={FolderDetailShare} />
                  <Route path={`${path}/thung-rac`} component={DocumentDelete} />
                </Suspense>
              </Switch>
            </Col>
          </Row>
        </NoteWrapper>
       
      </Main>
    </>
  );
}

Note.propTypes = {
  // match: PropTypes.shape(PropTypes.object),
};
export default Note;
