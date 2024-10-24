export const checkStatus = (status = 0) => {
    const arr = [{
        status: 'Đang chờ',
        color: '#ffc107'
    }, {
        status: 'Đang làm',
        color: '#1890ff'
    }, {
        status: 'Hoàn thành',
        color: '#52c41a'
    }]
    return arr[status];
}
export const checkRole = (value) => {
    const arr = ['admin', 'Tổng giám đốc', 'Giám đốc', 'Trưởng phòng', 'Nhân viên'];
    return arr[value - 1];
}