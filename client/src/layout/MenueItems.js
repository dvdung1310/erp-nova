import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import FeatherIcon from 'feather-icons-react';
import propTypes from 'prop-types';
import { NavTitle } from './style';
import versions from '../demoData/changelog.json';
import { getGroupByUserId } from '../apis/work/group';
import { FaPeopleArrows, FaRegNewspaper, FaWarehouse } from 'react-icons/fa';
import { FaHouseLaptop, FaUsersLine } from 'react-icons/fa6';
import { GrStorage } from 'react-icons/gr';
import { BsHouseUp } from 'react-icons/bs';
import { checkRoleUser } from '../apis/aaifood';

const { SubMenu } = Menu;

function MenuItems({ darkMode, toggleCollapsed, topMenu, events }) {
  const [roleUser, setRoleUser] = useState(null);

  const { path } = useRouteMatch();
  const pathName = window.location.pathname;
  const pathArray = pathName.split(path);
  const mainPath = pathArray[1];
  const [listGroup, setListGroup] = useState([]);
  const mainPathSplit = mainPath.split('/');
  const { onRtlChange, onLtrChange, modeChangeDark, modeChangeLight, modeChangeTopNav, modeChangeSideNav } = events;
  const [openKeys, setOpenKeys] = React.useState(
    !topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : [],
  );

  const onOpenChange = (keys) => {
    setOpenKeys(keys[keys.length - 1] !== 'recharts' ? [keys.length && keys[keys.length - 1]] : keys);
  };

  const onClick = (item) => {
    if (item.keyPath.length === 1) setOpenKeys([]);
  };
  //
  const [openKey, setOpenKey] = useState([]);

  const onOpenChanges = (keys) => {
    setOpenKey(keys);
  };
  // lấy dữ liệu group
  const fetchGroup = async () => {
    try {
      const [response, checkRole] = await Promise.all([getGroupByUserId(), checkRoleUser()]);
      console.log('checkRole response:', checkRole);
      setRoleUser(checkRole.data.data);
      setListGroup(response?.data);
    } catch (error) {
      console.log('error', error);
    }
  };
  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <Menu
      onOpenChange={onOpenChange}
      onClick={onClick}
      mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
      theme={darkMode && 'dark'}
      // // eslint-disable-next-line no-nested-ternary
      defaultSelectedKeys={
        !topMenu
          ? [
              `${
                mainPathSplit.length === 1 ? 'home' : mainPathSplit.length === 2 ? mainPathSplit[1] : mainPathSplit[2]
              }`,
            ]
          : []
      }
      defaultOpenKeys={!topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : []}
      overflowedIndicator={<FeatherIcon icon="more-vertical" />}
      openKeys={openKeys}
    >
      {roleUser && roleUser.department_id === 11 ? (
        // Chỉ hiển thị menu Trang chủ
        <SubMenu key="depot" icon={!topMenu && <FaWarehouse size={16} />} title="KHO HÀNG">
          {roleUser && (
            <>
              <Menu.Item key="manager-sales">
                <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/ban-hang`}>
                  Bán hàng
                </NavLink>
              </Menu.Item>
              <Menu.Item key="manager-revenue">
                <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/doanh-thu`}>
                  Doanh thu
                </NavLink>
              </Menu.Item>
            </>
          )}
        </SubMenu>
      ) : (
        <>
          <SubMenu
            style={{ display: 'none' }}
            key="dashboard"
            icon={!topMenu && <FeatherIcon icon="home" />}
            title="Dashboard"
          >
            <Menu.Item key="home">
              <NavLink onClick={toggleCollapsed} to={`${path}`}>
                Social Media
              </NavLink>
            </Menu.Item>
            <Menu.Item key="business">
              <NavLink onClick={toggleCollapsed} to={`${path}/business`}>
                Fintech / Business
              </NavLink>
            </Menu.Item>
            <Menu.Item key="performance">
              <NavLink onClick={toggleCollapsed} to={`${path}/performance`}>
                Site Performance
              </NavLink>
            </Menu.Item>
            <Menu.Item key="eco">
              <NavLink onClick={toggleCollapsed} to={`${path}/eco`}>
                Ecommerce
              </NavLink>
            </Menu.Item>
            <Menu.Item key="crm">
              <NavLink onClick={toggleCollapsed} to={`${path}/crm`}>
                CRM
              </NavLink>
            </Menu.Item>
            <Menu.Item key="sales">
              <NavLink onClick={toggleCollapsed} to={`${path}/sales`}>
                Sales Performance
              </NavLink>
            </Menu.Item>
          </SubMenu>

          {/*home*/}
          <Menu.Item key="home" icon={<FeatherIcon icon="home" />}>
            <NavLink to={`${path}`} style={{ textTransform: 'uppercase' }}>
              Trang chủ
            </NavLink>
          </Menu.Item>
          {/* <Menu.Item key="news" icon={<FaRegNewspaper size={16}/>}>
                        <NavLink to={`${path}/tin-tuc/trang-chu`} style={{textTransform: 'uppercase'}}>TIN TỨC</NavLink>
                    </Menu.Item> */}
          {/*end home*/}
          {/* Quản lý nhân sự */}
          <SubMenu
            key="employees"
            icon={!topMenu && <FeatherIcon icon="users" />}
            title={<span style={{ textTransform: 'uppercase' }}>Nhân sự</span>}
          >
            <Menu.Item className="pl-custom-sidebar" key="list_employee">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-nhan-su`}>
                Danh sách nhân sự
              </NavLink>
            </Menu.Item>
            <Menu.Item className="pl-custom-sidebar" key="list_department">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/phong-ban`}>
                Phòng ban
              </NavLink>
            </Menu.Item>

            <Menu.Item className="pl-custom-sidebar" key="works-chedule">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/lich-lam-viec`}>
                Lịch làm việc
              </NavLink>
            </Menu.Item>
            <Menu.Item className="pl-custom-sidebar" key="works-dayoff">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/nghi-phep`}>
                Đăng ký nghỉ phép
              </NavLink>
            </Menu.Item>

            <Menu.Item className="pl-custom-sidebar" key="work-confimation">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-xac-nhan-cong`}>
                Xác nhận công
              </NavLink>
            </Menu.Item>

            <Menu.Item className="pl-custom-sidebar" key="de-xuat">
              <NavLink onClick={toggleCollapsed} to={`${path}/de-xuat/danh-sach`}>
                Đề xuất
              </NavLink>
            </Menu.Item>
            <Menu.Item className="pl-custom-sidebar" key="bien-ban">
              <NavLink onClick={toggleCollapsed} to={`${path}/bien-ban/danh-sach`}>
                Biên bản
              </NavLink>
            </Menu.Item>
            <Menu.Item style={{ display: 'none' }} className="pl-custom-sidebar" key="exam-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-de`}>
                Kho đề
              </NavLink>
            </Menu.Item>
            <Menu.Item style={{ display: 'none' }} className="pl-custom-sidebar" key="document-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-ta-lieu`}>
                Kho tài liệu
              </NavLink>
            </Menu.Item>
            <Menu.Item style={{ display: 'none' }} className="pl-custom-sidebar" key="khoa-hoc-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-de`}>
                Khóa học
              </NavLink>
            </Menu.Item>
            <Menu.Item style={{ display: 'none' }} className="pl-custom-sidebar" key="exam-add">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/tao-de`}>
                Tạo đề
              </NavLink>
            </Menu.Item>
            {/*<Menu.Item key="nvu-home">*/}
            {/*  <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su`}>*/}
            {/*    Nhân sự*/}
            {/*  </NavLink>*/}
            {/*</Menu.Item>*/}
            {/*<Menu.Item key="nvu-department">*/}
            {/*  <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/phong-ban`}>*/}
            {/*    Phòng ban*/}
            {/*  </NavLink>*/}
            {/*</Menu.Item>*/}
            {/*<Menu.Item key="nvu-nhansu"> <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-nhanh-su`}> Nhân sự new </NavLink> </Menu.Item>*/}
            {/*<Menu*/}
            {/*  mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}*/}
            {/*  theme={darkMode ? 'dark' : 'light'}*/}
            {/*  openKeys={openKey}*/}
            {/*  onOpenChange={onOpenChanges}*/}
            {/*>*/}
            {/*  <SubMenu key="work-schedule" title=" - Chấm công">*/}
            {/*    <Menu.Item className='pl-custom-sidebar' key="store-works-chedule">*/}
            {/*      <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/dang-ki/lich-lam-viec`}>*/}
            {/*        Đăng kí lịch làm việc*/}
            {/*      </NavLink>*/}
            {/*    </Menu.Item>*/}

            {/*    <Menu.Item className='pl-custom-sidebar' key="works-chedule">*/}
            {/*      <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/lich-lam-viec`}>*/}
            {/*        Lịch làm việc*/}
            {/*      </NavLink>*/}
            {/*    </Menu.Item>*/}
            {/*  </SubMenu>*/}
            {/*</Menu>*/}
            {/*<Menu*/}
            {/*  mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}*/}
            {/*  theme={darkMode ? 'dark' : 'light'}*/}
            {/*  openKeys={openKey}*/}
            {/*  onOpenChange={onOpenChanges}*/}
            {/*>*/}
            {/*  <SubMenu key="exam" title=" - Quản lý đào tạo">*/}
            {/*    <Menu.Item className='pl-custom-sidebar' key="exam-list">*/}
            {/*      <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-de`}>*/}
            {/*        Danh sách đề*/}
            {/*      </NavLink>*/}
            {/*    </Menu.Item>*/}
            {/*    <Menu.Item className='pl-custom-sidebar'   key="exam-add">*/}
            {/*      <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/tao-de`}>*/}
            {/*        Tạo đề*/}
            {/*      </NavLink>*/}
            {/*    </Menu.Item>*/}
            {/*  </SubMenu>*/}
            {/*</Menu>*/}
          </SubMenu>

          <SubMenu
            key="daotao"
            icon={!topMenu && <FeatherIcon icon="file-plus" />}
            title={<span style={{ textTransform: 'uppercase' }}>Đào tạo</span>}
          >
            <Menu.Item className="pl-custom-sidebar" key="exam-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-de/1`}>
                Kho đề
              </NavLink>
            </Menu.Item>
            <Menu.Item className="pl-custom-sidebar" key="document-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-tai-lieu/2`}>
                Kho tài liệu
              </NavLink>
            </Menu.Item>
            <Menu.Item className="pl-custom-sidebar" key="khoa-hoc-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-de/3`}>
                Khóa học
              </NavLink>
            </Menu.Item>

            <Menu.Item className="pl-custom-sidebar" key="de-thi-list">
              <NavLink onClick={toggleCollapsed} to={`${path}/nhan-su/danh-sach-de/4`}>
                Đề thi
              </NavLink>
            </Menu.Item>
          </SubMenu>
          {/* Tuyển dụng   */}
          {/* Tuyển dụng */}
          <SubMenu
            style={{ display: 'none' }}
            key="tuyendung"
            icon={!topMenu && <FeatherIcon icon="home" />}
            title="TUYỂN DỤNG"
          >
            <Menu.Item className="pl-custom-sidebar" key="de-xuat">
              <NavLink onClick={toggleCollapsed} to={`${path}/tuyen-dung`}>
                Chỉ tiêu tuyển dụng
              </NavLink>
            </Menu.Item>
          </SubMenu>
          {/* end tuyển dụng   */}
          {/**/}
          {/* work */}

          <SubMenu key="work" icon={!topMenu && <FeatherIcon icon="briefcase" />} title="LÀM VIỆC">
            <Menu.Item key="inbox">
              <NavLink onClick={toggleCollapsed} to={`${path}/lam-viec`}>
                Tổng quan
              </NavLink>
            </Menu.Item>
            {listGroup?.length > 0 &&
              listGroup.map((group, index) => (
                <Menu.Item key={`group-${index}`}>
                  <NavLink onClick={toggleCollapsed} to={`${path}/lam-viec/nhom-lam-viec/${group?.group_id}`}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: group?.color,
                        display: 'inline-block',
                        marginRight: '10px',
                      }}
                    ></div>
                    {group?.group_name}
                  </NavLink>
                </Menu.Item>
              ))}
          </SubMenu>

          {/* novaup */}
          <SubMenu
            key="novaup"
            icon={!topMenu && <BsHouseUp size={16} />}
            title={<span style={{ textTransform: 'uppercase' }}>Novaup</span>}
          >
            <Menu.Item key="nvu-customer">
              <NavLink onClick={toggleCollapsed} to={`${path}/novaup/khach-hang`}>
                Khách hàng
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvu-status">
              <NavLink onClick={toggleCollapsed} to={`${path}/novaup/trang-thai`}>
                Trạng thái khách hàng
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvu-source">
              <NavLink onClick={toggleCollapsed} to={`${path}/novaup/nguon-khach-hang`}>
                Nguồn khách hàng
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvu-revenue">
              <NavLink onClick={toggleCollapsed} to={`${path}/novaup/doanh-thu`}>
                Doanh thu
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvu-room">
              <NavLink onClick={toggleCollapsed} to={`${path}/novaup/phong`}>
                Phòng
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvu-boking">
              <NavLink onClick={toggleCollapsed} to={`${path}/novaup/dat-phong/month`}>
                Đặt phòng
              </NavLink>
            </Menu.Item>
          </SubMenu>
          {/* end novaup   */}

          {/* novateen */}
          <SubMenu key="novateen" icon={!topMenu && <FeatherIcon icon="map-pin" />} title="NOVATEEN">
            <Menu.Item key="nvt-home">
              <NavLink onClick={toggleCollapsed} to={`${path}/novateen/khach-hang`}>
                Khách hàng
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvt-data">
              <NavLink onClick={toggleCollapsed} to={`${path}/novateen/data-import`}>
                Data import
              </NavLink>
            </Menu.Item>
            <Menu.Item key="nvt-bill">
              <NavLink onClick={toggleCollapsed} to={`${path}/novateen/doanh-thu`}>
                Doanh thu
              </NavLink>
            </Menu.Item>
            {/* cấu hình novateen */}
            <Menu
              mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
              theme={darkMode ? 'dark' : 'light'}
              openKeys={openKey}
              onOpenChange={onOpenChanges}
            >
              <SubMenu key="sales" title="Cấu hình" icon={<FeatherIcon icon="settings" />}>
                <Menu.Item key="nvt_sales-option1">
                  <NavLink onClick={toggleCollapsed} to={`${path}/novateen/trang-thai-data`}>
                    Trạng thái data
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="nvt_sales-option2">
                  <NavLink onClick={toggleCollapsed} to={`${path}/novateen/nguon-data`}>
                    Nguồn data
                  </NavLink>
                </Menu.Item>
              </SubMenu>
            </Menu>
          </SubMenu>
          {/* end novateen */}

          {/* Khách hàng */}
          <SubMenu key="customer" icon={!topMenu && <FeatherIcon icon="user-plus" />} title="KHÁCH HÀNG">
            <Menu.Item key="list-customer">
              <NavLink onClick={toggleCollapsed} to={`${path}/khach-hang/danh-sach`}>
                Danh sách
              </NavLink>
            </Menu.Item>
          </SubMenu>
          {/* end khách hàng   */}
          {/* quản lý kho */}
          <SubMenu key="depot" icon={!topMenu && <FaWarehouse size={16} />} title="KHO HÀNG">
            {roleUser && (
              <>
                {(roleUser.department_id === 8 || roleUser.role_id === 1) && (
                  // Hiển thị tất cả các mục nếu department_id === 8 hoặc role_id === 1
                  <>
                    <Menu.Item key="manager-product">
                      <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/san-pham`}>
                        Sản phẩm
                      </NavLink>
                    </Menu.Item>
                    <Menu.Item key="manager-ncc">
                      <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/nha-cung-cap`}>
                        Nhà cung cấp
                      </NavLink>
                    </Menu.Item>
                    <Menu.Item key="manager-agency">
                      <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/dai-ly`}>
                        Đại lý
                      </NavLink>
                    </Menu.Item>
                    <Menu.Item key="manager-sales">
                      <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/ban-hang`}>
                        Bán hàng
                      </NavLink>
                    </Menu.Item>
                    <Menu.Item key="manager-revenue">
                      <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/doanh-thu`}>
                        Doanh thu
                      </NavLink>
                    </Menu.Item>
                    <Menu.Item key="manager-turnover">
                      <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/loi-nhuan`}>
                        Lợi nhuận
                      </NavLink>
                    </Menu.Item>
                  </>
                )}
                {roleUser.department_id === 9 && (
                  // Hiển thị chỉ mục "Bán hàng" nếu department_id === 9
                  <Menu.Item key="manager-sales">
                    <NavLink onClick={toggleCollapsed} to={`${path}/aaifood/ban-hang`}>
                      Bán hàng
                    </NavLink>
                  </Menu.Item>
                )}
              </>
            )}
          </SubMenu>

          {/* end quản lý kho*/}
          <Menu.Item key="cdn" icon={<GrStorage size={16} />}>
            <NavLink to={`${path}/luu-tru/all`} style={{ textTransform: 'uppercase' }}>
              Lưu trữ
            </NavLink>
          </Menu.Item>
          <Menu.Item key="document" icon={<FaRegNewspaper size={16} />}>
            <NavLink to={`${path}/tai-lieu`} style={{ textTransform: 'uppercase' }}>
              Tài liệu
            </NavLink>
          </Menu.Item>
          {/**/}
        </>
      )}
    </Menu>
  );
}

MenuItems.propTypes = {
  darkMode: propTypes.bool,
  topMenu: propTypes.bool,
  toggleCollapsed: propTypes.func,
  events: propTypes.object,
};

export default MenuItems;
