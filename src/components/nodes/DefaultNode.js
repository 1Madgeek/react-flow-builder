import React, {Component} from "react";
import classNames from "classnames";
import IconLink from "../../assets/icon/IconLink";

class DefaultNode extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    getLinkStyle(position) {
        const isActive = this.props.activeLinkPosition === position;
        return {
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: 'transparent',
            color: isActive ? '#2196f3' : 'black',
            cursor: 'pointer',
            ...(position === 'top' && {top: -5, left: '50%', transform: 'translateX(-50%)'}),
            ...(position === 'right' && {top: '50%', right: -5, transform: 'translateY(-50%)'}),
            ...(position === 'bottom' && {bottom: 0, left: '48%', transform: 'translateX(-50%)'}),
            ...(position === 'left' && {top: '50%', left: -5, transform: 'translateY(-50%)'}),
        };
    }

    render() {
        const {
            node,
            onMouseDown,
            onLinkClick,
            onClick,
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
                    <div style={this.getLinkStyle('top')} onClick={() => onLinkClick('top')}><IconLink/></div>
                    <div style={this.getLinkStyle('right')} onClick={() => onLinkClick('right')}><IconLink/></div>
                    <div style={this.getLinkStyle('left')} onClick={() => onLinkClick('left')}><IconLink/></div>
                    <div style={this.getLinkStyle('bottom')} onClick={() => onLinkClick('bottom')}><IconLink/></div>
                    <div>
                        <div className="node-item-header">
                            <h4 onClick={onClick}>Node {this.props.id}</h4>
                        </div>
                        <div className="node-item-body">
                            {(!isBranch && !isEnd) && (
                                <>
                                    <button onClick={addBranch}
                                            style={{marginTop: '10px', padding: '5px', cursor: 'pointer'}}>
                                        Add Branch
                                    </button>
                                    {!isStart && (
                                        <button onClick={convertToBranchNode}
                                                style={{marginTop: '10px', padding: '5px', cursor: 'pointer'}}>
                                            Convert to branch Branch
                                        </button>
                                    )}
                                </>
                            )}

                            {renderNodeActions}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DefaultNode
