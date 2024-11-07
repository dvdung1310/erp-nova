import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const ProposeList = lazy(() => import('../../container/propose/ListPropose'));
function Propose() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/danh-sach`} component={ProposeList}/>
        </Switch>
    );
}

export default Propose;
