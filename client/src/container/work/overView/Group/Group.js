import React, {lazy, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getGroupByParentId} from "../../../../apis/work/group";
import {getAllUsers} from "../../../../apis/work/user";
import {Spin} from "antd";

const Project = lazy(() => import('../Project/Project'));

const Group = () => {
    const params = useParams();
    const {id} = params;
    const [loading, setLoading] = useState(false);
    const [listGroup, setListGroup] = useState([]);
    const [listUser, setListUser] = useState([]);

    // lấy dữ liệu group
    const fetchAPi = async () => {
        try {
            setLoading(true);
            const [groups, users] = await Promise.all([
                getGroupByParentId(id),
                getAllUsers()
            ]);
            setListGroup(groups?.data);
            setListUser(users?.data);
            setLoading(false);
        } catch (e) {
            setLoading(false)
            console.log(e);
        }
    }
    useEffect(() => {
        fetchAPi();
    }, [id]);

    return (
        <div>
            {
                loading ?
                    <div className="spin">
                        <Spin/>
                    </div> :
                    <div>
                        <Project listProject={listGroup?.projects} listUser={listUser}/>
                    </div>
            }
        </div>
    )
}
export default Group;