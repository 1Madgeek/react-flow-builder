import React, {Component} from "react";
import classNames from "classnames";
import IconLink from "../../assets/icon/IconLink";

class StartNode extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const {
            node,
            onMouseDown,
            onClick,
            onLinkClick,
            activeLinkPosition,
            isActive,
            convertToBranchNode,
            addBranch,
            renderNodeActions
        } = this.props;

        const isBranch = node.type === 'branch';
        const isStart = node.type === 'start';
        const isEnd = node.type === 'end';

        return (
            <div id={`node-${node.id}`}
                 onMouseDown={onMouseDown}
                 className={classNames("node-item", {'active': isActive, 'branch': isBranch})}
                 style={{
                     left: node.position?.x,
                     top: node.position?.y,
                 }}
            >
                <div style={{position: 'relative'}}>
                    <div>
                        <div className="node-item-header">
                            <h4 onClick={onClick}>Start {this.props.id}</h4>
                        </div>
                        <div className="node-item-body">
                            {renderNodeActions}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StartNode
