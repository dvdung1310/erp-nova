import React from "react";
import {PageHeader} from "../../components/page-headers/page-headers";
import RoomTable from "../table/RoomTable";

const StatusData = () => {
    return (
        <div>
            <PageHeader ghost title="Phòng thuê" />
            <RoomTable/>
        </div>
    )
}
export default StatusData;