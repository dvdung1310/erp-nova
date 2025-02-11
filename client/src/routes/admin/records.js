import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const ListRecords = lazy(() => import('../../container/records/ListRecords'));
const DetailRecords = lazy(() => import('../../container/records/DetailRecords'));

function Records() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/danh-sach`} component={ListRecords}/>
            <Route path={`${path}/chi-tiet/:id`} component={DetailRecords}/>
        </Switch>
    );
}

export default Records;
