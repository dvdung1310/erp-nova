import { Route, Switch, useRouteMatch } from "react-router-dom";
import React, { lazy, memo } from "react";

const Dashboard = lazy(() => import('../../container/Novaup'));
const Customer = lazy(() => import('../../container/NovaTeen/Customer'));
const DataImport = lazy(() => import('../../container/NovaTeen/DataImport'));
const DataSource = lazy(() => import('../../container/NovaTeen/DataSource'));
const DataStatus = lazy(() => import('../../container/Novaup/StatusData'));
const listBill = lazy(() => import('../../container/NovaTeen/ListBill'));
const Receipts = lazy(() => import('../../container/NovaTeen/Receipts'));
const CreateReceipts = lazy(() => import('../../container/NovaTeen/Create_Receipts'));
const CreateReceiptsHandmade = lazy(() => import('../../container/NovaTeen/Create_Receipts_handmade'));
const Revenue = lazy(() => import('../../container/NovaTeen/Revenue'));

const NovaupRoutes = memo(() => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={path} component={Dashboard} />
      <Route path={`${path}/khach-hang`} component={Customer} />
      <Route path={`${path}/data-import`} component={DataImport} />
      <Route path={`${path}/nguon-data`} component={DataSource} />
      <Route path={`${path}/trang-thai-data`} component={DataStatus} />
      <Route path={`${path}/doanh-thu`} component={Revenue} />
      <Route path={`${path}/phieu-thu`} component={Receipts} />
      <Route path={`${path}/tao-phieu-thu`} component={CreateReceipts} />
      <Route path={`${path}/tao-phieu-thu-thu-cong`} component={CreateReceiptsHandmade} />
      {/* <Route path={`${path}/khach-hang/chi-tiet`} component={showCustomer} /> */}
    </Switch>
  );
});

export default NovaupRoutes;
