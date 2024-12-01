import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const MainWord = lazy(() => import('../../container/work/MainWord'));
const Project = lazy(() => import('../../container/work/overView/Project/Project'));
const Group = lazy(() => import('../../container/work/overView/Group/Group'));
const Task = lazy(() => import('../../container/work/overView/Task/Task'));

function WorkRouter() {
    const {path} = useRouteMatch();
    
    return (
        <Switch>
            <Route exact path={path} component={MainWord}/>
            <Route path={`${path}/nhom-lam-viec/:id`} component={Group}/>
            <Route path={`${path}/du-an/:id`} component={Task}/>
        </Switch>
    );
}

export default WorkRouter;
