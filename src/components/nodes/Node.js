import React, {Component} from "react";
import DefaultNode from "./DefaultNode";
import StartNode from "./StartNode";
import BranchNode from "./BranchNode";
import EndNode from "./EndNode";

class Node extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {node} = this.props;
        switch (node.type) {
            case 'start':
                return <StartNode {...this.props}/>
            case 'end':
                return <EndNode {...this.props}/>
            case 'branch':
                return <BranchNode {...this.props}/>
            default:
                return <DefaultNode {...this.props}/>
        }
    }
}

export default Node
