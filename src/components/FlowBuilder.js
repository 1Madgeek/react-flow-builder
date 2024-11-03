import React, {Component} from "react";
import '../assets/css/flowy.css';
import NodePanel from "./NodePanel";
import IconPlus from "../assets/icon/IconPlus";
import IconX from "../assets/icon/IconX";
import Node from "./nodes/Node";
import IconSquarePlus from "../assets/icon/IconSquarePlus";
import PropertyPanel from "./PropertyPanel";

class FlowBuilder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: this.props.nodes || [],
            edges: this.props.edges || [],
            dragging: null,
            canvasHeight: 600,
            offset: {x: 0, y: 0},
            activeNode: null,
            activeLinkPosition: null,
            spaceDown: false,
            isNodePanelOpen: false,
            isPropertyPanelOpen: false,
        };
    }

    componentDidMount() {
        this.initializeCanvas()

        //  Event listeners for key down and key up to detect space bar press
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        // Clean up event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Initializes the canvas with a starting node.
     */
    initializeCanvas = () => {
        if (!this.state.nodes.length) {
            const initialNodes = [
                {
                    id: 0,
                    position: {x: 50, y: 50},
                    type: 'start',
                    linkedNodes: []
                },
            ];

            this.setState({
                nodes: initialNodes,
                edges: [],
            }, this.arrangeNodes);
        }
    }

    /**
     * Handles the key down events to detect the space bar press and prevent default behavior.
     * @param {KeyboardEvent} e - The keyboard event triggered on keydown.
     */
    handleKeyDown = (e) => {
        // Check if the space bar is pressed
        if (e.code === 'Space') {
            e.preventDefault();
            this.setState({spaceDown: true});
        }
    };

    /**
     * Handles the key up events to reset the space bar state when it is released.
     * @param {KeyboardEvent} e - The keyboard event triggered on keyup.
     */
    handleKeyUp = (e) => {
        // Reset the space bar state when key is released
        if (e.code === 'Space') {
            this.setState({spaceDown: false});
        }
    };

    /**
     * Selects a node and opens the appropriate panel based on the type.
     * @param {number} nodeId - The ID of the node to be selected.
     * @param {string} [type='node'] - The type of panel to open ('node' or 'property').
     */
    selectNode = (nodeId, type = 'node') => {
        const node = this.getNode(nodeId);
        this.setState({
            isNodePanelOpen: type === 'node',
            isPropertyPanelOpen: type === 'property',
            activeNode: node
        });
    }

    /**
     * Handles the selection of a node based on its type during node panel interactions.
     * @param {number} nodeId - The ID of the node being selected.
     * @param {string} type - The type of node action (e.g., 'branch', 'end').
     */
    handleNodeSelect = (nodeId, type) => {
        switch (type) {
            case 'branch':
                this.addBranch(nodeId);
                break;
            case 'end':
                this.addNode(nodeId, 'end');
                break;
            case 'default':
            default:
                this.addNode(nodeId);
                break;
        }
    }

    /**
     * Closes any open node panels, resetting their state.
     */
    handlePanelCollapse = () => {
        this.setState({
            isNodePanelOpen: false,
            isPropertyPanelOpen: false,
            activeNode: null
        });
    }

    /**
     * Submits the property panel input. (Currently not implemented)
     * @param {number} nodeId - The ID of the node being edited.
     * @param {object} value - The new property value to update the node with.
     */
    handlePropertyPanelSubmit = (nodeId, value) => {
        // TODO: Implement property panel submit logic
    };

    /**
     * Rearranges the nodes horizontally centered within the canvas.
     */
    arrangeNodes = () => {
        const {nodes} = this.state;
        const {flow} = this.props;

        const nodeWidth = 318;

        // Get the actual dimensions of the canvas div
        const canvasElement = document.querySelector('.canvas');
        const canvasWidth = canvasElement?.offsetWidth || 800;

        // Calculate the horizontal bounds of your nodes
        const leftmost = Math.min(...nodes.map(node => node.position.x));
        const rightmost = Math.max(...nodes.map(node => node.position.x)) + nodeWidth;

        const layoutWidth = rightmost - leftmost;

        // Calculate the offset needed to center the layout horizontally
        const offsetX = (canvasWidth - layoutWidth) / 2 - leftmost;

        const centeredNodes = nodes.map((node) => {
            return {
                ...node,
                position: {
                    x: node.position.x + offsetX,
                    y: node.position.y, // Keep the y position as it is to respect topmost placement
                },
            };
        });

        // Set new node positions
        this.setState({nodes: centeredNodes}, this.renderConnections);
    };

    /**
     * Handles mouse down event for initiating dragging of a node or the entire canvas.
     * @param {MouseEvent} event - The mouse event triggered on mousedown.
     * @param {number} nodeId - The ID of the node being dragged.
     */
    handleMouseDown = (event, nodeId) => {
        const {allowDragging} = this.props;
        const {spaceDown} = this.state;

        if (spaceDown) {
            // Initiate canvas dragging
            this.setState({
                dragging: 'canvas',
                initialClick: {x: event.clientX, y: event.clientY},
                initialPositions: this.state.nodes.map((node) => ({...node})),
            });
        } else if (allowDragging) {
            // Handle individual node dragging
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            this.setState({
                dragging: nodeId,
                offset: {
                    x: mouseX - this.getNode(nodeId).position.x,
                    y: mouseY - this.getNode(nodeId).position.y,
                },
            });
        }
    };

    /**
     * Handles mouse move event to update position of nodes or the canvas during dragging.
     * @param {MouseEvent} event - The mouse event triggered on mousemove.
     */
    handleMouseMove = (event) => {
        const {dragging, initialClick, initialPositions} = this.state;
        if (dragging) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            if (dragging === 'canvas') {
                // Move the entire canvas
                const dx = mouseX - initialClick.x;
                const dy = mouseY - initialClick.y;
                this.setState(
                    (prevState) => ({
                        nodes: initialPositions.map((node) => ({
                            ...node,
                            position: {
                                x: node.position.x + dx,
                                y: node.position.y + dy,
                            },
                        })),
                    }),
                    this.renderConnections
                );
            } else {
                // Move a single node
                this.setState(
                    (prevState) => ({
                        nodes: prevState.nodes.map((node) => {
                            if (node.id === dragging) {
                                return {
                                    ...node,
                                    position: {
                                        x: mouseX - prevState.offset.x,
                                        y: mouseY - prevState.offset.y,
                                    },
                                };
                            }
                            return node;
                        }),
                    }),
                    this.renderConnections
                );
            }
        }
    };

    /**
     * Resets the dragging state on mouse up event, stopping node or canvas dragging.
     */
    handleMouseUp = () => {
        this.setState({
            dragging: null,
            initialClick: null,
            initialPositions: null,
            activeNode: null,
        });
    };

    /**
     * Adds a new branch to the workflow from a specified node, creating a new set of linked nodes.
     * @param {number} prevNodeId - The ID of the node from which the branch originates.
     */
    addBranch = (prevNodeId) => {
        const {nodes} = this.state;

        const prevNode = this.getNode(prevNodeId);
        if (!prevNode) return;

        // Define the new branch node
        const branchNode = {
            id: nodes.length + 1,
            position: {x: prevNode.position.x, y: prevNode.position.y + 220},
            type: 'branch',
            linkedNodes: [],
        };

        // Define positive and negative child nodes
        const positiveChild = {
            id: nodes.length + 2,
            position: {x: branchNode.position.x - 250, y: branchNode.position.y + 220},
            type: 'default',
            linkedNodes: [],
        };

        const negativeChild = {
            id: nodes.length + 3,
            position: {x: branchNode.position.x + 250, y: branchNode.position.y + 220},
            type: 'default',
            linkedNodes: [],
        };

        // Establish connections (edges) from the branch node to children
        const newEdges = [
            {from: branchNode.id, to: positiveChild.id, type: 'positive'},
            {from: branchNode.id, to: negativeChild.id, type: 'negative'},
            {from: prevNodeId, to: branchNode.id}
        ];

        this.setState((prevState) => ({
            isNodePanelOpen: false,
            activeNode: null,
            nodes: [...prevState.nodes, branchNode, positiveChild, negativeChild],
            edges: [...prevState.edges, ...newEdges],
        }), this.renderConnections);
    };

    /**
     * Converts a node to a branch type, managing its children nodes.
     * @param {number} branchId - The ID of the node to convert into a branch node.
     */
    convertToBranchNode = (branchId) => {
        const {nodes, edges} = this.state;
        const branchNode = this.getNode(branchId);

        if (!branchNode || branchNode.type === 'branch') {
            alert("Node is already a branch or invalid.");
            return;
        }

        // Locate existing direct descendants
        const directDescendants = edges.filter(link => link.from === branchId).map(link => link.to);

        if (directDescendants.length > 2) {
            alert("Cannot convert to branch: Node already has more than two descendants.");
            return;
        }

        let positiveChild, negativeChild;
        const newChildren = [];

        if (directDescendants.length === 0) {
            // No children, prepare both positive and negative children
            positiveChild = {
                id: nodes.length + 1,
                position: {x: branchNode.position.x - 250, y: branchNode.position.y + 170},
                type: 'default',
                linkedNodes: [],
            };
            negativeChild = {
                id: nodes.length + 2,
                position: {x: branchNode.position.x + 250, y: branchNode.position.y + 170},
                type: 'default',
                linkedNodes: [],
            };
            newChildren.push(positiveChild, negativeChild);

        } else if (directDescendants.length === 1) {
            // Existing descendant becomes positive, create a new negative
            positiveChild = this.getNode(directDescendants[0]);
            negativeChild = {
                id: nodes.length + 1,
                position: {x: branchNode.position.x + 500, y: branchNode.position.y + 170},
                type: 'default',
                linkedNodes: [],
            };
            newChildren.push(negativeChild);

        } else {
            // Two children already - assume ordered for positive and negative
            positiveChild = this.getNode(directDescendants[0]);
            negativeChild = this.getNode(directDescendants[1]);
        }

        const newBranchNode = {
            ...branchNode,
            type: 'branch',
            linkedNodes: [positiveChild.id, negativeChild.id],
        };

        // Update state with new branch node
        this.setState((prevState) => ({
            nodes: prevState.nodes.map(node =>
                node.id === branchId ? newBranchNode : node
            ).concat(newChildren),
            edges: prevState.edges.concat(newChildren.map(child => ({
                from: branchId,
                to: child.id,
                type: child === positiveChild ? 'positive' : 'negative',
            }))),
        }), this.arrangeNodes);
    };

    /**
     * Handles link click interactions to either create edges or store the current active link position.
     * @param {string} position - The position where the link originates.
     * @param {number} nodeId - The ID of the node where the link interaction occurred.
     */
    handleLinkClick = (position, nodeId) => {
        const {activeLinkPosition} = this.state;

        if (activeLinkPosition) {
            if (activeLinkPosition.nodeId !== nodeId) {
                this.linkNodes(activeLinkPosition, nodeId, position);
                this.setState({activeLinkPosition: null});
            }
        } else {
            this.setState({activeLinkPosition: {nodeId, position}});
        }
    };

    /**
     * edges two nodes together while ensuring there are no duplicate or invalid edges.
     * @param {object} fromData - Contains node ID and position of the start of the link.
     * @param {number} toId - The ID of the node to which the link is directed.
     * @param {string} toPosition - The position on the 'to' node where the link should connect.
     */
    linkNodes = (fromData, toId, toPosition) => {
        const {edges, nodes} = this.state;
        const {nodeId, position} = fromData;

        this.setState((prevState) => {
            const fromNode = this.getNode(nodeId);
            const toNode = this.getNode(toId);

            if (!fromNode || !toNode) {
                alert('Invalid nodes specified for linking.');
                return prevState;
            }

            // Ensure no duplicate edges between the same two nodes
            const linkExists = edges.some(link =>
                (link.from === nodeId && link.to === toId) ||
                (link.to === nodeId && link.from === toId)
            );
            if (linkExists) {
                alert('A link between these two nodes already exists.');
                return prevState;
            }

            // Prevent linking immediate children back to their branch parent
            const toNodeParentLink = edges.find(link => link.to === nodeId);
            const toNodeParentId = toNodeParentLink?.from;
            const toNodeParentNode = this.getNode(toNodeParentId);

            if (toNodeParentNode?.type === 'branch' && toNodeParentId === toId) {
                alert('Cannot link immediate child to the parent branch node.');
                return prevState;
            }

            // Prevent linking if both are children of the same parent branch node
            const fromParent = edges.find(link => link.to === nodeId)?.from;
            const toParent = edges.find(link => link.to === toId)?.from;
            const fromParentNode = this.getNode(fromParent);
            const toParentNode = this.getNode(toParent);

            if (fromParent === toParent && fromParentNode?.type === 'branch') {
                alert('Cannot link immediate children of the same branch.');
                return prevState;
            }

            // Check for any circular paths
            // const isCircularLink = (startId, targetId, visited = new Set()) => {
            //     if (visited.has(startId)) return false;
            //     visited.add(startId);
            //
            //     return prevState.edges.some(link =>
            //         link.from === startId && (link.to === targetId || isCircularLink(link.to, targetId, visited))
            //     );
            // };
            //
            // if (isCircularLink(toId, nodeId)) {
            //     alert('Cannot create circular edges.');
            //     return prevState;
            // }

            // Update node edges
            const updatedNodes = nodes.map(node => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        linkedNodes: [...node.linkedNodes, {id: toId, fromPosition: position, toPosition}],
                    };
                }
                return node;
            });

            // Add the new link
            const newLink = {from: nodeId, to: toId, fromPosition: position, toPosition};

            return {
                nodes: updatedNodes,
                edges: [...edges, newLink],
            };
        }, this.renderConnections);
    };

    /**
     * Adds a new node connected to a specified previous node.
     * @param {number} prevNodeId - The ID of the node to which the new node will be linked.
     * @param {string} [type='default'] - The type of node to add.
     */
    addNode = (prevNodeId, type = 'default') => {
        // Retrieve previous node's position for calculation
        const prevNode = this.getNode(prevNodeId);
        if (!prevNode) return;

        const {nodes, edges} = this.state;

        const nodeWidth = 100;
        const scrollY = nodeWidth + 120;

        // Determine new node position relative to the previous node
        const newNodePosition = {
            x: prevNode.position.x,
            y: prevNode.position.y + scrollY,
        };

        // Create new node with a unique ID
        const newNode = {
            id: nodes.length + 1,
            position: newNodePosition,
            type: type,
            linkedNodes: [],
        };

        // Update the edges: from previous node to the new node
        const newLink = {
            from: prevNodeId,
            to: newNode.id,
        };

        // Update state with new node and link
        this.setState((prevState) => ({
            isNodePanelOpen: false,
            activeNode: null,
            nodes: [...prevState.nodes, newNode],
            edges: [...prevState.edges, newLink],
        }), this.renderConnections);
    };

    /**
     * Inserts a node between two existing linked nodes.
     * @param {number} fromId - The ID of the starting node of the existing link.
     * @param {number} toId - The ID of the ending node of the existing link.
     */
    addNodeBetween = (fromId, toId) => {
        const fromNodeIndex = this.state.nodes.findIndex(node => node.id === fromId);
        const toNodeIndex = this.state.nodes.findIndex(node => node.id === toId);

        if (fromNodeIndex < 0 || toNodeIndex < 0 || fromNodeIndex === toNodeIndex) return;

        // Find necessary node positions
        const fromNode = this.state.nodes[fromNodeIndex];
        const toNode = this.state.nodes[toNodeIndex];

        const newPosition = {
            x: (fromNode.position.x + toNode.position.x) / 2,
            y: (fromNode.position.y + toNode.position.y) / 2 + 120,
        };

        const newNode = {
            id: this.state.nodes.length + 1,
            position: newPosition,
            type: 'default',
            linkedNodes: [],
        };

        // Insert new node into the nodes array
        const updatedNodes = [
            ...this.state.nodes.slice(0, toNodeIndex),
            newNode,
            ...this.state.nodes.slice(toNodeIndex)
        ];

        // Remove the existing link between fromId and toId
        const updatedEdges = this.state.edges.filter(
            link => !(link.from === fromId && link.to === toId)
        );

        // Add new edges
        updatedEdges.push({from: fromId, to: newNode.id});
        updatedEdges.push({from: newNode.id, to: toId});

        const nodeHeight = 100;

        this.shiftNodesDown(toId, updatedNodes, updatedEdges, nodeHeight);

        this.setState({
            nodes: updatedNodes,
            edges: updatedEdges,
        }, this.renderConnections);
    };

    /**
     * Converts a node to an end node, ensuring no descendants remain linked.
     * @param {number} nodeId - The ID of the node to be converted to the end type.
     */
    convertToEndNode = (nodeId) => {
        const {nodes, edges} = this.state;
        const node = this.getNode(nodeId);

        if (node?.type === 'end') return; // Already an end node

        // Remove all descendants if any
        const descendants = this.findDescendants(nodeId);
        const nodesToKeep = nodes.filter(b => !descendants.includes(b.id));
        const edgesToKeep = edges.filter(link => !descendants.includes(link.from));

        const updatedNode = {...node, type: 'end', linkedNodes: []};

        this.setState({
            nodes: nodesToKeep.map(b => b.id === nodeId ? updatedNode : b),
            edges: edgesToKeep,
        }, this.renderConnections);
    };

    /**
     * Reverts an end node back to the default type.
     * @param {number} nodeId - The ID of the end node to be converted.
     */
    convertEndToDefaultNode = (nodeId) => {
        this.setState((prevState) => ({
            nodes: prevState.nodes.map(node =>
                node.id === nodeId && node.type === 'end'
                    ? {...node, type: 'default'}
                    : node
            ),
        }), this.renderConnections);
    };

    /**
     * Renders the connection lines between nodes, handling their SVG paths and optional interaction buttons.
     */
    renderConnections = () => {
        const {nodes, edges} = this.state;
        const nodeWidth = 318;
        const nodeHeight = 100;

        if (this.props.onUpdate) {
            this.props.onUpdate(nodes, edges)
        }

        return edges.map((link, index) => {
            const fromNode = this.getNode(link.from);
            const toNode = this.getNode(link.to);

            if (!fromNode || !toNode) return null;

            // Dynamically find node height
            const fromNodeElement = document.getElementById(`node-${fromNode.id}`);
            const toNodeElement = document.getElementById(`node-${toNode.id}`);

            const nodeActualHeight = fromNodeElement?.offsetHeight || nodeHeight;

            let fromX = fromNode.position.x + nodeWidth / 2;
            let fromY = fromNode.position.y + nodeActualHeight;
            let toX = toNode.position.x + nodeWidth / 2;
            let toY = toNode.position.y;

            const {fromPosition, toPosition} = link;
            // Calculate specific from/to positions if specified
            switch (fromPosition) {
                case 'top':
                    fromY = fromNode.position.y;
                    break;
                case 'right':
                    fromX = fromNode.position.x + nodeWidth;
                    fromY = fromNode.position.y + nodeHeight / 2;
                    break;
                case 'bottom':
                    fromY = fromNode.position.y + nodeHeight;
                    break;
                case 'left':
                    fromX = fromNode.position.x;
                    fromY = fromNode.position.y + nodeHeight / 2;
                    break;
                default:
                    break;
            }

            switch (toPosition) {
                case 'top':
                    toY = toNode.position.y;
                    break;
                case 'right':
                    toX = toNode.position.x + nodeWidth;
                    toY = toNode.position.y + nodeHeight / 2;
                    break;
                case 'bottom':
                    toY = toNode.position.y + nodeHeight;
                    break;
                case 'left':
                    toX = toNode.position.x;
                    toY = toNode.position.y + nodeHeight / 2;
                    break;
                default:
                    break;
            }

            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;

            const isBranchPath = fromNode.type === 'branch';
            const path = isBranchPath
                ? `M${fromX} ${fromY} L${fromX} ${(fromY + 40)} L${toX} ${(fromY + 40)} L${toX} ${toY}`
                : `M${fromX},${fromY} C${fromX},${fromY + 50} ${toX},${toY - 50} ${toX},${toY}`;

            return (
                <div
                    key={`${link.from}-${link.to}`}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: Math.abs(toX - fromX),
                        height: Math.abs(toY - fromY) + 50,
                        pointerEvents: 'none',
                    }}
                >
                    <svg
                        style={{
                            overflow: 'visible',
                        }}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d={path} stroke="#C5CCD0" strokeWidth="2"/>
                        <path
                            d={`M${toX - 5},${toY - 5} L${toX},${toY} L${toX + 5},${toY - 5}`}
                            fill="#C5CCD0"
                        />
                    </svg>
                    {!isBranchPath && (
                        <>
                            <button
                                className="add-button node-between"
                                onClick={() => this.addNodeBetween(link.from, link.to)}
                                style={{
                                    position: 'absolute',
                                    left: midX - 15,
                                    top: midY - 25,
                                    zIndex: 2,
                                    pointerEvents: 'all',
                                }}
                            >
                                <IconSquarePlus width={20} height={20}/>
                            </button>
                            <button
                                className="remove-button"
                                onClick={() => this.removeLink(link.from, link.to)}
                                style={{
                                    position: 'absolute',
                                    left: midX - 15,
                                    top: midY + 15,
                                    zIndex: 2,
                                    pointerEvents: 'all',
                                }}
                            >
                                <IconX width={20} height={20}/>
                            </button>
                        </>
                    )}
                </div>
            );
        }).concat(
            nodes.map((node) => {
                const isLastNode = !edges.some(link => link.from === node.id);
                if (!isLastNode || node.type === 'end') return null; // Skip rendering for end node or if it is not the last in the chain

                const nodeElement = document.getElementById(`node-${node.id}`);
                const nodeActualHeight = nodeElement?.offsetHeight || 130;

                const x = node.position.x + nodeWidth / 2;
                const y = node.position.y + nodeActualHeight;

                return (
                    <button
                        key={`last-${node.id}`}
                        className="add-button"
                        onClick={() => this.selectNode(node.id, 'node')}
                        style={{
                            position: 'absolute',
                            left: x - 15,
                            top: y + 20,
                            zIndex: 2,
                            pointerEvents: 'all',
                        }}
                    >
                        <IconPlus width={20} height={20}/>
                    </button>
                );
            })
        );
    };

    /**
     * Finds and returns all descendant node IDs of a given node recursively.
     * @param {number} nodeId - The ID of the node whose descendants are to be found.
     * @param {Array} updatedEdges - Optional, allows for passing a specific set of edges for traversal.
     * @returns {Array} - List of descendant node IDs.
     */
    findDescendants = (nodeId, updatedEdges = []) => {
        if (!updatedEdges.length) {
            updatedEdges = this.state.edges;
        }
        const visited = new Set();  // To track visited nodes and prevent cycles
        const collectDescendants = (id) => {
            if (visited.has(id)) return [];
            visited.add(id);

            let descendants = [];
            updatedEdges.forEach(link => {
                if (link.from === id) {
                    descendants.push(link.to);
                    descendants.push(...collectDescendants(link.to));
                }
            });

            return descendants;
        };

        return collectDescendants(nodeId);
    };

    /**
     * Removes a node and all its descendants from the canvas.
     * @param {number} nodeId - The ID of the node to be removed.
     */
    removeNodeAndDescendants = (nodeId) => {
        const {nodes, edges} = this.state;

        // Check if the node is directly linked from a branch
        const isLinkedFromBranch = edges.some(link =>
            link.to === nodeId && this.getNode(link.from)?.type === 'branch'
        );

        if (isLinkedFromBranch) {
            alert('Cannot delete a node that is part of a branch connection.');
            return; // Skip deleting if it's linked from a branch
        }

        // Collect all nodes to be deleted
        const descendants = this.findDescendants(nodeId);
        const nodesToDelete = [nodeId, ...descendants];

        // Update nodes and edges excluding these
        const updatedNodes = nodes.filter(node => !nodesToDelete.includes(node.id));
        const updatedEdges = edges.filter(link => !(nodesToDelete.includes(link.from) || nodesToDelete.includes(link.to)));

        this.setState({
            nodes: updatedNodes,
            edges: updatedEdges,
        }, this.renderConnections);
    };

    /**
     * Recursively shifts nodes down to make space for new additions in the workflow.
     *
     * @param {number} startNodeId - The ID of the node from where the shift should start.
     * @param {Array} updatedNodes - The array of updated nodes that need to be shifted.
     * @param {Array} updatedEdges - The array of updated edges to find descendants.
     * @param {number} [nodeHeight=100] - The assumed height of each node.
     */
    shiftNodesDown = (startNodeId, updatedNodes, updatedEdges, nodeHeight = 100) => {
        const shiftY = nodeHeight + 170;
        const seenNodes = new Set();

        const shiftRecursive = (nodeId) => {
            // Base condition: check for cycles or already shifted nodes
            if (seenNodes.has(nodeId)) return;
            seenNodes.add(nodeId);

            // Find the node to shift
            const node = updatedNodes.find(node => node.id === nodeId);
            if (!node) return;

            // Apply the shift downward
            node.position.y += shiftY;

            // Identify and shift its direct descendants
            updatedEdges.forEach(link => {
                if (link.from === nodeId) {
                    shiftRecursive(link.to);
                }
            });
        };


        shiftRecursive(startNodeId);
    };

    /**
     * Renders node-specific action buttons based on conditions like type and descendant presence.
     * @param {number} nodeId - The ID of the node for which actions are to be rendered.
     */
    renderNodeActions = (nodeId) => {
        const {edges} = this.state;
        const node = this.getNode(nodeId)
        if (node.type === 'start') return null; // Don't allow deletion of these

        // Determine if the node is directly linked as a child of a branch
        const isDirectBranchDescendant = edges.some(link =>
            link.to === node.id &&
            this.getNode(link.from)?.type === 'branch'
        );
        const hasDescendants = this.findDescendants(nodeId).length

        return (
            <div className="node-actions">
                {!isDirectBranchDescendant && (
                    <button onClick={() => this.removeNodeAndDescendants(node.id)}>
                        Remove Node
                    </button>
                )}

                {!hasDescendants && (
                    <>
                        {node.type === 'default' && (
                            <button onClick={() => this.convertToEndNode(nodeId)}>
                                Convert to End Node
                            </button>
                        )}
                        {node.type === 'end' && (
                            <button onClick={() => this.convertEndToDefaultNode(nodeId)}>
                                Convert to Default Node
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    };

    /**
     * Removes a specified link between two nodes and checks for any nodes that become disjoint.
     * @param {number} fromId - The ID of the node where the link starts.
     * @param {number} toId - The ID of the node where the link ends.
     */
    removeLink = (fromId, toId) => {
        const {nodes, edges} = this.state;

        // Remove the specified link
        const updatedEdges = edges.filter(link => !(link.from === fromId && link.to === toId));

        // Helper function to detect true disconnects
        const isDisjoint = (nodeId, edges) => {
            return !edges.some(link => link.to === nodeId);
        };


        // Check which nodes would become disjointed
        const nodesToRemove = [];
        if (isDisjoint(toId, updatedEdges)) {
            nodesToRemove.push(toId, ...this.findDescendants(toId, updatedEdges));
        }

        // Only remove nodes that are truly isolated
        const updatedNodes = nodes.filter(node => !nodesToRemove.includes(node.id));
        const validEdges = updatedEdges.filter(link =>
            updatedNodes.some(node => node.id === link.from) &&
            updatedNodes.some(node => node.id === link.to)
        );

        this.setState({
            nodes: updatedNodes,
            edges: validEdges,
        }, this.renderConnections);
    };

    /**
     * Retrieves a node object from the current state by its ID.
     * @param {number} id - The ID of the node to be retrieved.
     * @returns {object|null} - The node object if found, otherwise null.
     */
    getNode = (id) => {
        return this.state.nodes.find((node) => node.id === id);
    };

    /**
     * Renders the main structure of the FlowBuilder component, including the panels, nodes, and connections.
     * @returns {JSX.Element} - The main component structure rendered as JSX.
     */
    render() {
        const {canvasHeight, isNodePanelOpen, isPropertyPanelOpen, activeNode, spaceDown, dragging} = this.state;
        const cursorStyle = spaceDown
            ? dragging === 'canvas'
                ? 'grabbing'
                : 'grab'
            : 'default'; // Default cursor when not interacting with the canvas

        return (
            <div className="canvas-container">
                {isNodePanelOpen && (
                    <NodePanel
                        node={activeNode}
                        closePanel={this.handlePanelCollapse}
                        handleNodeSelect={this.handleNodeSelect}
                    />
                )}
                <div
                    className="canvas"
                    style={{
                        cursor: cursorStyle,
                        // height: `${canvasHeight}px`,
                    }}
                    onMouseUp={this.handleMouseUp}
                    onMouseMove={this.handleMouseMove}
                >
                    <div className="connections">{this.renderConnections()}</div>
                    {this.state.nodes.map((node) => (
                        <Node
                            key={node.id}
                            node={node}
                            onMouseDown={(event) => this.handleMouseDown(event, node.id)}
                            onLinkClick={(position) => this.handleLinkClick(position, node.id)}
                            convertToBranchNode={() => this.convertToBranchNode(node.id)}
                            addBranch={() => this.addBranch(node.id)}
                            renderNodeActions={this.renderNodeActions(node.id)}
                            activeLinkPosition={
                                this.state.activeLinkPosition?.nodeId === node.id
                                    ? this.state.activeLinkPosition.position
                                    : null
                            }
                            isActive={activeNode?.id === node.id}
                            onClick={() => this.selectNode(node.id, 'property')}
                        />
                    ))}
                </div>
                {isPropertyPanelOpen && (
                    <PropertyPanel node={activeNode}
                                   closePanel={this.handlePanelCollapse}
                                   onSubmit={this.handlePropertyPanelSubmit}
                                   renderPropertyPanel={this.props.renderPropertyPanel}
                    />
                )}
            </div>
        );
    }
}

export default FlowBuilder;
