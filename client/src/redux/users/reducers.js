import initialState from '../../demoData/usersData.json';
import initialStateGroup from '../../demoData/usersGroupData.json';
import actions from "./actions";

const initialStateSocket = {
    socketConnection: null,
}
const initialStateRole = {
    role_id: null,
}
const initialStateLogin = {
    id: '',
    name: '',
    email: '',
    phone: '',
    avatar: ''
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
const userReducerRole = (state = initialStateRole, action) => {
    const {type, data} = action;
    switch (type) {
        case actions.ROLE_ID:
            return {
                ...state,
                role_id: data,
            };
        default:
            return state;
    }
};
const userLogin = (state = initialStateLogin, action) => {
    const {type, data} = action;
    switch (type) {
        case actions.LOGIN:
            return {
                ...state,
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                avatar: data.avatar
            };
        default:
            return state;
    }
}
export {userReducer, userGroupReducer, userReducerSocket, userReducerRole, userLogin};
