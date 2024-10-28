import { Route, Switch, useRouteMatch } from "react-router-dom";
import React, { lazy } from "react";

const Dashboard = lazy(() => import('../../container/employees/recruit/Recruit_target'));
const RecruiTarget = lazy(() => import('../../container/employees/recruit/Recruit_news'));
const RecruitCandidates = lazy(() => import('../../container/employees/recruit/Recruit_candidates'));

function RecruitRouter() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route exact path={path} component={Dashboard} />
            <Route path={`${path}/tin-tuyen-dung/:target_id`} component={RecruiTarget} />
            <Route path={`${path}/ung-vien/:news_id`} component={RecruitCandidates} />
        </Switch>
    );
}

export default RecruitRouter;
