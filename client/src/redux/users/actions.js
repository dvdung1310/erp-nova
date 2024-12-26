const actions = {
    SOCKET_CONNECT: 'SOCKET_CONNECT',
    ROLE_ID: 'ROLE_ID',

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

}
export default actions;