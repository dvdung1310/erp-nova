import {Cards} from "../../../../../components/cards/frame/cards-frame";
import {BadgeWraperStyle} from "../../../../ui-elements/ui-elements-styled";
import {Badge, Col, DatePicker, Form, Modal, Row, Select} from "antd";
import {NavLink} from "react-router-dom";
import {ClockCircleOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {DatePickerWrapper, Main} from "../../../../styled";
import {ProjectHeader} from "../../Project/style";
import {PageHeader} from "../../../../../components/page-headers/page-headers";
import {Button} from "../../../../../components/buttons/buttons";
import FeatherIcon from "feather-icons-react";
import moment from "moment/moment";
import {getAllUsers} from "../../../../../apis/work/user";

moment.locale('vi');
const {RangePicker} = DatePicker;
const CalculatorKPI = () => {
    const [listUsers, setListUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDateCustom, setStartDateCustom] = useState(null);
    const [endDateCustom, setEndDateCustom] = useState(null);
    const [showModalCustomDate, setShowModalCustomDate] = useState(false);
    const fetchListUsers = async () => {
        try {
            const response = await getAllUsers();
            setListUsers(response.data);
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        fetchListUsers();
    }, []);
    const handleShowModalCustomDate = () => {
        setShowModalCustomDate(true);
    }
    const handleCloseModalCustomDate = () => {
        setShowModalCustomDate(false);
    }
    const handleOk = async () => {
        setShowModalCustomDate(false)
    }
    const handleSearchKpi = () => {
        console.log(selectedUser, startDate, endDate);
    }
    return (
        <div className='calculator'>
            <ProjectHeader>
                <PageHeader
                    ghost
                    title='Tính KPI nhân viên'
                    buttons={[
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <Select
                                defaultValue="all"
                                style={{width: 200}}
                                onChange={(value) => {
                                    const formatDate = (date, hours, minutes, seconds) => {
                                        date.setHours(hours, minutes, seconds, 0);
                                        return date.toLocaleString('en-CA', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }).replace(',', '');
                                    };

                                    if (value === "all") {
                                        setStartDate(null);
                                        setEndDate(null);
                                    } else if (value === "today") {
                                        const today = new Date();
                                        setStartDate(formatDate(today, 1, 0, 0)); // 1:00 AM
                                        setEndDate(formatDate(today, 23, 0, 0)); // 11:00 PM
                                    } else if (value === "week") {
                                        const today = new Date();
                                        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
                                        const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7)); // Sunday
                                        setStartDate(formatDate(firstDayOfWeek, 1, 0, 0)); // 1:00 AM
                                        setEndDate(formatDate(lastDayOfWeek, 23, 0, 0)); // 11:00 PM
                                    } else if (value === "month") {
                                        const today = new Date();
                                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month
                                        setStartDate(formatDate(firstDayOfMonth, 1, 0, 0)); // 1:00 AM
                                        setEndDate(formatDate(lastDayOfMonth, 23, 0, 0)); // 11:00 PM
                                    } else if (value === "year") {
                                        const today = new Date();
                                        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                                        const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // Last day of the year
                                        setStartDate(formatDate(firstDayOfYear, 1, 0, 0)); // 1:00 AM
                                        setEndDate(formatDate(lastDayOfYear, 23, 0, 0)); // 11:00 PM
                                    } else if (value === "custom") {
                                        handleShowModalCustomDate();
                                    }
                                }}
                                options={[
                                    {label: "Thời gian", value: "all"},
                                    {label: "Hôm nay", value: "today"},
                                    {label: "Tuần này", value: "week"},
                                    {label: "Tháng này", value: "month"},
                                    {label: "Năm nay", value: "year"},
                                    {label: "Tuỳ chỉnh", value: "custom"},
                                ]}
                            />
                            <Select
                                showSearch
                                placeholder="Chọn nhân viên"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
                                }
                                style={{width: 300}}
                                onChange={(value) => {
                                    setSelectedUser(value);
                                }}
                            >
                                {
                                    listUsers && listUsers?.map((user, index) => (
                                        <Select.Option key={index} value={user.id}>
                                            {`${user?.name} (${user?.department_name})`}
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                            <Button
                                type="primary"
                                onClick={handleSearchKpi}
                            >
                                <FeatherIcon icon="search" size={14}/> Tìm kiếm
                            </Button>
                        </div>
                    ]}
                />
            </ProjectHeader>
            <Main>
                <Row gutter={25}>
                    <Col md={12} sm={12} xs={24}>
                        <Cards title="Basic">
                            <BadgeWraperStyle>
                                <Badge count={5}>
                                    <NavLink to="#" className="head-example"/>
                                </Badge>
                                <Badge count={0} showZero>
                                    <NavLink to="#" className="head-example"/>
                                </Badge>
                                <Badge count={<ClockCircleOutlined style={{color: '#f5222d'}}/>}>
                                    <NavLink to="#" className="head-example"/>
                                </Badge>
                            </BadgeWraperStyle>
                        </Cards>
                    </Col>
                </Row>
            </Main>
            {/*    modal custom date*/}
            <Modal
                visible={showModalCustomDate}
                open={showModalCustomDate}
                title="Chọn ngày"
                onOk={handleOk}
                onCancel={handleCloseModalCustomDate}
            >
                <div>
                    <DatePickerWrapper>
                        <RangePicker
                            ranges={{
                                'Hôm nay': [moment(), moment()],
                                'Tuần này': [moment().startOf('week'), moment().endOf('week')],
                                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                                'Năm nay': [moment().startOf('year'), moment().endOf('year')],
                            }}
                            format="DD-MM-YY"
                            onChange={(dates) => {
                                if (dates) {
                                    setStartDateCustom(dates[0].format('YYYY-MM-DD 01:00:00'));
                                    setEndDateCustom(dates[1].format('YYYY-MM-DD 23:00:00'));
                                } else {
                                    setStartDateCustom(null);
                                    setEndDateCustom(null);
                                }
                            }}
                            value={[startDateCustom ? moment(startDateCustom) : null, endDateCustom ? moment(endDateCustom) : null]}


                        />
                    </DatePickerWrapper>
                </div>


            </Modal>
        </div>
    );
}
export default CalculatorKPI;