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
    // Khi client đăng ký nhận thông báo
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
const sendNotificationSocket = (notification, members, createByUserId) => {
    return members
        .filter(userId => userId !== createByUserId)
        .forEach(userId => {
            if (clients[userId]) {
                io.to(clients[userId]).emit('notification', notification);
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
app.post('/update-avatar', (req, res) => {
    try {
        const {avatar, user_id} = req.body;
        io.to(clients[user_id]).emit('update-avatar', avatar);
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
        sendNotificationSocket(notification, members, createByUserId);

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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({message: "Lỗi khi gửi thông báo"});
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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
        sendNotificationSocket(notification, members, createByUserId);
        // Gửi thông báo đến các thiết bị
        devices.forEach(subscription => {
            webpush.sendNotification(subscription, payload).catch(error => {
                console.error('Lỗi khi gửi thông báo:', error);
                res.status(500).json({
                    message: "Lỗi khi gửi thông báo"
                });
            });
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

