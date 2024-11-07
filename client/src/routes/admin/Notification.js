import {Route, Switch, useRouteMatch} from "react-router-dom";
import React from "react";
import MainNotification from "../../container/notification/MainNotification";

function NotificationRouter() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route exact path={path} component={MainNotification}/>
        </Switch>
    );
}

export default NotificationRouter;
