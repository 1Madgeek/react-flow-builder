import React, {Component} from "react";
import classNames from "classnames";
import IconX from "../assets/icon/IconX";

class PropertyPanel extends Component {
    constructor(props) {
        super(props);
    }

    handleOnClose = (event) => {
        this.props.closePanel()
    }

    render() {
        const {activeNode, renderPropertyPanel} = this.props;

        return (
            <div className={classNames("panel-wrapper")}>
                <div className={classNames("panel")}>
                    <div className="panel-header">
                        <h2>{activeNode?.name || 'Node'} Properties</h2>
                        <div style={{cursor: "pointer"}} onClick={(event) => this.handleOnClose(event)}>
                            <IconX strokeWidth={1}/>
                        </div>
                    </div>

                    <div className="panel-body">
                        {renderPropertyPanel}
                    </div>
                </div>
            </div>
        )
    }
}

export default PropertyPanel
