const actions = {
    SOCKET_CONNECT: 'SOCKET_CONNECT',
    ROLE_ID: 'ROLE_ID',
    LOGIN: 'LOGIN',

    socketConnectSuccess: (data) => {
        return {
            type: actions.SOCKET_CONNECT,
            data,
        };
    },
    roleId: (data) => {
        return {
            type: actions.ROLE_ID,
            data,
        };
    },
    login: (data) => {
        return {
            type: actions.LOGIN,
            data,
        };
    },

}
export default actions;