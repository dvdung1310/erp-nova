import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const Dashboard = lazy(() => import('../../container/Novaup'));
 const StatusData = lazy(() => import('../../container/Novaup/StatusData'));

function NovaupRoutes() {
    const {path} = useRouteMatch();
    console.log(path);
    return (
        <Switch>
            <Route exact path={path} component={Dashboard}/>
            <Route path={`${path}/status-data`} component={StatusData}/>
        </Switch>
    );
}

export default NovaupRoutes;