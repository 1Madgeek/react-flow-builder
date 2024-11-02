import React, {Component} from "react";
import classNames from "classnames";

class BlockPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapseBlockPanel: true
        }
    }

    toggleBlockPanelVisibility = (event) => {
        this.setState(prev => ({collapseBlockPanel: !prev.collapseBlockPanel}))
    }

    render() {
        const {collapseBlockPanel} = this.state;

        return (
            <div className={classNames("block-panel-wrapper", {"active": !collapseBlockPanel})}>
                <div className={classNames("block-panel", {
                    "collapse": collapseBlockPanel
                })}>
                    <div id="close-block-panel" onClick={(event) => this.toggleBlockPanelVisibility(event)}>
                        <img src="/image/closeleft.svg" alt={'Collapse'}/>
                    </div>
                    <div className="block-panel-header">
                        <h2>Blocks</h2>
                    </div>

                    <div className="block-panel-body">
                        <div className="block-widget-card">
                            <div className="block-widget-card-header">
                                <h3>Building blocks</h3>
                            </div>
                            <div className="block-widget-list">
                                <div className="block-list-item">
                                    <div className="icon">
                                        <i className="ti ti-square-plus"></i>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">Simple Block</div>
                                    </div>
                                </div>
                                <div className="block-list-item">
                                    <div className="icon">
                                        <i className="ti ti-hierarchy"></i>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">If/then branch</div>
                                    </div>
                                </div>
                                <div className="block-list-item">
                                    <div className="icon">
                                        <i className="ti ti-square-x"></i>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">End Block</div>
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

export default BlockPanel
