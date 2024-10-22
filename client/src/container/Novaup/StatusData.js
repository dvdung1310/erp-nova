import React from "react";
import DragAndDropTable from "../table/DragTable";
import {PageHeader} from "../../components/page-headers/page-headers";

const StatusData = () => {
    return (
        <div>
            <PageHeader ghost title="Trạng thái data"/>
            <DragAndDropTable/>
        </div>
    )
}
export default StatusData;