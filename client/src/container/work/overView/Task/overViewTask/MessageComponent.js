import {motion} from 'framer-motion';
import {CiImageOn} from "react-icons/ci";
import './MessageComponent.scss';
import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {createComment, createCommentFile, getCommentByTask} from "../../../../../apis/work/task";
import {toast} from "react-toastify";
import Avatar from "../../../../../components/Avatar/Avatar";
import moment from "moment";
import {createAxios} from "../../../../../utility/createAxios";
import {Button, Modal, Spin} from 'antd';
import {MdAttachFile} from "react-icons/md";
import {FaRegFileLines} from "react-icons/fa6";
import {getItem} from "../../../../../utility/localStorageControl";

const MessageComponent = ({handleCloseComment, task}) => {
    console.log(task);
    const {pathname} = useLocation();
    const URL_LARAVEL = process.env.REACT_APP_LARAVEL_SERVER;
    const [message, setMessage] = useState([]);
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSend, setLoadingSend] = useState(false);
    const user_id = getItem('user_id')
    const [currentImage, setCurrentImage] = useState(null);
    const [showImage, setShowImage] = useState(false);
    const instanceAxios = createAxios();
    const handleCloseImage = () => {
        setShowImage(false);
        setCurrentImage(null);
    }
    const handleShowImage = (image) => {
        setCurrentImage(image);
        setShowImage(true);
    }


    const fetchComment = async () => {
        try {
            setLoading(true);
            const res = await getCommentByTask(task?.task_id)
            setMessage(res.data);
            setLoading(false)

        } catch (error) {
            setLoading(false)
            toast.error('Lỗi khi lấy dữ liệu công việc', {
                position: "top-right", autoClose: 1000
            });
            console.log(error);
        }
    }
    useEffect(() => {
        fetchComment()
    }, [task])

    const handleSendComment = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setLoadingSend(true);
            const payload = {
                text,
                task_id: task?.task_id,
                message_type: 0,
                pathname
            }
            const res = await createComment(payload)
            if (res.error) {
                toast.error(res?.message, {
                    position: "top-right",
                    autoClose: 1000
                })
                return;
            }
            setMessage([...message, res.data])
            setText('')
            setLoadingSend(false);
        } catch (error) {
            setLoadingSend(false);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
            console.log(error);
        }
    }

    const handleImageChange = async (e, type) => {
        e.stopPropagation()
        e.preventDefault()
        const selectedFile = e.target.files[0]; // Capture the selected file
        if (selectedFile) {
            setFile(selectedFile);
            // eslint-disable-next-line no-use-before-define
            await handleSendImage(selectedFile, type);
            setFile(null);
        }
    };

// Ensure the input element is correctly set up to call handleImageChange on change

    const handleSendImage = async (file, type) => {
        try {
            setLoading(true);
            const formData = new FormData();
            if (type === 'image') {
                formData.append('image_url', file);
                formData.append('message_type', 1);
            }
            if (type === 'file') {
                formData.append('file_url', file);
                formData.append('message_type', 2);
            }
            formData.append('task_id', task?.task_id);


            formData.append('pathname', pathname);
            const response = await createCommentFile(formData);
            console.log(response);
            if (response.error) {
                toast.error('Lỗi khi gửi bình luận', {
                    position: "top-right", autoClose: 1000
                });
                return;
            }
            setMessage([...message, response.data]);
            setFile(null);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error('Đã xảy ra lỗi', {
                autoClose: 1000,
                position: 'top-right'
            })
        }

    }

    return (
        <div className='message-component'>
            <div onClick={handleCloseComment} className='overlay'></div>

            <motion.div
                initial={{opacity: 1, x: '100%'}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 1, x: '100%'}}
                style={{willChange: 'inherit', backfaceVisibility: 'inherit'}}
                transition={{duration: 0.5, ease: "easeInOut"}}
                className="_container">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>{task?.task_name}</span>
                        {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
                        <Button type='primary' style={{borderRadius: '10px'}} onClick={handleCloseComment}>X</Button>
                    </div>
                    <div style={{
                        backgroundColor: '#eef0f1'
                    }} dangerouslySetInnerHTML={{__html: task?.task_description}}></div>
                    <div className="card-body">
                        <div className="comment">
                            <div className="message">
                                {
                                    loading ? <div style={{
                                            height: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Spin/>
                                        </div> :
                                        message?.length > 0 ? message.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{opacity: 0, y: 20}}
                                                animate={{opacity: 1, y: 0}}
                                                style={{
                                                    willChange: 'inherit', backfaceVisibility: 'inherit',
                                                    marginLeft: (item?.user?.id === user_id && item?.message_type !== 3) ? 'auto' : '0'
                                                }} // Đưa phần tử lên layer mới
                                                title={item?.user?.name}
                                                transition={{duration: 0.3, ease: "easeInOut"}}
                                                className={`w-100 d-flex align-items-center`}>
                                                {
                                                    item?.message_type === 3 ? <>
                                                       <span style={{
                                                           color: 'gray',
                                                           fontSize: '12px',
                                                           opacity: '0.6',
                                                           textAlign: 'center',
                                                           width: '100%',
                                                           display: 'block',
                                                           margin: '10px 0'
                                                       }}>
                                                            <strong>{item?.user?.name}</strong>: {item?.text} lúc {moment(item?.created_at).format('HH:mm [ngày] DD/MM/YYYY')}
                                                        </span>
                                                        </> :
                                                        <>
                                                            <Avatar width={30} height={30} name={item?.user?.name}
                                                                    imageUrl={item?.user?.avatar ? URL_LARAVEL + item?.user?.avatar : ''}/>
                                                            <p className={`${item?.user?.id === user_id ? 'bg-primary' : 'bg-secondary'} ms-1 text-white rounded p-2 mb-1`}
                                                               style={{
                                                                   backgroundColor: item?.user?.id === user_id ? '#e5efff' : '#fff',
                                                               }}
                                                            >
                                                                {item.message_type === 0 ? <span style={{
                                                                    color: '#000',
                                                                    fontSize: '16px'
                                                                }}>{item.text}</span> : item?.message_type === 1 ?
                                                                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,no-unsafe-optional-chaining
                                                                    <img style={{width: '200px'}}
                                                                         src={URL_LARAVEL + item?.image_url}
                                                                         onClick={() => handleShowImage(URL_LARAVEL + item?.image_url)}
                                                                         alt=""/>
                                                                    : item?.message_type === 2 &&
                                                                    // eslint-disable-next-line no-unsafe-optional-chaining
                                                                    <a href={URL_LARAVEL + item?.file_url}
                                                                       style={{textDecoration: "none"}} download
                                                                       title="Tải xuống">
                                                            <span className='text-white d-flex align-items-center'>
                                                                <FaRegFileLines size={30} color="black"/>
                                                                <span className='ms-2 mt-0' style={{color: '#0068ff'}}>
                                                                    {item?.file_url?.split('/').pop()}
                                                                </span>
                                                            </span>
                                                                    </a>
                                                                }
                                                                <i style={{
                                                                    color: '#000',
                                                                    fontSize: '10px',
                                                                    float: 'right'
                                                                }}>{moment(item?.created_at).format('DD/MM/YYYY HH:mm')}</i>
                                                            </p>
                                                        </>
                                                }
                                                {/* eslint-disable-next-line no-unsafe-optional-chaining */}

                                            </motion.div>
                                        )) : <p>Không có bình luận nào</p>
                                }

                            </div>
                        </div>
                        <div className="input-group mt-3" style={{borderTop: '1px solid #ccc'}}>
                            <form onSubmit={handleSendComment} action=""
                                  style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      width: '100%',
                                      margin: '10px 0'
                                  }}
                            >
                                <div className="form-group me-3">
                                    <label htmlFor="fileInput"
                                           className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle"
                                           style={{width: '40px', height: '40px', cursor: 'pointer'}}>
                                        <MdAttachFile size={24}/>
                                    </label>
                                    <input type="file" hidden onChange={(e) => handleImageChange(e, 'file')}
                                           className="form-control"
                                           id="fileInput"/>
                                </div>
                                <div className="form-group me-3">
                                    <label htmlFor="fileInput1"
                                           className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle"
                                           style={{width: '40px', height: '40px', cursor: 'pointer'}}>
                                        <CiImageOn size={24}/>
                                    </label>
                                    <input type="file" hidden onChange={(e) => handleImageChange(e, 'image')}
                                           className="form-control"
                                           id="fileInput1"/>
                                </div>
                                <div className="ant-form-item-control-input-content">
                                    <input type="text" className="ant-input" id="exampleInputEmail1"
                                           value={text}
                                           onChange={(e) => setText(e.target.value)}
                                           aria-describedby="emailHelp" placeholder="Nhập bình luận"/>
                                </div>
                                <Button type='primary'
                                        htmlType='submit'
                                        style={{
                                            height: '100%',
                                            padding: '10px 30px',
                                            margin: '0 10px'
                                        }}
                                >
                                    {
                                        loadingSend ? <div>
                                            <Spin/>
                                        </div> : 'Gửi'
                                    }
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
            <Modal
                visible={showImage}
                onCancel={handleCloseImage}
                centered
                footer={null}
                style={{
                    zIndex: 999999
                }}
            >
                <img
                    src={currentImage}
                    alt="Zoomed"
                    style={{
                        width: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}
                />
            </Modal>
        </div>

    );
}

export default MessageComponent;