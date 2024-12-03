import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const MainWord = lazy(() => import('../../container/work/MainWord'));
const ReportGroup = lazy(() => import('../../container/work/overView/Group/overViewGroup/ReportGroup'));
const Group = lazy(() => import('../../container/work/overView/Group/Group'));
const Task = lazy(() => import('../../container/work/overView/Task/Task'));

function WorkRouter() {
    const {path} = useRouteMatch();
    
    return (
        <Switch>
            <Route exact path={path} component={MainWord}/>
            <Route path={`${path}/nhom-lam-viec/:id`} component={Group}/>
            <Route path={`${path}/bao-cao/:id`} component={ReportGroup}/>
            <Route path={`${path}/du-an/:id`} component={Task}/>
        </Switch>
    );
}

export default WorkRouter;
