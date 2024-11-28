import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy, memo} from "react";

const Dashboard = lazy(() => import('../../container/Customer'));
const ListCustomer = lazy(() => import('../../container/Customer'));

const NovaupRoutes = memo(() => {
    const {path} = useRouteMatch();
    console.log(path);
    return (
        <Switch>
            <Route exact path={path} component={Dashboard}/>
            <Route path={`${path}/danh-sach`} component={ListCustomer}/>
        </Switch>
    );
});

export default NovaupRoutes;