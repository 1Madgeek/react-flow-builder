import React, {Component} from "react";
import classNames from "classnames";
import IconSquarePlus from "../assets/icon/IconSquarePlus";
import IconSiteMap from "../assets/icon/IconSiteMap";
import IconSquareX from "../assets/icon/IconSquareX";
import IconX from "../assets/icon/IconX";

class NodePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    handleOnClose = (event) => {
        this.props.closePanel()
    }

    render() {
        const {node, handleNodeSelect} = this.props;

        return (
            <div className={classNames("panel-wrapper")}>
                <div className={classNames("panel")}>
                    <div className="panel-header">
                        <h2>Nodes</h2>
                        <div style={{
                            cursor: "pointer"
                        }} onClick={(event) => this.handleOnClose(event)}>
                            <IconX strokeWidth={1}/>
                        </div>
                    </div>

                    <div className="panel-body">
                        <div className="node-widget-card">
                            <div className="node-widget-card-header">
                                <h3>Building nodes</h3>
                            </div>
                            <div className="node-widget-list">
                                <div className="node-list-item"
                                     onClick={(event) => handleNodeSelect(node.id, 'default')}>
                                    <div className="icon">
                                        <IconSquarePlus/>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">Simple Node</div>
                                    </div>
                                </div>
                                <div className="node-list-item"
                                     onClick={(event) => handleNodeSelect(node.id, 'branch')}>
                                    <div className="icon">
                                        <IconSiteMap/>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">If/then branch</div>
                                    </div>
                                </div>
                                <div className="node-list-item"
                                     onClick={(event) => handleNodeSelect(node.id, 'end')}>
                                    <div className="icon">
                                        <IconSquareX/>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">End Node</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default NodePanel
