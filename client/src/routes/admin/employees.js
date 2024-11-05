import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const EmployeesList = lazy(() => import('../../container/employees/CrmEmployees'));
const FullWorkSchedule = lazy(() => import('../../container/employees/workschedule/FullWorkSchedule'));
const CreateWorksSchedule = lazy(() => import('../../container/employees/workschedule/CreateWorkSchedule'));
const EmployeesMain = lazy(() => import('../../container/employees/CrmEmployees'));
const CreateExam = lazy(() => import('../../container/employees/exam/CreateExam'));
const ListExam = lazy(() => import('../../container/employees/exam/ListExam'));
const DetailExam = lazy(() => import('../../container/employees/exam/DetailExam'));
const StartExam = lazy(() => import('../../container/employees/exam/StartExam'));
const ResultExam = lazy(() => import('../../container/employees/exam/ResultExam'));
const Department = lazy(() => import('../../container/employees/CrmDepartment'));
const DepartmentTeam = lazy(() => import('../../container/employees/CrmDepartmentTeam'));
const EmployeeFile = lazy(() => import('../../container/employees/CrmEmployeeFile'));
const ListEmployee = lazy(() => import('../../container/employees/CrmListEmployee'));
const CrmEmployeeDayOff = lazy(() => import('../../container/employees/CrmEmployeeDayOff'));
const CrmEmployeeDayOffDetail = lazy(() => import('../../container/employees/CrmEmployeeDayOffDetail'));
const EmployeesInformation = lazy(() => import('../../container/employees/EmployeesInformation'));
const ListWorkConfirmation = lazy(() => import('../../container/employees/workconfimation/ListWorkConfirmation'));
const CreateWorkConfimation = lazy(() => import('../../container/employees/workconfimation/CreateWorkConfimation'));
const DetailWorkConfimation = lazy(() => import('../../container/employees/workconfimation/DetailWorkConfimation'));
function Employees() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route exact path={path} component={EmployeesMain}/>
            <Route path={`${path}/tong-quan`} component={EmployeesList}/>
            <Route path={`${path}/danh-sach-nhanh-su`} component={ListEmployee}/>
            <Route path={`${path}/phong-ban`} component={Department}/>
            <Route path={`${path}/lich-lam-viec`} component={FullWorkSchedule}/>
            <Route path={`${path}/dang-ki/lich-lam-viec`} component={CreateWorksSchedule}/>
            <Route path={`${path}/danh-sach-de`} component={ListExam}/>
            <Route path={`${path}/ho-so/:employee_id`} component={EmployeeFile}/>
            <Route path={`${path}/lich-lam-viec`} component={FullWorkSchedule}/>
            <Route path={`${path}/dang-ki/lich-lam-viec`} component={CreateWorksSchedule}/>
            <Route path={`${path}/tao-de`} component={CreateExam}/>
            <Route path={`${path}/de-thi/:id`} component={DetailExam} />
            <Route path={`${path}/lam-bai-thi/:id`} component={StartExam} />
            <Route path={`${path}/ket-qua-bai-thi/:id`} component={ResultExam} />
            <Route path={`${path}/nghi-phep`} component={CrmEmployeeDayOff} />
            <Route path={`${path}/don-nghi-phep/:id`} component={CrmEmployeeDayOffDetail} />
            <Route path={`${path}/thong-tin`} component={EmployeesInformation}/>
            <Route path={`${path}/danh-sach-xac-nhan-cong`} component={ListWorkConfirmation}/>
            <Route path={`${path}/xac-nhan-cong`} component={CreateWorkConfimation}/>
            <Route path={`${path}/chi-tiet-xac-nhan-cong/:id`} component={DetailWorkConfimation}/>
        </Switch>
    );
}

export default Employees;
