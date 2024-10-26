import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import './Task.scss';
import {toast} from "react-toastify";
import {
    getTasks,
} from "../../../../apis/work/task";

import TaskLisk from "./overViewTask/TaskLisk";
import moment from "moment";
import {Spin} from "antd";


// Stable sorting function


const Task = () => {
    const params = useParams()
    const {id} = params;
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState({});
    const [creator, setCreator] = useState({});
    const [listUser, setListUser] = useState([]);
    const [tasks, setTasks] = useState([]);
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks(id)
            setTasks(res.data?.tasks);
            setProject(res.data?.project);
            setListUser(res.data?.userProject);
            setCreator(res.data?.creator);
            setLoading(false)

        } catch (error) {
            setLoading(false)
            toast.error('Lỗi khi lấy dữ liệu công việc', {
                position: "bottom-right", autoClose: 1000
            });
            console.log(error);
        }
    }
    useEffect(() => {
        window.scroll({
            top: 0, left: 0, behavior: 'smooth'
        });
        fetchTasks()
    }, [id]);
    // Sorting state

// Sort the tasks using the comparator and stable sort function

    return (<div className='task'>
        <div className='content'>
            <div className='head'>
                    <span className='border-bottom'>
                        Tên dự án: {project?.project_name ?? '...'}
                    </span>
                <div className='d-flex'>
                        <span>
                        Người tạo: {creator?.name ?? '...'}
                        </span>
                    <span>
                        thành viên: {listUser.length ?? '...'}
                        </span>
                    <span>
                        Ngày tạo: {moment(project?.created_at).format('DD-MM-YYYY') ?? '...'}
                        </span>
                </div>
            </div>
            <div className='body'>
                {loading ? <div className="spin">
                    <Spin/>
                </div> : <>
                    <TaskLisk listUser={listUser} tasks={tasks} setTasks={setTasks}/>
                </>}
            </div>
        </div>

    </div>);
}

export default Task;