import {Cards} from "../../../../../components/cards/frame/cards-frame";
import {BadgeWraperStyle} from "../../../../ui-elements/ui-elements-styled";
import {Badge, Col, Row} from "antd";
import {NavLink} from "react-router-dom";
import {ClockCircleOutlined} from "@ant-design/icons";
import React from "react";
import {Main} from "../../../../styled";

const CalculatorKPI = () => {
    return (
        <div>
            <Main>
                <Row gutter={25}>
                    <Col md={12} sm={12} xs={24}>
                        <Cards title="Basic">
                            <BadgeWraperStyle>
                                <Badge count={5}>
                                    <NavLink to="#" className="head-example"/>
                                </Badge>
                                <Badge count={0} showZero>
                                    <NavLink to="#" className="head-example"/>
                                </Badge>
                                <Badge count={<ClockCircleOutlined style={{color: '#f5222d'}}/>}>
                                    <NavLink to="#" className="head-example"/>
                                </Badge>
                            </BadgeWraperStyle>
                        </Cards>
                    </Col>
                </Row>
            </Main>
        </div>
    );
}
export default CalculatorKPI;