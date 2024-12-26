export const checkStatus = (status = 0) => {
    const arr = [{
        status: 'Đang chờ',
        color: '#ed6c02'
    }, {
        status: 'Đang làm',
        color: '#0288d1'
    }, {
        status: 'Chờ xác nhận',
        color: '#40a341'
    }, {
        status: 'Hoàn thành',
        color: '#2e7d32'
    }, {
        status: 'Tạm dừng',
        color: '#607d8b'
    }]
    return arr[status];
}
export const checkStatusProject = (status = 0) => {
    const arr = [{
        status: 'Đang chờ',
        color: '#ed6c02'
    }, {
        status: 'Đang làm',
        color: '#0288d1'
    }, {
        status: 'Hoàn thành',
        color: '#2e7d32'
    }]
    return arr[status];
}
export const checkPriority = (priority = 0) => {
    const arr = [{
        status: 'Thấp',
        color: '#03c30b'
    }, {
        status: 'Trung bình',
        color: '#ff9800'
    }, {
        status: 'Cao',
        color: '#ff0000'
    }]
    return arr[priority];
}
export const checkRole = (value) => {
    const arr = ['admin', 'Tổng giám đốc', 'Giám đốc', 'Trưởng phòng', 'Nhân viên'];
    return arr[value - 1];
}