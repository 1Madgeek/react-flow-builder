import React, {Component} from "react";
import DefaultBlock from "./DefaultBlock";
import StartBlock from "./StartBlock";
import BranchBlock from "./BranchBlock";
import EndBlock from "./EndBlock";

class Block extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {block} = this.props;
        switch (block.type) {
            case 'start':
                return <StartBlock {...this.props}/>
            case 'end':
                return <EndBlock {...this.props}/>
            case 'branch':
                return <BranchBlock {...this.props}/>
            default:
                return <DefaultBlock {...this.props}/>
        }
    }
}

export default Block
