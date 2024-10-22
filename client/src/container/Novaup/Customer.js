import React from "react";
import {PageHeader} from "../../components/page-headers/page-headers";
import CustomerTable from "../table/CustomerTable";

const StatusData = () => {
    return (
        <div>
            <PageHeader ghost title="Danh sách khách hàng" />
            <CustomerTable/>
        </div>
    )
}
export default StatusData;