import actions from './actions';

const {socketConnectSuccess} = actions;

const socketConnect = (data) => {
    return async (dispatch) => {
        try {
            dispatch(socketConnectSuccess(data));
        } catch (err) {
            console.log(err);
        }
    };
};

const socketDisconnect = () => {
    return async (dispatch) => {
        try {
            dispatch(socketConnectSuccess(null));
        } catch (err) {
            console.log(err);
        }
    };
};

export {socketConnect, socketDisconnect};