import Styled from 'styled-components';
import {Dropdown} from 'antd';

const Content = Styled.div`
    background: #ffffff;
    box-shadow: 0px 0px 2px #888;
    a i, a svg, a img {
        ${({theme}) => (theme.rtl ? 'margin-left' : 'margin-right')}: 8px;
    }
    a {
        display: block;
        color: #888;
        padding: 6px 12px;
    }
    a:hover {
        background: ${({theme}) => theme['primary-color']}10;
        color: ${({theme}) => theme['primary-color']}
    }
    .dropdown-theme-2{
        a:hover{
            background: ${({theme}) => theme.pink}10;
            color: ${({theme}) => theme.pink}
        }
    }
    .popover-content {
            padding: 16px;
            border-radius: 8px;
            background-color: #fff;
            min-width: 250px;
    }
    .action-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            cursor: pointer;
            -webkit-user-select: none;
            user-select: none;
                transition: background-color 0.3s ease, transform 0.3s ease;
    }
 .action-item:hover {
    background-color: #f5f5f5;
    transform: scale(1.05);
}
    .action-item span {
            margin-left: 8px;
            font-size: 1.25rem;
            font-weight: 500;
            color: #333;
            transition: color .3s;
    }
    
`;

const DropdownStyle = Styled(Dropdown)`
    
`;

export {Content, DropdownStyle};
