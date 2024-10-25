import React from "react";
import {PageHeader} from "../../components/page-headers/page-headers";
import StatusCustomerTable from "../table/StatusCustomerTable";

const StatusData = () => {
    return (
        <div>
            <PageHeader ghost title="Trạng thái data"/>
            <StatusCustomerTable/>
        </div>
    )
}
export default StatusData;