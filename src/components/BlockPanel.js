import React, {Component} from "react";
import classNames from "classnames";
import IconSquarePlus from "../assets/icon/IconSquarePlus";
import IconSiteMap from "../assets/icon/IconSiteMap";
import IconSquareX from "../assets/icon/IconSquareX";
import IconX from "../assets/icon/IconX";

class BlockPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    handleOnClose = (event) => {
        this.props.closePanel()
    }

    render() {
        const {block, handleBlockSelect} = this.props;

        return (
            <div className={classNames("panel-wrapper")}>
                <div className={classNames("panel")}>
                    <div className="panel-header">
                        <h2>Blocks</h2>
                        <div style={{
                            cursor: "pointer"
                        }} onClick={(event) => this.handleOnClose(event)}>
                            <IconX strokeWidth={1}/>
                        </div>
                    </div>

                    <div className="panel-body">
                        <div className="block-widget-card">
                            <div className="block-widget-card-header">
                                <h3>Building blocks</h3>
                            </div>
                            <div className="block-widget-list">
                                <div className="block-list-item"
                                     onClick={(event) => handleBlockSelect(block.id, 'default')}>
                                    <div className="icon">
                                        <IconSquarePlus/>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">Simple Block</div>
                                    </div>
                                </div>
                                <div className="block-list-item"
                                     onClick={(event) => handleBlockSelect(block.id, 'branch')}>
                                    <div className="icon">
                                        <IconSiteMap/>
                                    </div>
                                    <div className="title-wrapper">
                                        <div className="title">If/then branch</div>
                                    </div>
                                </div>
                                <div className="block-list-item"
                                     onClick={(event) => handleBlockSelect(block.id, 'end')}>
                                    <div className="icon">
                                        <IconSquareX/>
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
