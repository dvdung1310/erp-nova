import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const ProposalList = lazy(() => import('../../container/proposal/ListProposal'));
const DetailProposal = lazy(() => import('../../container/proposal/DetailProposal'));
const CheckProposal = lazy(() => import('../../container/proposal/CheckProposal'));
const ManagerCheckProposal = lazy(() => import('../../container/proposal/ManagerCheckProposal'));
function Proposal() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route path={`${path}/danh-sach`} component={ProposalList}/>
            <Route path={`${path}/chi-tiet/:id`} component={DetailProposal}/>
            <Route path={`${path}/kiem-tra-danh-sach`} component={CheckProposal}/>
            <Route path={`${path}/leader-xac-nhan-de-xuat/:id`} component={ManagerCheckProposal}/>
        </Switch>
    );
}

export default Proposal;
