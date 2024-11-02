import React, {Component} from "react";
import classNames from "classnames";

class EndBlock extends Component {
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
            border: isActive ? '2px solid green' : '2px solid transparent',
            cursor: 'pointer',
            ...(position === 'top' && {top: -5, left: '50%', transform: 'translateX(-50%)'}),
            ...(position === 'right' && {top: '50%', right: -5, transform: 'translateY(-50%)'}),
            ...(position === 'bottom' && {bottom: -5, left: '50%', transform: 'translateX(-50%)'}),
            ...(position === 'left' && {top: '50%', left: -5, transform: 'translateY(-50%)'}),
        };
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
                    <div style={this.getLinkStyle('top')} onClick={() => onLinkClick('top')}/>
                    <div style={this.getLinkStyle('right')} onClick={() => onLinkClick('right')}/>
                    <div style={this.getLinkStyle('bottom')} onClick={() => onLinkClick('bottom')}/>
                    <div style={this.getLinkStyle('left')} onClick={() => onLinkClick('left')}/>
                    <div>
                        <div className="block-item-header">
                            <h4>End {this.props.id}</h4>
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

export default EndBlock
