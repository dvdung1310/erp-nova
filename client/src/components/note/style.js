import Styled from 'styled-components';

const Card = Styled.div`
    .ant-card{
        border-radius: 15px !important;
    }
    .ant-card .ant-card-body{        
        border-radius: 15px !important;
        color: ${({theme}) => theme['gray-color']};    
        padding-bottom: 20px !important;
        padding-top: 20px !important;
        transition: .35s;
        h4{
            display: flex;
            align-items: center;
            font-size: 16px;
            color: ${({theme}) => theme['dark-color']};
            justify-content: space-between;
            svg{
                color: #5A5F7D !important;
                cursor: move;
            }
            .status-bullet{
                position: relative;
                bottom: 2px;
                min-width: 7px;
                height: 7px;
                display: inline-block;
                border-radius: 50%;
               ${({theme}) => (!theme.rtl ? 'margin-left' : 'margin-right')} : 8px;
             
               
               &.personal{
                background: #5F63F2;
               }
               &.work{
                background: #20C997;
               }
               &.social{
                background: #FA8B0C;
               }
               &.important{
                background: #2C99FF;
               }
            }
        }
        p {
            font-size: 30px;
            font-weight: 500;
            color: ${({theme}) => theme['dark-color']};
            margin-bottom: 0;
        }
        .actions{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 18px;
            .star{
                svg,
                i,
                span{
                    color: ${({theme}) => theme['gray-color']} !important;
                }
                &.active{
                    svg,
                    i,
                    span{
                        color: ${({theme}) => theme['warning-color']} !important;
                    } 
                } 
            }
            span{
                display: inline-block;
                margin: -5px;
                a {
                    margin: 5px;
                    svg,
                    i,
                    span{
                        color: ${({theme}) => theme['gray-color']} !important;
                    }
                }
            }
            .ant-dropdown-trigger{
                svg{
                    color: #868EAE;
                }
            }
        }        
    } 
      &.total_projects .ant-card .ant-card-body{
        background: #5f63f280;
        &:hover{
            background: #5f63f2;
        }
    }
    &.total_tasks .ant-card .ant-card-body{
        background: #20c99780;
        &:hover{
            background: #20c997;
        }
    }
    &.total_completed_tasks .ant-card .ant-card-body{
        background: #42a04787;
        &:hover{
            background: #42a047;
        }
    }
    &.total_doing_tasks .ant-card .ant-card-body{
        background: #0288d175;
        &:hover{
            background: #0288d1;
        }
    }  
    &.total_waiting_tasks .ant-card .ant-card-body{
        background: #ed6c0282;
        &:hover{
            background: #ed6c02;
        }
    }
    &.total_overdue_tasks .ant-card .ant-card-body{
        background: #d32f2f99;
        &:hover{
            background: #e15151;
        }
    }  
      &.total_paused_tasks .ant-card .ant-card-body{
        background: #9e9e9e7a;
        &:hover{
            background: #9e9e9e;
        }
    }  
    &.personal .ant-card .ant-card-body{
        background: #5F63F240;
        &:hover{
            background: #5F63F290;
        }
    }
    &.work .ant-card .ant-card-body{
        background: #20C99740;
        &:hover{
            background: #20C99790;
        }
    }
    &.social .ant-card .ant-card-body{
        background: #FA8B0C40;
        &:hover{
            background: #FA8B0C90;
        }
    }
    &.important .ant-card .ant-card-body{
        background: #2C99FF40;
        &:hover{
            background: #2C99FF90;
        }
    }  
`;

export {Card};
