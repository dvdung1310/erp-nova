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
export const checkStatusProjectByTask = (completed_tasks, total_task) => {
    if (completed_tasks === 0) {
        return {
            status: 'Đang chờ',
            color: '#ed6c02'
        }
    } else if (completed_tasks === total_task) {
        return {
            status: 'Hoàn thành',
            color: '#2e7d32'
        }
    } else {
        return {
            status: 'Đang làm',
            color: '#0288d1'
        }
    }
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
export const checkReaction = (value) => {
    console.log(value)
    switch (value) {
        case 'like':
            return {
                icon: 'FaThumbsUp',
                color: '#1E90FF'
            }
        case 'love':
            return {
                icon: 'FaHeart',
                color: '#FF4500'
            }
        case 'haha':
            return {
                icon: 'FaLaugh',
                color: '#FFD700'
            }
        case 'wow':
            return {
                icon: 'FaSurprise',
                color: '#FF6347'
            }
        case 'sad':
            return {
                icon: 'FaSadTear',
                color: '#4682B4'
            }
        case 'angry':
            return {
                icon: 'FaAngry',
                color: '#DC143C'
            }
        default:
            return {
                icon: 'thumbs-up',
                color: '#1E90FF'
            }
    }
}