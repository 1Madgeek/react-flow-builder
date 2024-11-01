import React, {Component} from "react";

class Block extends Component {
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
            backgroundColor: 'yellow',
            border: isActive ? '2px solid green' : '2px solid yellow', // Color indication for link placeholder
            cursor: 'pointer',
            ...(position === 'top' && {top: -5, left: '50%', transform: 'translateX(-50%)'}),
            ...(position === 'right' && {top: '50%', right: -5, transform: 'translateY(-50%)'}),
            ...(position === 'bottom' && {bottom: -5, left: '50%', transform: 'translateX(-50%)'}),
            ...(position === 'left' && {top: '50%', left: -5, transform: 'translateY(-50%)'}),
        };
    }

    render() {
        const {
            position,
            onMouseDown,
            onLinkClick,
            activeLinkPosition,
            isActive,
            isBranch,
            addBranch,
            renderBlockActions
        } = this.props;


        return (
            <div
                onMouseDown={onMouseDown}
                style={{
                    position: 'absolute',
                    left: position?.x,
                    top: position?.y,
                    width: '100px',
                    height: '100px',
                    backgroundColor: isActive ? 'red' : isBranch ? 'orange' : 'blue',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid black',
                }}
            >
                <div style={{position: 'relative'}}>
                    <div style={this.getLinkStyle('top')} onClick={() => onLinkClick('top')}/>
                    <div style={this.getLinkStyle('right')} onClick={() => onLinkClick('right')}/>
                    <div style={this.getLinkStyle('bottom')} onClick={() => onLinkClick('bottom')}/>
                    <div style={this.getLinkStyle('left')} onClick={() => onLinkClick('left')}/>
                    <div>
                        <h4>Block {this.props.id}</h4>
                        <button onClick={addBranch} style={{marginTop: '10px', padding: '5px', cursor: 'pointer'}}>
                            Add Branch
                        </button>
                        {renderBlockActions}
                    </div>
                </div>
            </div>
        );
    }
}

export default Block
