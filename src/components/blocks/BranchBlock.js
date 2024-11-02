import React, {Component} from "react";
import classNames from "classnames";
import IconLink from "../../assets/icon/IconLink";

class BranchBlock extends Component {
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
            ...(position === 'bottom' && {bottom: -5, left: '50%', transform: 'translateX(-50%)'}),
            ...(position === 'left' && {top: '50%', left: -5, transform: 'translateY(-50%)'}),
        };
    }

    render() {
        const {
            block,
            onMouseDown,
            onLinkClick,
            onClick,
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
            <div id={`block-${block.id}`}
                 onMouseDown={onMouseDown}
                 className={classNames("block-item", {'active': isActive, 'branch': isBranch})}
                 style={{
                     left: block.position?.x,
                     top: block.position?.y,
                 }}
            >
                <div style={{position: 'relative'}}>
                    <div style={this.getLinkStyle('top')} onClick={() => onLinkClick('top')}><IconLink/></div>
                    <div>
                        <div className="block-item-header" onClick={onClick}>
                            <h4>Branch {this.props.id}</h4>
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

export default BranchBlock
