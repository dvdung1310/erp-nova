import {Link, NavLink, useParams} from "react-router-dom";
import {MailDetailsWrapper} from "./style";
import {MailRightAction, MessageAction, MessageDetails} from "../email/overview/style";
import FeatherIcon from "feather-icons-react";
import {Col, Row, Spin, Tooltip} from "antd";
import React, {useEffect} from "react";
import Cards from "../widgets/Cards";
import Heading from "../../components/heading/heading";
import {Dropdown} from "../../components/dropdown/dropdown";
import moment from "moment/moment";
import FontAwesome from "react-fontawesome";
import {useSelector} from "react-redux";
import {toast} from "react-toastify";
import {getNotificationById} from "../../apis/work/notification";

const NotificationDetail = () => {
    const LARAVEL_SERVER = process.env.REACT_APP_LARAVEL_SERVER;
    const {id} = useParams();
    const [_email, setEmail] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const fetchEmail = async () => {
        try {
            setLoading(true);
            const res = await getNotificationById(id);
            setEmail(res?.data)
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau');
            console.log(error)
        }
    }
    useEffect(() => {
        fetchEmail();
    }, [id])
    const email = useSelector(state => state.emailSingle.data[0]);
    console.log(email)
    return (
        <>
            {
                loading ? <div className='spin'>
                    <Spin/>
                </div> : <>
                    <MailDetailsWrapper>
                        <Row gutter={15}>
                            <Col>
                                <MessageDetails style={{marginTop: '30px'}}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="message-subject">
                                            <Heading as="h2">
                                                {_email?.notification_title}
                                            </Heading>
                                        </div>

                                        <div className="message-excerpt">
                                <span>
                                        <FeatherIcon icon="paperclip"/>
                                      </span>
                                            <span> {moment(_email?.created_at).format('DD/MM/YYYY HH:mm:ss')} </span>
                                        </div>
                                    </div>


                                    <div className="message-body">
                                        <div
                                            dangerouslySetInnerHTML={{__html: _email?.notification_content}}/>
                                    </div>

                                    <div className="message-attachments">
                                        {
                                            _email?.notification_file?.map((file, index) => {
                                                const fileName = file.split('/').pop()?.toString();
                                                const fileExtension = fileName.split('.').pop();
                                                const imageSrc = fileExtension === ('png' || 'jpg') ? `${LARAVEL_SERVER}${file}` : require('../../static/img/email/pdf.png');

                                                return (
                                                    <figure key={index}>
                                                        <div className="attachment-image">
                                                            <img style={{
                                                                width: '180px',
                                                                height: '120px',
                                                                objectFit: 'cover',
                                                                objectPosition: 'center',
                                                                borderRadius: '6px'
                                                            }} src={imageSrc} alt=""/>
                                                        </div>
                                                        <div className="attachment-hover">
                                                            <a download href={`${LARAVEL_SERVER}${file}`}
                                                               target="_blank"
                                                               rel='noreferrer'
                                                               className="btn-link">
                                                                <FeatherIcon icon="download"/>
                                                            </a>
                                                        </div>
                                                        <figcaption>
                                                            <h4 style={{
                                                                textOverflow: 'ellipsis',
                                                                overflow: 'hidden',
                                                                width: '120px',
                                                                textWrap: 'nowrap'
                                                            }}>{fileName}</h4>
                                                        </figcaption>
                                                    </figure>
                                                )
                                            })
                                        }
                                    </div>
                                    <hr/>
                                </MessageDetails>
                            </Col>
                        </Row>
                    </MailDetailsWrapper>
                </>
            }
        </>

    )
}
export default NotificationDetail;