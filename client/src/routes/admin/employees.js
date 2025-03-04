import {Route, Switch, useRouteMatch} from "react-router-dom";
import React, {lazy} from "react";

const EmployeesList = lazy(() => import('../../container/employees/CrmEmployees'));
const FullWorkSchedule = lazy(() => import('../../container/employees/workschedule/FullWorkSchedule'));
const CreateWorksSchedule = lazy(() => import('../../container/employees/workschedule/CreateWorkSchedule'));
const FullWorkScheduleTimekeeping = lazy(() => import('../../container/employees/workschedule/FullWorkScheduleTimekeeping'));
const CreateWorksScheduleTimekeeping = lazy(() => import('../../container/employees/workschedule/CreateWorkScheduleTimekeeping'));
const UserScheduleTimekeepingDetail = lazy(() => import('../../container/employees/workschedule/UserScheduleTimekeepingDetail'));
const EmployeesMain = lazy(() => import('../../container/employees/CrmEmployees'));
const CreateExam = lazy(() => import('../../container/employees/exam/CreateExam'));
const ListExam = lazy(() => import('../../container/employees/exam/ListExam'));
const DetailExam = lazy(() => import('../../container/employees/exam/DetailExam'));
const DetailDocument = lazy(() => import('../../container/employees/exam/DetailDocument'));
const DetailExamDocument = lazy(() => import('../../container/employees/exam/DetailExamDocument'));
const AddQuestionExamDocument = lazy(() => import('../../container/employees/exam/AddQuestionExamDocument'));
const StartExam = lazy(() => import('../../container/employees/exam/StartExam'));
const ResultExam = lazy(() => import('../../container/employees/exam/ResultExam'));
const ListUserExam = lazy(() => import('../../container/employees/exam/ListUserExam'));
const Department = lazy(() => import('../../container/employees/CrmDepartment'));
const DepartmentTeam = lazy(() => import('../../container/employees/CrmDepartmentTeam'));
const EmployeeFile = lazy(() => import('../../container/employees/CrmEmployeeFile'));
const EmployeeDepartment = lazy(() => import('../../container/employees/CrmEmployeeDepartment'));
const ListEmployee = lazy(() => import('../../container/employees/CrmListEmployee'));
const CrmEmployeeDayOff = lazy(() => import('../../container/employees/CrmEmployeeDayOff'));
const CrmEmployeeDayOffDetail = lazy(() => import('../../container/employees/CrmEmployeeDayOffDetail'));
const CrmListDayOffEmployee = lazy(() => import('../../container/employees/CrmListDayOff'));
const CrmEmployeeProfile = lazy(() => import('../../container/employees/profile/Index'));
const EmployeesInformation = lazy(() => import('../../container/employees/EmployeesInformation'));
const InfoProfileMe = lazy(() => import('../../container/employees/profile/ProfileMe'));
const ListWorkConfirmation = lazy(() => import('../../container/employees/workconfimation/ListWorkConfirmation'));
const CheckWorkConfirmation = lazy(() => import('../../container/employees/workconfimation/CheckWorkConfirmation'));
const ManagerCheckWorkConfirmation = lazy(() => import('../../container/employees/workconfimation/ManagerCheckWorkConfirmation'));
const ManagerViewWorkConfirmation = lazy(() => import('../../container/employees/workconfimation/ManagerViewWorkConfirmation'));
const CreateWorkConfimation = lazy(() => import('../../container/employees/workconfimation/CreateWorkConfimation'));
const DetailWorkConfimation = lazy(() => import('../../container/employees/workconfimation/DetailWorkConfimation'));
const ListWorkConfirmationStatus1 = lazy(() => import('../../container/employees/workconfimation/ListWorkConfirmationStatus1'));
function Employees() {
    const {path} = useRouteMatch();
    return (
        <Switch>
            <Route exact path={path} component={EmployeesMain}/>
            <Route path={`${path}/tong-quan`} component={EmployeesList}/>
            <Route path={`${path}/danh-sach-nhan-su`} component={ListEmployee}/>
            <Route path={`${path}/phong-ban`} component={Department}/>
            <Route path={`${path}/lich-lam-viec`} component={FullWorkSchedule}/>
            <Route path={`${path}/dang-ki/lich-lam-viec`} component={CreateWorksSchedule}/>
            <Route path={`${path}/danh-sach-de/:type`} component={ListExam}/>
            <Route path={`${path}/danh-sach-tai-lieu/:type`} component={ListExam}/>
            <Route path={`${path}/ho-so/:employee_id`} component={EmployeeFile}/>
            <Route path={`${path}/nhan-vien-theo-phong/:department_id`} component={EmployeeDepartment}/>
            <Route path={`${path}/profile/:employee_id`} component={CrmEmployeeProfile}/>
            <Route path={`${path}/lich-lam-viec`} component={FullWorkSchedule}/>
            <Route path={`${path}/dang-ki/lich-lam-viec`} component={CreateWorksSchedule}/>
            <Route path={`${path}/kiem-tra-cham-cong`} component={FullWorkScheduleTimekeeping}/>
            <Route path={`${path}/import-file/kiem-tra-cham-cong`} component={CreateWorksScheduleTimekeeping}/>
            <Route path={`${path}/tong-cong-nhan-vien/:month/:name`} component={UserScheduleTimekeepingDetail}/>
            <Route path={`${path}/tao-de/:type`} component={CreateExam}/>
            <Route path={`${path}/de-thi/:id`} component={DetailExam} />
            <Route path={`${path}/tai-lieu/:id`} component={DetailDocument} />
            <Route path={`${path}/tai-lieu-de-thi/:id`} component={DetailExamDocument} />
            <Route path={`${path}/them-tai-lieu-de-thi/:id`} component={AddQuestionExamDocument} />
            <Route path={`${path}/lam-bai-thi/:id`} component={StartExam} />
            <Route path={`${path}/ket-qua-bai-thi/:id`} component={ResultExam} />
            <Route path={`${path}/danh-sach-nguoi-thi/:id`} component={ListUserExam} />
            <Route path={`${path}/nghi-phep`} component={CrmEmployeeDayOff} />
            <Route path={`${path}/don-nghi-phep/:id`} component={CrmEmployeeDayOffDetail} />
            <Route path={`${path}/danh-sach-don-nhan/:employeeId`} component={CrmListDayOffEmployee} />
            <Route path={`${path}/thong-tin`} component={InfoProfileMe}/>
            <Route path={`${path}/danh-sach-xac-nhan-cong`} component={ListWorkConfirmation}/>
            <Route path={`${path}/kiem-tra-danh-sach-xac-nhan-cong`} component={CheckWorkConfirmation}/>
            <Route path={`${path}/danh-sach-xac-nhan-cong-cua-nhan-su`} component={ListWorkConfirmationStatus1}/>
            <Route path={`${path}/quan-ly-check-xac-nhan-cong/:id`} component={ManagerCheckWorkConfirmation}/>
            <Route path={`${path}/quan-ly-xem-xac-nhan-cong/:id`} component={ManagerViewWorkConfirmation}/>
            <Route path={`${path}/xac-nhan-cong`} component={CreateWorkConfimation}/>
            <Route path={`${path}/chi-tiet-xac-nhan-cong/:id`} component={DetailWorkConfimation}/>
        </Switch>
    );
}

export default Employees;
