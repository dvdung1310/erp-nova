import initialState from '../../demoData/usersData.json';
import initialStateGroup from '../../demoData/usersGroupData.json';
import actions from "./actions";

const initialStateSocket = {
    socketConnection: null,
}
const userReducer = (state = initialState) => {
    return state;
};

const userGroupReducer = (state = initialStateGroup) => {
    return state;
};

const userReducerSocket = (state = initialStateSocket, action) => {
    const {type, data} = action;
    switch (type) {
        case actions.SOCKET_CONNECT:
            return {
                ...state,
                socketConnection: data,
            };
        case actions.SOCKET_DISCONNECT:
            return {
                ...state,
                socketConnection: data,
            };
        default:
            return state;
    }

}
export {userReducer, userGroupReducer, userReducerSocket};
