import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy, memo} from "react";

const Product = lazy(() => import('../../container/aaifood/product'));
const Suppliers = lazy(() => import('../../container/aaifood/suppliers'));
const Agency = lazy(() => import('../../container/aaifood/agency'));
const Bill_sales = lazy(() => import('../../container/aaifood/order/list_order_agency'));
const CreateOrder = lazy(() => import('../../container/aaifood/order/create_order'));
const CreateOrderAgency = lazy(() => import('../../container/aaifood/order/create_order_agency'));
const TurnOver = lazy(() => import('../../container/aaifood/turnover'));
const PaymentSlip = lazy(() => import('../../container/aaifood/payment_slip'));
const createPaymentSlip = lazy(() => import('../../container/aaifood/create_payment_slip'));

const NovaupRoutes = memo(() => {
    const {path} = useRouteMatch();
    console.log(path);
    return (
        <Switch>
            <Route exact path={path} component={Product}/>
            <Route path={`${path}/san-pham`} component={Product}/>
            <Route path={`${path}/nha-cung-cap`} component={Suppliers}/>
            <Route path={`${path}/dai-ly`} component={Agency}/>
            <Route path={`${path}/ban-hang`} component={Bill_sales}/>
            <Route path={`${path}/tao-phieu-ban-le`} component={CreateOrder}/>
            <Route path={`${path}/tao-phieu-ban-dai-ly`} component={CreateOrderAgency}/>
            <Route path={`${path}/doanh-thu`} component={TurnOver}/>
            <Route path={`${path}/phieu-chi`} component={PaymentSlip}/>
            <Route path={`${path}/tao-phieu-chi`} component={createPaymentSlip}/>
        </Switch>
    );
});

export default NovaupRoutes;