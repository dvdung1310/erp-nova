import actions from './actions';

const {socketConnectSuccess, roleId, login} = actions;

const socketConnect = (data) => {
    return async (dispatch) => {
        try {
            dispatch(socketConnectSuccess(data));
        } catch (err) {
            console.log(err);
        }
    };
};
const setRoleId = (data) => {
    return async (dispatch) => {
        try {
            dispatch(roleId(data));
        } catch (err) {
            console.log(err);
        }
    };
}
const setUserLogin = (data) => {
    return async (dispatch) => {
        try {
            dispatch(login(data));
        } catch (err) {
            console.log(err);
        }
    };
}
const socketDisconnect = () => {
    return async (dispatch) => {
        try {
            dispatch(socketConnectSuccess(null));
        } catch (err) {
            console.log(err);
        }
    };
};

export {socketConnect, socketDisconnect, setRoleId, setUserLogin};