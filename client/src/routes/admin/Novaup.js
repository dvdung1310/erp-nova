import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy, memo} from "react";

const Dashboard = lazy(() => import('../../container/Novaup'));
const StatusData = lazy(() => import('../../container/Novaup/StatusData'));
const DataSource = lazy(() => import('../../container/Novaup/DataSource'));
const Customer = lazy(() => import('../../container/Novaup/Customer'));
const Room = lazy(() => import('../../container/Novaup/Room'));

const NovaupRoutes = memo(() => {
    const {path} = useRouteMatch();
    console.log(path);
    return (
        <Switch>
            <Route exact path={path} component={Dashboard}/>
            <Route path={`${path}/status-data`} component={StatusData}/>
            <Route path={`${path}/data-source`} component={DataSource}/>
            <Route path={`${path}/customer`} component={Customer}/>
            <Route path={`${path}/room`} component={Room}/>
        </Switch>
    );
});

export default NovaupRoutes;