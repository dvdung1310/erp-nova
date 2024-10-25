import React from "react";
import {PageHeader} from "../../components/page-headers/page-headers";
import StatusCustomerTable from "../table/StatusCustomerTable";
import DragAndDropTable from "../table/DragTable";

const StatusData = () => {
    return (
        <div>
            <PageHeader ghost title="Trạng thái data"/>
            <StatusCustomerTable/>
        </div>
    )
}
export default StatusData;