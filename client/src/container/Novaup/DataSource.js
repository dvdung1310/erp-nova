import React from "react";
import {PageHeader} from "../../components/page-headers/page-headers";
import DataSourceTable from "../table/DataSourceTable";

const StatusData = () => {
    return (
        <div>
            <PageHeader ghost title="Nguồn Data" />
           <DataSourceTable/>
        </div>
    )
}
export default StatusData;