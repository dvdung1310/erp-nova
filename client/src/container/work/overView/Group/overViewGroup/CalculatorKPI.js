import {Cards} from "../../../../../components/cards/frame/cards-frame";
import {
    Badge,
    Table,
    Typography,
    Space,
    Col,
    DatePicker,
    Descriptions,
    Form,
    Modal,
    Row,
    Select,
    Spin,
    Card, Divider, Input, InputNumber
} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {DatePickerWrapper, Main} from "../../../../styled";
import {ProjectHeader} from "../../Project/style";
import {PageHeader} from "../../../../../components/page-headers/page-headers";
import {Button} from "../../../../../components/buttons/buttons";
import FeatherIcon from "feather-icons-react";
import moment from "moment/moment";
import {getAllUsers, getUserKpi} from "../../../../../apis/work/user";
import {toast} from "react-toastify";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {Popover} from "../../../../../components/popup/popup";
import {NavLink} from "react-router-dom";
import './printStyles.scss';
import {getItem} from "../../../../../utility/localStorageControl";
import {useReactToPrint} from 'react-to-print';
import {PDFDocument, rgb} from 'pdf-lib';

const {Text, Title} = Typography;
moment.locale('vi');
const {RangePicker} = DatePicker;
const CalculatorKPI = () => {
    const user_id = getItem('user_id');
    const pdfRef = useRef(null);
    const printRef = useRef(null);
    const [listUsers, setListUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(user_id);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [userKpi, setUserKpi] = useState(null);
    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD 01:00:00'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD 23:00:00'));
    const [showModalCustomDate, setShowModalCustomDate] = useState(false);
    const fetchListUsers = async () => {
        try {
            setLoading(true)
            const [listUser] = await Promise.all([getAllUsers()]);
            setListUsers(listUser.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('Có lỗi xảy ra khi lấy dữ liệu');
            console.error(error);
        }
    }
    const fetchUserKpi = async (user_id, startDate, endDate) => {
        try {
            setLoading(true)
            const payload = {
                startDate,
                endDate
            }
            const userKpi = await getUserKpi(user_id, payload);
            setUserKpi(userKpi.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('Có lỗi xảy ra khi lấy dữ liệu');
            console.error(error);
        }
    }
    useEffect(() => {
        fetchListUsers();
        fetchUserKpi(user_id, startDate, endDate);
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
        fetchUserKpi(selectedUser, startDate, endDate);
    }
    /* eslint-disable new-cap */


    const downloadPDF = async () => {
        setLoadingDownload(true);
        const input = printRef.current;

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                scrollX: -window.scrollX,
                scrollY: -window.scrollY,
            });

            const pdfDoc = await PDFDocument.create();
            await createMultiPagePDF(canvas, pdfDoc);
            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes], {type: 'application/pdf'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'kpi.pdf';
            link.click();

            setLoadingDownload(false);
        } catch (error) {
            console.error(error);
            setLoadingDownload(false);
        }
    };

    const createMultiPagePDF = async (canvas, pdfDoc) => {
        const imgWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const canvasHeight = canvas.height;
        const canvasWidth = canvas.width;

        let position = 0;
        let remainingHeight = canvasHeight;
        const promises = [];

        while (remainingHeight > 0) {
            const page = pdfDoc.addPage([imgWidth, pageHeight]);
            const canvasPage = document.createElement('canvas');
            canvasPage.width = canvasWidth;
            canvasPage.height = Math.min(canvasHeight, (pageHeight * canvasWidth) / imgWidth);

            const ctx = canvasPage.getContext('2d');
            ctx.drawImage(
                canvas,
                0, position, canvasWidth, canvasPage.height,
                0, 0, canvasPage.width, canvasPage.height
            );

            const imgData = canvasPage.toDataURL('image/jpeg', 0.8);
            promises.push(pdfDoc.embedJpg(imgData).then(img => {
                page.drawImage(img, {
                    x: 0,
                    y: pageHeight - (canvasPage.height * imgWidth) / canvasWidth,
                    width: imgWidth,
                    height: (canvasPage.height * imgWidth) / canvasWidth,
                });
            }));

            remainingHeight -= canvasPage.height;
            position += canvasPage.height;
        }

        await Promise.all(promises);
    };
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `KPI_${userKpi?.employee?.employee_name}_${moment().format('DD-MM-YYYY')}`,
    });

    // content
    const content = (
        <>
            <NavLink to="#" onClick={handlePrint}>
                <FeatherIcon size={16} icon="printer"/>
                <span>In</span>
            </NavLink>
            {/*<NavLink to="#" onClick={downloadPDF}>*/}
            {/*    <FeatherIcon size={16} icon="book-open"/>*/}
            {/*    <span>Xuất PDF</span>*/}
            {/*    {*/}
            {/*        loadingDownload && <Spin style={{marginLeft: '5px'}}/>*/}
            {/*    }*/}
            {/*</NavLink>*/}
        </>
    );
    const columnsRecord = [
        {
            title: 'Tên biên bản',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Điểm KPI bị trừ',
            dataIndex: 'value',
            key: 'value',
            render: (value) => (
                <div>
                    {value} (Điểm)
                </div>
            )
        },
    ];

    const dataRecord = [
        {
            key: '1',
            name: 'Biên bản mức 1',
            quantity: userKpi?.record?.totalRecordLevelOne,
            value: userKpi?.record?.totalRecordLevelOne * 1
        },
        {
            key: '2',
            name: 'Biên bản mức 2',
            quantity: userKpi?.record?.totalRecordLevelTwo,
            value: userKpi?.record?.totalRecordLevelTwo * 2
        },
        {
            key: '3',
            name: 'Biên bản mức 3',
            quantity: userKpi?.record?.totalRecordLevelThree,
            value: userKpi?.record?.totalRecordLevelThree * 3
        },
        {
            key: '4',
            name: 'Biên bản mức 4',
            quantity: userKpi?.record?.totalRecordLevelFour,
            value: userKpi?.record?.totalRecordLevelFour * 4
        },
    ];
    const columns = [
        {
            title: 'Tiêu chuẩn',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Điểm KPI bị trừ',
            dataIndex: 'value',
            key: 'value',
            render: () => (
                <div>
                    <InputNumber min={0} max={20}/>
                </div>
            )
        },
        {
            title: 'Ghi chú',
            dataIndex: 'comment',
            key: 'comment',
            render: () => (
                <div>
                    <Input/>
                </div>
            )
        },

    ];
    const data = [
        {
            key: '1',
            name: 'Giờ giấc làm việc',
        },
        {
            key: '2',
            name: 'Nội quy công ty',
        },
    ];
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
                                defaultValue="month"
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

                                defaultValue={user_id}
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
                            <Popover placement="bottomLeft" content={content} action='click' trigger="click">
                                <Button size="small" type="secondary">
                                    <FeatherIcon icon="download" size={14}/>
                                </Button>
                            </Popover>
                        </div>
                    ]}
                />
            </ProjectHeader>
            {
                loading ? <div className='spin'><Spin/></div> :
                    <Main style={{background: '#fff'}} className='print' ref={pdfRef}>
                        <Row gutter={25} ref={printRef} className='print-container'>
                            <Col md={24} sm={24} xs={0}>
                                <Card bordered={false} className="report-header">
                                    <div className="header-content">
                                        <div className="logo-container">
                                            <img src="/logo-aai.png" alt="Logo" className="logo"/>
                                            <img src="/logo_ver_new.png" alt="Logo" className="logo"/>
                                        </div>
                                        <div className='header-text'>
                                            <Title level={4}>Cộng hòa xã hội chủ nghĩa Việt Nam</Title>
                                            <Text>Độc lập - Tự do - Hạnh phúc</Text>
                                        </div>
                                    </div>
                                    <Title level={3} className="report-title">
                                        Kết quả công việc theo tháng
                                        <div className="report-date">
                                            <span>(Từ ngày {startDate ? moment(startDate).format('DD/MM/YYYY') : 'Toàn thời gian'}</span>
                                            <span> - Đến ngày {endDate ? moment(endDate).format('DD/MM/YYYY') : 'Toàn thời gian'})</span>
                                        </div>
                                    </Title>
                                </Card>
                            </Col>
                            <Col md={24} sm={24} xs={24} className='card-info'>
                                <Cards title="Thông tin nhân viên" headStyle={{fontSize: '24px', textAlign: 'left'}}
                                       className="employee-info">
                                    <div>
                                        <Row>
                                            <Col span={8}>
                                                <div className="info-item">
                                                    <div className="info-detail">
                                                        <strong>Tên nhân
                                                            viên:</strong> {userKpi?.employee?.employee_name}
                                                    </div>
                                                    <div className="info-detail">
                                                        <strong>Mã nhân viên:</strong> {userKpi?.employee?.employee_id}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col span={8} className="info-item">
                                                <div>
                                                    <div className="info-detail">
                                                        <strong>Phòng ban:</strong> {userKpi?.employee?.department_name}
                                                    </div>
                                                    <div className="info-detail">
                                                        <strong>Chức vụ:</strong> {userKpi?.employee?.level_name}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col span={8}>
                                                <div className="info-item">
                                                    <div className="info-detail">
                                                        <strong>Email:</strong> {userKpi?.employee?.employee_email}
                                                    </div>
                                                    <div className="info-detail">
                                                        <strong>Số điện
                                                            thoại:</strong> {userKpi?.employee?.employee_phone}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Cards>
                            </Col>
                            <Col md={24} sm={24} xs={24} className='card-kpi'>
                                <Cards title="KPI công việc" className="kpi-work"
                                       headStyle={{fontSize: '24px', textAlign: 'left'}}>
                                    <Typography.Title level={4} className="kpi-title">
                                        Tổng điểm KPI hoàn thành công việc:
                                        <Typography.Text
                                            className="kpi-score"> {userKpi?.totalScoreKpiTaskDone} (Điểm)</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={5} className="kpi-detail">
                                        - Tổng số dự án tham gia:
                                        <Typography.Text
                                            className="kpi-detail-value"> {userKpi?.totalProject}</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={5} className="kpi-detail">
                                        - Tổng số công việc tham gia:
                                        <Typography.Text
                                            className="kpi-detail-value"> {userKpi?.totalTask}</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={5} className="kpi-detail">
                                        - Tổng số công việc (leader xác nhận hoàn thành):
                                        <Typography.Text
                                            className="kpi-detail-value"> {userKpi?.totalTaskDone}</Typography.Text>
                                    </Typography.Title>
                                </Cards>
                                <Cards title="KPI tuân thủ nội quy" className="kpi-compliance"
                                       headStyle={{fontSize: '24px', textAlign: 'left'}}>
                                    <Typography.Title level={4} className="kpi-title">
                                        1.Tổng điểm KPI tuân thủ nội quy:
                                        <Typography.Text className="kpi-score"> 20 (Điểm)</Typography.Text>
                                    </Typography.Title>
                                    <Typography.Title level={4} className="kpi-title">
                                        2.Số lượng biên bản
                                    </Typography.Title>
                                    <Table
                                        columns={columnsRecord}
                                        dataSource={dataRecord}
                                        pagination={false}
                                        bordered
                                        className="kpi-table"
                                    />
                                </Cards>
                                <Typography.Title level={4} className="kpi-total">
                                    Tổng số điểm KPI còn lại:
                                    <Typography.Text
                                        className="kpi-score"> {userKpi?.totalScoreKpiRemaining} (Điểm)</Typography.Text>
                                </Typography.Title>
                            </Col>
                            <Col md={24} sm={24} xs={24}>
                                <Row className="signature-section">
                                    <Col span={6}>
                                        <div className="signature-box">
                                            <div className="signature-title">Kế toán</div>
                                            <span className="signature-note">(Ký và ghi rõ họ tên)</span>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div className="signature-box">
                                            <div className="signature-title">Trưởng phòng</div>
                                            <span className="signature-note">(Ký và ghi rõ họ tên)</span>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div className="signature-box">
                                            <div className="signature-title">HCNS</div>
                                            <span className="signature-note">(Ký và ghi rõ họ tên)</span>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div className="signature-box">
                                            <div className="signature-title">Nhân viên</div>
                                            <span className="signature-note">(Ký và ghi rõ họ tên)</span>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Main>
            }

            {/*modal custom date*/}
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
                                    setStartDate(dates[0].format('YYYY-MM-DD 01:00:00'));
                                    setEndDate(dates[1].format('YYYY-MM-DD 23:00:00'));
                                } else {
                                    setStartDate(null);
                                    setEndDate(null);
                                }
                            }}
                            value={[startDate ? moment(startDate) : null, endDate ? moment(endDate) : null]}
                        />
                    </DatePickerWrapper>
                </div>


            </Modal>
        </div>
    )
        ;
}
export default CalculatorKPI;