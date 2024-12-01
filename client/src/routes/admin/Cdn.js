import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const dashboaed = lazy(() => import('../../container/cdn/index'));
const folderDetail = lazy(() => import('../../container/cdn/overview/folder_detail'));
function WorkRouter() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route  path={`${path}`} component={dashboaed}/>
        
        </Switch>
    );
}

export default WorkRouter;
