const express = require('express');
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const webpush = require('web-push');
const http = require('http');
const {Server} = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

//soket
const clients = {};
io.on('connection', async (socket) => {
    console.log('Người dùng kết nối:', socket.id);
    const userId = socket.handshake.auth.user_id;
    socket.join(userId);
    clients[userId] = socket.id;
    socket.on('view-notification', (data) => {
        if (clients[data.user_id]) {
            io.to(clients[data.user_id]).emit('view-notification', data);
        }
    })
    // Khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Người dùng ngắt kết nối', socket.id);
    });
});
// app use
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors({
    origin: "*"
}));
const CLIENT_URL = process.env.CLIENT_URL;
// vapid key
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);

const publicVapidKey = 'BFRuISHeTPNFMZv_7-PndFq72gEqCd8tvf1YX7mTYyuXkOa3vdBxtvzxaj3B1B8AsYy0rG1Mg4DsFS51glqBFSM';
const privateVapidKey = 'KVI4U3_fZMmKSZyP2zD0FKICW6pEIAnHralKjqthxzE';
webpush.setVapidDetails('mailto:datkt.novaedu@gmail.com', publicVapidKey, privateVapidKey);
// router
const sendNotificationSocket = (createByUserName, notification, members, createByUserId,) => {
    const newNotification = {
        ...notification,
        createByUserName
    }
    return members
        .filter(userId => userId !== createByUserId)
        .forEach(userId => {
            if (clients[userId]) {
                io.to(clients[userId]).emit('notification', newNotification);
            }
        });
}
const sendNotificationWarning = (user_id, notification) => {
    if (clients[user_id]) {
        io.to(clients[user_id]).emit('notification-warning', notification);
    }
}
const sendNotificationAaiFood = (createByUserName, notification, members, createByUserId,) => {
    const newNotification = {
        ...notification,
        createByUserName
    }
    return members
        .filter(userId => userId !== createByUserId)
        .forEach(userId => {
            if (clients[userId]) {
                io.to(clients[userId]).emit('notification-aaifood', newNotification);
            }
        });
}

//group
app.post('/change-group', (req, res) => {
    try {
        io.emit('change-group', {
            message: "Change group success"
        });
        res.status(200).json({
            message: "Change group success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
//user.js
app.post('/update-profile', (req, res) => {
    try {
        const {user, user_id} = req.body;
        io.to(clients[user_id]).emit('update-profile', user);
        res.status(200).json({
            message: "Update avatar success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
// project
app.post('/update-name-project', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, projectName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật tên dự án: ${projectName}`,
            data: {url: `${CLIENT_URL}${pathname}`}
        });

        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);

        // Gửi thông báo đến các thiết bị
        const promises = devices.map(subscription =>
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                throw new Error("Lỗi khi gửi thông báo");
            })
        );

        Promise.all(promises)
            .then(() => res.status(200).json({message: "Update project success"}))
            .catch(error => res.status(500).json({message: error.message}));
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
    }
});

app.post('/update-status-project', (req, res) => {
    try {
        const {
            devices, createByUserName, notification, statusMessage, createByUserId, projectName, pathname, members
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật trạng thái của dự án: ${projectName} (${statusMessage})`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update project success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-start-date-project', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, projectName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật ngày bắt đầu của dự án: ${projectName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update project success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-end-date-project', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, projectName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật ngày kết thúc của dự án: ${projectName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update project success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-remove-members-project', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, projectName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã xóa bạn khỏi dự án: ${projectName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update project success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-add-members-project', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, projectName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã thêm bạn vào dự án: ${projectName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update project success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-leader-project', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, projectName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} thêm bạn làm người phụ trách của dự án: ${projectName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "Update project success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
// task
app.post('/update-name-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới', body: `${createByUserName} Đã cập nhật tên công việc: ${taskName}`, data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-score-kpi-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới', body: `${createByUserName} Đã cập nhật điểm kpi công việc: ${taskName}`, data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-progress-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới', body: `${createByUserName} Đã cập nhật tiến độ công việc: ${taskName}`, data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})

app.post('/update-description-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới', body: `${createByUserName} Đã cập nhật mô tả công việc: ${taskName}`, data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-add-members-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã thêm bạn vào công việc: ${taskName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-remove-members-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã xóa bạn khỏi công việc: ${taskName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-start-date-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật ngày bắt đầu của công việc: ${taskName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-end-date-task', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, taskName, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật ngày kết thúc của công việc: ${taskName}`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/update-status-task', (req, res) => {
    try {
        const {
            devices, createByUserName, notification, statusMessage, createByUserId, taskName, pathname, members
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã cập nhật trạng thái của công việc: ${taskName} (${statusMessage})`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Update task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/create-comment-task', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            content,
            createByUserId,
            taskName,
            pathname,
            members
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã thêm bình luận công việc: ${taskName} "${content}" `,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({
            message: "Create comment task success"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
})
app.post('/check-dateline-task', (req, res) => {
    try {
        const {
            user_id,
            content,
            devices,
            pathname,
            notification
        } = req.body;
        // Gửi thông báo đến các client
        sendNotificationWarning(user_id, notification);
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: content,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        const promises = devices.map(subscription => {
            if (subscription && subscription.endpoint) {
                return webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        throw new Error("Lỗi khi gửi thông báo");
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                throw new Error("Subscription is missing an endpoint");
            }
        });

        Promise.all(promises)
            .then(() => res.status(200).json({message: "Check dateline task success"}))
            .catch(error => res.status(500).json({message: error.message}));
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi gửi thông báo"
        });
        console.log(error);
    }
});
//employee
app.post('/new-day-off', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            createByUserId,
            pathname,
            members
        } = req.body;
        console.log(req.body)
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã gửi một đề xuất nghỉ phép`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "New day off success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
app.post('/new-work-confirmation', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            createByUserId,
            pathname,
            members
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã gửi một đề xuất xác nhận công`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "New work confirmation success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
app.post('/new-proposals', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            createByUserId,
            pathname,
            members
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã gửi một đề xuất mới`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "New proposals success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
app.post('/update-work-confirmation', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            createByUserId,
            pathname,
            members,
            statusMessage
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã xem xét đề xuất xác nhận công của bạn (${statusMessage})`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "Update work confirmation success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
app.post('/update-proposals', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            createByUserId,
            pathname,
            members,
            statusMessage
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã xem xét đề xuất của bạn (${statusMessage})`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "Update proposals success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
app.post('/update-day-off', (req, res) => {
    try {
        const {
            devices,
            createByUserName,
            notification,
            createByUserId,
            pathname,
            members,
            statusMessage
        } = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã xem xét đề xuất nghỉ phép của bạn (${statusMessage})`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "Update day off success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
// notification
app.post('/create-notification-all', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, pathname, members} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: `${createByUserName} Đã tạo thông báo mới`,
            data: {
                url: `${CLIENT_URL}${pathname}`
            }
        });
        // Gửi thông báo đến các client
        sendNotificationSocket(createByUserName, notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            if (subscription && subscription.endpoint) {
                webpush.sendNotification(subscription, payload)
                    .catch(error => {
                        console.error('Lỗi khi gửi thông báo:', error);
                        res.status(500).json({message: "Lỗi khi gửi thông báo"});
                    });
            } else {
                console.error('Lỗi khi gửi thông báo: Subscription is missing an endpoint.');
                res.status(400).json({message: "Subscription is missing an endpoint"});
            }
        });
        res.status(200).json({message: "Create notification success"});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
        console.log(error);
    }
})
//aaifood
app.post('/aaifood-new-order-confirm', (req, res) => {
    try {
        const {devices, createByUserName, notification, createByUserId, pathname, members, content} = req.body;
        const payload = JSON.stringify({
            title: 'THông báo mới',
            body: content,
            data: {url: `${CLIENT_URL}${pathname}`}
        });

        // Gửi thông báo đến các client
        sendNotificationAaiFood(createByUserName, notification, members, createByUserId);

        // Gửi thông báo đến các thiết bị
        const promises = devices.map(subscription =>
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                throw new Error("Lỗi khi gửi thông báo");
            })
        );

        Promise.all(promises)
            .then(() => res.status(200).json({message: "Update project success"}))
            .catch(error => res.status(500).json({message: error.message}));
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Lỗi khi gửi thông báo"});
    }
});

// define route
app.get('/', (req, res) => {
    res.send(`
   <h1 style="text-align: center;font-family: sans-serif; font-weight: 400; font-size: 18px; margin-top: 20px;">
                Hello world
   </h1>
    `);
})
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
})

