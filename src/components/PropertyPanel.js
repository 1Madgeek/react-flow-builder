import React, {Component} from "react";
import classNames from "classnames";
import IconX from "../assets/icon/IconX";
import IconSquarePlus from "../assets/icon/IconSquarePlus";
import IconSiteMap from "../assets/icon/IconSiteMap";
import IconSquareX from "../assets/icon/IconSquareX";
import block from "./blocks/Block";

class PropertyPanel extends Component {
    constructor(props) {
        super(props);
    }

    handleOnClose = (event) => {
        this.props.closePanel()
    }

    render() {
        const {activeBlock} = this.props;

        return (
            <div className={classNames("panel-wrapper")}>
                <div className={classNames("panel")}>
                    <div className="panel-header">
                        <h2>{block?.name || 'Block'} Properties</h2>
                        <div style={{cursor: "pointer"}} onClick={(event) => this.handleOnClose(event)}>
                            <IconX strokeWidth={1}/>
                        </div>
                    </div>

                    <div className="panel-body">
                        {activeBlock && (
                            <div>
                                <p>Block ID: {activeBlock.id}</p>
                                <p>Block Type: {activeBlock.type}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default PropertyPanel
