import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy, memo} from "react";

const Document = lazy(() => import('../../container/document/index'));
const createDocument = lazy(() => import('../../container/document/create_document'));
const detailDocument = lazy(() => import('../../container/document/document_detail'));
const editDocument = lazy(() => import('../../container/document/edit_document'));
const NovaupRoutes = memo(() => {
    const {path} = useRouteMatch();
    console.log(path);
    return (
        <Switch>
            <Route exact path={path} component={Document}/>
            <Route path={`${path}/tao-tai-lieu`} component={createDocument} />
            <Route path={`${path}/chi-tiet/:id`} component={detailDocument} />
            <Route path={`${path}/sua-tai-lieu/:id`} component={editDocument} />
        </Switch>
    );
});

export default NovaupRoutes;