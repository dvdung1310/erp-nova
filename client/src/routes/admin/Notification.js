import {Route, Switch, useRouteMatch} from "react-router-dom";
import React from "react";
import MainNotification from "../../container/notification/MainNotification";
import NotificationDetail from "../../container/notification/NotificationDetail";

function NotificationRouter() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route exact path={path} component={MainNotification}/>
            <Route path={`${path}/chi-tiet/:id`} component={NotificationDetail}/>
        </Switch>
    );
}

export default NotificationRouter;
