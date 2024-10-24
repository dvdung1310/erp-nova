import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const EmployeesList = lazy(() => import('../../container/employees/CrmEmployees'));
const FullWorkSchedule = lazy(() => import('../../container/employees/workschedule/FullWorkSchedule'));
const CreateWorksSchedule = lazy(() => import('../../container/employees/workschedule/CreateWorkSchedule'));
const EmployeesMain = lazy(() => import('../../container/employees/CrmEmployees'));
const Department = lazy(() => import('../../container/employees/CrmDepartment'));
const DepartmentTeam = lazy(() => import('../../container/employees/CrmDepartmentTeam'));

function Employees() {
    const {path} = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path} component={EmployeesMain}/>
            <Route path={`${path}/tong-quan`} component={EmployeesList}/>
            <Route path={`${path}/phong-ban`} component={Department}/>
       
            <Route path={`${path}/lich-lam-viec`} component={FullWorkSchedule}/>
            <Route path={`${path}/dang-ki/lich-lam-viec`} component={CreateWorksSchedule}/>
        </Switch>
    );
}

export default Employees;
