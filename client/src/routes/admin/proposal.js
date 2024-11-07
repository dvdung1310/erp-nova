import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const ProposalList = lazy(() => import('../../container/proposal/ListProposal'));
function Proposal() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/danh-sach`} component={ProposalList}/>
        </Switch>
    );
}

export default Proposal;
