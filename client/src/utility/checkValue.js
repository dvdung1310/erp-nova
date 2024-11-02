export const checkStatus = (status = 0) => {
    const arr = [{
        status: 'Đang chờ',
        color: '#ed6c02'
    }, {
        status: 'Đang làm',
        color: '#0288d1'
    }, {
        status: 'Hoàn thành',
        color: '#2e7d32'
    }, {
        status: 'Hoàn thành',
        color: '#2e7d32'
    }]
    return arr[status];
}
export const checkRole = (value) => {
    const arr = ['admin', 'Tổng giám đốc', 'Giám đốc', 'Trưởng phòng', 'Nhân viên'];
    return arr[value - 1];
}