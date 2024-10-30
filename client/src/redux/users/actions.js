const actions = {
    SOCKET_CONNECT: 'SOCKET_CONNECT',

    socketConnectSuccess: (data) => {
        return {
            type: actions.SOCKET_CONNECT,
            data,
        };
    },

}
export default actions;