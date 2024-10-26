import { Route, Switch, useRouteMatch } from "react-router-dom";
import React, { lazy } from "react";

const Dashboard = lazy(() => import('../../container/employees/recruit/Recrui_target'));

function RecruitRouter() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route exact path={path} component={Dashboard} />
        </Switch>
    );
}

export default RecruitRouter;
