import React, {Component} from "react";
import classNames from "classnames";
import IconLink from "../../assets/icon/IconLink";

class DefaultBlock extends Component {
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
                    <div style={this.getLinkStyle('bottom')} onClick={() => onLinkClick('bottom')}><IconLink/></div>
                    <div>
                        <div className="block-item-header">
                            <h4 onClick={onClick}>Block {this.props.id}</h4>
                        </div>
                        <div className="block-item-body">
                            {(!isBranch && !isEnd) && (
                                <>
                                    <button onClick={addBranch}
                                            style={{marginTop: '10px', padding: '5px', cursor: 'pointer'}}>
                                        Add Branch
                                    </button>
                                    {!isStart && (
                                        <button onClick={convertToBranchBlock}
                                                style={{marginTop: '10px', padding: '5px', cursor: 'pointer'}}>
                                            Convert to branch Branch
                                        </button>
                                    )}
                                </>
                            )}

                            {renderBlockActions}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DefaultBlock
