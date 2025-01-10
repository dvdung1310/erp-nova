import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy, memo} from "react";

const Dashboard = lazy(() => import('../../container/Novaup'));
const StatusData = lazy(() => import('../../container/Novaup/StatusData'));
const DataSource = lazy(() => import('../../container/Novaup/DataSource'));
const Customer = lazy(() => import('../../container/Novaup/Customer'));
const Booking = lazy(() => import('../../container/Novaup/calendar/Calendar'));
const Room = lazy(() => import('../../container/Novaup/Room'));
const Payment = lazy(() => import('../../container/Novaup/Payment'));
const Receipts = lazy(() => import('../../container/Novaup/Receipts'));
const CreateReceipts = lazy(() => import('../../container/Novaup/Create_Receipts'));
const Revenue = lazy(() => import('../../container/Novaup/Revenue'));
const NovaupRoutes = memo(() => {
    const {path} = useRouteMatch();
    console.log(path);
    return (
        <Switch>
            <Route exact path={path} component={Dashboard}/>
            <Route path={`${path}/trang-thai`} component={StatusData}/>
            <Route path={`${path}/nguon-khach-hang`} component={DataSource}/>
            <Route path={`${path}/khach-hang`} component={Customer}/>
            <Route path={`${path}/phong`} component={Room}/>
            <Route path={`${path}/dat-phong`} component={Booking}/>
            {/* <Route path={`${path}/doanh-thu`} component={Payment}/> */}
            <Route path={`${path}/doanh-thu`} component={Revenue}/>
            <Route path={`${path}/phieu-thu`} component={Receipts}/>
            <Route path={`${path}/tao-phieu-thu`} component={CreateReceipts}/>
        </Switch>
    );
});

export default NovaupRoutes;