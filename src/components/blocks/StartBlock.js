import React, {Component} from "react";
import classNames from "classnames";
import IconLink from "../../assets/icon/IconLink";

class StartBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const {
            block,
            onMouseDown,
            onLinkClick,
            activeLinkPosition,
            isActive,
            convertToBranchBlock,
            addBranch,
            renderBlockActions
        } = this.props;

        const isBranch = block.type === 'branch';
        const isStart = block.type === 'start';
        const isEnd = block.type === 'end';

        return (
            <div
                onMouseDown={onMouseDown}
                className={classNames("block-item", {'active': isActive, 'branch': isBranch})}
                style={{
                    left: block.position?.x,
                    top: block.position?.y,
                }}
            >
                <div style={{position: 'relative'}}>
                    <div>
                        <div className="block-item-header">
                            <h4>Start {this.props.id}</h4>
                        </div>
                        <div className="block-item-body">
                            {renderBlockActions}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StartBlock
