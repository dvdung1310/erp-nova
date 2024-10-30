import React, {lazy, useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import {getGroupByParentId} from "../../../../apis/work/group";
import {getAllUsers} from "../../../../apis/work/user";
import {Spin} from "antd";

const Project = lazy(() => import('../Project/Project'));

const Group = () => {
    const params = useParams();
    const {state} = useLocation()
    const {id} = params;
    const [loading, setLoading] = useState(false);
    const [listGroup, setListGroup] = useState([]);
    const [listUser, setListUser] = useState([]);
    const [currentGroup, setCurrentGroup] = useState({});

    // lấy dữ liệu group
    const fetchAPi = async () => {
        try {
            setLoading(true);
            const [groups, users] = await Promise.all([
                getGroupByParentId(id),
                getAllUsers()
            ]);
            setListGroup(groups?.data);
            setCurrentGroup(groups?.data?.currentGroup)
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
    useEffect(() => {
        if (state?.key === "createProject") {
            setListGroup(prevListGroup => ({
                ...prevListGroup,
                projects: [...(prevListGroup?.projects || []), state?.data]
            }));
        }
        if (state?.key === "updateProject") {
            setListGroup(prevListGroup => ({
                ...prevListGroup,
                projects: prevListGroup?.projects?.map(project => {
                    if (project?.project_id === state?.data?.project_id) {
                        return state?.data;
                    }
                    return project;
                })
            }));
        }
        if (state?.key === "deleteProject") {
            setListGroup(prevListGroup => ({
                ...prevListGroup,
                projects: prevListGroup?.projects?.filter(project => project?.project_id !== state?.data?.project_id)
            }));
        }
        if (state?.key === "createGroup") {
            console.log(state?.data)
            setListGroup(prevListGroup => ({
                ...prevListGroup,
                groups: [...(prevListGroup?.groups || []), state?.data]
            }));
        }
        if (state?.key === "updateGroup") {
            setListGroup(prevListGroup => ({
                ...prevListGroup,
                groups: prevListGroup?.groups?.map(group => {
                    if (group?.group_id === state?.data?.group_id) {
                        return state?.data;
                    }
                    return group;
                })
            }));
        }
        if (state?.key === "deleteGroup") {
            setListGroup(prevListGroup => ({
                ...prevListGroup,
                groups: prevListGroup?.groups?.filter(group => group?.group_id !== state?.data?.group_id)
            }));
        }
    }, [state]);

    return (
        <div>
            {
                loading ?
                    <div className="spin">
                        <Spin/>
                    </div> :
                    <div>
                        <Project currentGroup={currentGroup} listGroup={listGroup?.groups} group_id={id} listProject={listGroup?.projects}
                                 listUser={listUser}/>
                    </div>
            }
        </div>
    )
}
export default Group;