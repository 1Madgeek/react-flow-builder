import React, {Component} from "react";
import '../assets/css/flowy.css';
import BlockPanel from "./BlockPanel";
import IconPlus from "../assets/icon/IconPlus";
import IconX from "../assets/icon/IconX";
import Block from "./blocks/Block";
import IconSquarePlus from "../assets/icon/IconSquarePlus";
import PropertyPanel from "./PropertyPanel";

class FlowBuilder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blocks: [],
            links: [],
            dragging: null,
            canvasHeight: 600,
            offset: {x: 0, y: 0},
            activeBlock: null,
            activeLinkPosition: null,
            spaceDown: false,
            isBlockPanelOpen: false,
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
     * Initializes the canvas with a starting block.
     */
    initializeCanvas = () => {
        const initialBlocks = [
            {
                id: 0,
                position: {x: 50, y: 50},
                type: 'start',
                linkedBlocks: []
            },
        ];

        this.setState({
            blocks: initialBlocks,
            links: [],
        }, this.arrangeBlocks);
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
     * Selects a block and opens the appropriate panel based on the type.
     * @param {number} blockId - The ID of the block to be selected.
     * @param {string} [type='block'] - The type of panel to open ('block' or 'property').
     */
    selectBlock = (blockId, type = 'block') => {
        const block = this.getBlock(blockId);
        this.setState({
            isBlockPanelOpen: type === 'block',
            isPropertyPanelOpen: type === 'property',
            activeBlock: block
        });
    }

    /**
     * Handles the selection of a block based on its type during block panel interactions.
     * @param {number} blockId - The ID of the block being selected.
     * @param {string} type - The type of block action (e.g., 'branch', 'end').
     */
    handleBlockSelect = (blockId, type) => {
        switch (type) {
            case 'branch':
                this.addBranch(blockId);
                break;
            case 'end':
                this.addBlock(blockId, 'end');
                break;
            case 'default':
            default:
                this.addBlock(blockId);
                break;
        }
    }

    /**
     * Closes any open block panels, resetting their state.
     */
    handlePanelCollapse = () => {
        this.setState({
            isBlockPanelOpen: false,
            isPropertyPanelOpen: false,
            activeBlock: null
        });
    }

    /**
     * Submits the property panel input. (Currently not implemented)
     * @param {number} blockId - The ID of the block being edited.
     * @param {object} value - The new property value to update the block with.
     */
    handlePropertyPanelSubmit = (blockId, value) => {
        // TODO: Implement property panel submit logic
    };

    /**
     * Rearranges the blocks horizontally centered within the canvas.
     */
    arrangeBlocks = () => {
        const {blocks} = this.state;
        const {flow} = this.props;

        const blockWidth = 318;

        // Get the actual dimensions of the canvas div
        const canvasElement = document.querySelector('.canvas');
        const canvasWidth = canvasElement?.offsetWidth || 800;

        // Calculate the horizontal bounds of your blocks
        const leftmost = Math.min(...blocks.map(block => block.position.x));
        const rightmost = Math.max(...blocks.map(block => block.position.x)) + blockWidth;

        const layoutWidth = rightmost - leftmost;

        // Calculate the offset needed to center the layout horizontally
        const offsetX = (canvasWidth - layoutWidth) / 2 - leftmost;

        const centeredBlocks = blocks.map((block) => {
            return {
                ...block,
                position: {
                    x: block.position.x + offsetX,
                    y: block.position.y, // Keep the y position as it is to respect topmost placement
                },
            };
        });

        // Set new block positions
        this.setState({blocks: centeredBlocks}, this.renderConnections);
    };

    /**
     * Handles mouse down event for initiating dragging of a block or the entire canvas.
     * @param {MouseEvent} event - The mouse event triggered on mousedown.
     * @param {number} blockId - The ID of the block being dragged.
     */
    handleMouseDown = (event, blockId) => {
        const {allowDragging} = this.props;
        const {spaceDown} = this.state;

        if (spaceDown) {
            // Initiate canvas dragging
            this.setState({
                dragging: 'canvas',
                initialClick: {x: event.clientX, y: event.clientY},
                initialPositions: this.state.blocks.map((block) => ({...block})),
            });
        } else if (allowDragging) {
            // Handle individual block dragging
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            this.setState({
                dragging: blockId,
                offset: {
                    x: mouseX - this.getBlock(blockId).position.x,
                    y: mouseY - this.getBlock(blockId).position.y,
                },
            });
        }
    };

    /**
     * Handles mouse move event to update position of blocks or the canvas during dragging.
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
                        blocks: initialPositions.map((block) => ({
                            ...block,
                            position: {
                                x: block.position.x + dx,
                                y: block.position.y + dy,
                            },
                        })),
                    }),
                    this.renderConnections
                );
            } else {
                // Move a single block
                this.setState(
                    (prevState) => ({
                        blocks: prevState.blocks.map((block) => {
                            if (block.id === dragging) {
                                return {
                                    ...block,
                                    position: {
                                        x: mouseX - prevState.offset.x,
                                        y: mouseY - prevState.offset.y,
                                    },
                                };
                            }
                            return block;
                        }),
                    }),
                    this.renderConnections
                );
            }
        }
    };

    /**
     * Resets the dragging state on mouse up event, stopping block or canvas dragging.
     */
    handleMouseUp = () => {
        this.setState({
            dragging: null,
            initialClick: null,
            initialPositions: null,
            activeBlock: null,
        });
    };

    /**
     * Adds a new branch to the workflow from a specified block, creating a new set of linked blocks.
     * @param {number} prevBlockId - The ID of the block from which the branch originates.
     */
    addBranch = (prevBlockId) => {
        const {blocks} = this.state;

        const prevBlock = this.getBlock(prevBlockId);
        if (!prevBlock) return;

        // Define the new branch block
        const branchBlock = {
            id: blocks.length + 1,
            position: {x: prevBlock.position.x, y: prevBlock.position.y + 220},
            type: 'branch',
            linkedBlocks: [],
        };

        // Define positive and negative child blocks
        const positiveChild = {
            id: blocks.length + 2,
            position: {x: branchBlock.position.x - 250, y: branchBlock.position.y + 220},
            type: 'default',
            linkedBlocks: [],
        };

        const negativeChild = {
            id: blocks.length + 3,
            position: {x: branchBlock.position.x + 250, y: branchBlock.position.y + 220},
            type: 'default',
            linkedBlocks: [],
        };

        // Establish connections (links) from the branch block to children
        const newLinks = [
            {from: branchBlock.id, to: positiveChild.id, type: 'positive'},
            {from: branchBlock.id, to: negativeChild.id, type: 'negative'},
            {from: prevBlockId, to: branchBlock.id}
        ];

        this.setState((prevState) => ({
            isBlockPanelOpen: false,
            activeBlock: null,
            blocks: [...prevState.blocks, branchBlock, positiveChild, negativeChild],
            links: [...prevState.links, ...newLinks],
        }), this.renderConnections);
    };

    /**
     * Converts a block to a branch type, managing its children blocks.
     * @param {number} branchId - The ID of the block to convert into a branch block.
     */
    convertToBranchBlock = (branchId) => {
        const {blocks, links} = this.state;
        const branchBlock = this.getBlock(branchId);

        if (!branchBlock || branchBlock.type === 'branch') {
            alert("Block is already a branch or invalid.");
            return;
        }

        // Locate existing direct descendants
        const directDescendants = links.filter(link => link.from === branchId).map(link => link.to);

        if (directDescendants.length > 2) {
            alert("Cannot convert to branch: Block already has more than two descendants.");
            return;
        }

        let positiveChild, negativeChild;
        const newChildren = [];

        if (directDescendants.length === 0) {
            // No children, prepare both positive and negative children
            positiveChild = {
                id: blocks.length + 1,
                position: {x: branchBlock.position.x - 250, y: branchBlock.position.y + 170},
                type: 'default',
                linkedBlocks: [],
            };
            negativeChild = {
                id: blocks.length + 2,
                position: {x: branchBlock.position.x + 250, y: branchBlock.position.y + 170},
                type: 'default',
                linkedBlocks: [],
            };
            newChildren.push(positiveChild, negativeChild);

        } else if (directDescendants.length === 1) {
            // Existing descendant becomes positive, create a new negative
            positiveChild = this.getBlock(directDescendants[0]);
            negativeChild = {
                id: blocks.length + 1,
                position: {x: branchBlock.position.x + 500, y: branchBlock.position.y + 170},
                type: 'default',
                linkedBlocks: [],
            };
            newChildren.push(negativeChild);

        } else {
            // Two children already - assume ordered for positive and negative
            positiveChild = this.getBlock(directDescendants[0]);
            negativeChild = this.getBlock(directDescendants[1]);
        }

        const newBranchBlock = {
            ...branchBlock,
            type: 'branch',
            linkedBlocks: [positiveChild.id, negativeChild.id],
        };

        // Update state with new branch block
        this.setState((prevState) => ({
            blocks: prevState.blocks.map(block =>
                block.id === branchId ? newBranchBlock : block
            ).concat(newChildren),
            links: prevState.links.concat(newChildren.map(child => ({
                from: branchId,
                to: child.id,
                type: child === positiveChild ? 'positive' : 'negative',
            }))),
        }), this.arrangeBlocks);
    };

    /**
     * Handles link click interactions to either create links or store the current active link position.
     * @param {string} position - The position where the link originates.
     * @param {number} blockId - The ID of the block where the link interaction occurred.
     */
    handleLinkClick = (position, blockId) => {
        const {activeLinkPosition} = this.state;

        if (activeLinkPosition) {
            if (activeLinkPosition.blockId !== blockId) {
                this.linkBlocks(activeLinkPosition, blockId, position);
                this.setState({activeLinkPosition: null});
            }
        } else {
            this.setState({activeLinkPosition: {blockId, position}});
        }
    };

    /**
     * Links two blocks together while ensuring there are no duplicate or invalid links.
     * @param {object} fromData - Contains block ID and position of the start of the link.
     * @param {number} toId - The ID of the block to which the link is directed.
     * @param {string} toPosition - The position on the 'to' block where the link should connect.
     */
    linkBlocks = (fromData, toId, toPosition) => {
        const {links, blocks} = this.state;
        const {blockId, position} = fromData;

        this.setState((prevState) => {
            const fromBlock = this.getBlock(blockId);
            const toBlock = this.getBlock(toId);

            if (!fromBlock || !toBlock) {
                alert('Invalid blocks specified for linking.');
                return prevState;
            }

            // Ensure no duplicate links between the same two blocks
            const linkExists = links.some(link =>
                (link.from === blockId && link.to === toId) ||
                (link.to === blockId && link.from === toId)
            );
            if (linkExists) {
                alert('A link between these two blocks already exists.');
                return prevState;
            }

            // Prevent linking immediate children back to their branch parent
            const toBlockParentLink = links.find(link => link.to === blockId);
            const toBlockParentId = toBlockParentLink?.from;
            const toBlockParentBlock = this.getBlock(toBlockParentId);

            if (toBlockParentBlock?.type === 'branch' && toBlockParentId === toId) {
                alert('Cannot link immediate child to the parent branch block.');
                return prevState;
            }

            // Prevent linking if both are children of the same parent branch block
            const fromParent = links.find(link => link.to === blockId)?.from;
            const toParent = links.find(link => link.to === toId)?.from;
            const fromParentBlock = this.getBlock(fromParent);
            const toParentBlock = this.getBlock(toParent);

            if (fromParent === toParent && fromParentBlock?.type === 'branch') {
                alert('Cannot link immediate children of the same branch.');
                return prevState;
            }

            // Check for any circular paths
            // const isCircularLink = (startId, targetId, visited = new Set()) => {
            //     if (visited.has(startId)) return false;
            //     visited.add(startId);
            //
            //     return prevState.links.some(link =>
            //         link.from === startId && (link.to === targetId || isCircularLink(link.to, targetId, visited))
            //     );
            // };
            //
            // if (isCircularLink(toId, blockId)) {
            //     alert('Cannot create circular links.');
            //     return prevState;
            // }

            // Update block links
            const updatedBlocks = blocks.map(block => {
                if (block.id === blockId) {
                    return {
                        ...block,
                        linkedBlocks: [...block.linkedBlocks, {id: toId, fromPosition: position, toPosition}],
                    };
                }
                return block;
            });

            // Add the new link
            const newLink = {from: blockId, to: toId, fromPosition: position, toPosition};

            return {
                blocks: updatedBlocks,
                links: [...links, newLink],
            };
        }, this.renderConnections);
    };

    /**
     * Adds a new block connected to a specified previous block.
     * @param {number} prevBlockId - The ID of the block to which the new block will be linked.
     * @param {string} [type='default'] - The type of block to add.
     */
    addBlock = (prevBlockId, type = 'default') => {
        // Retrieve previous block's position for calculation
        const prevBlock = this.getBlock(prevBlockId);
        if (!prevBlock) return;

        const {blocks, links} = this.state;

        const blockWidth = 100;
        const scrollY = blockWidth + 120;

        // Determine new block position relative to the previous block
        const newBlockPosition = {
            x: prevBlock.position.x,
            y: prevBlock.position.y + scrollY,
        };

        // Create new block with a unique ID
        const newBlock = {
            id: blocks.length + 1,
            position: newBlockPosition,
            type: type,
            linkedBlocks: [],
        };

        // Update the links: from previous block to the new block
        const newLink = {
            from: prevBlockId,
            to: newBlock.id,
        };

        // Update state with new block and link
        this.setState((prevState) => ({
            isBlockPanelOpen: false,
            activeBlock: null,
            blocks: [...prevState.blocks, newBlock],
            links: [...prevState.links, newLink],
        }), this.renderConnections);
    };

    /**
     * Inserts a block between two existing linked blocks.
     * @param {number} fromId - The ID of the starting block of the existing link.
     * @param {number} toId - The ID of the ending block of the existing link.
     */
    addBlockBetween = (fromId, toId) => {
        const fromBlockIndex = this.state.blocks.findIndex(block => block.id === fromId);
        const toBlockIndex = this.state.blocks.findIndex(block => block.id === toId);

        if (fromBlockIndex < 0 || toBlockIndex < 0 || fromBlockIndex === toBlockIndex) return;

        // Find necessary block positions
        const fromBlock = this.state.blocks[fromBlockIndex];
        const toBlock = this.state.blocks[toBlockIndex];

        const newPosition = {
            x: (fromBlock.position.x + toBlock.position.x) / 2,
            y: (fromBlock.position.y + toBlock.position.y) / 2 + 120,
        };

        const newBlock = {
            id: this.state.blocks.length + 1,
            position: newPosition,
            type: 'default',
            linkedBlocks: [],
        };

        // Insert new block into the blocks array
        const updatedBlocks = [
            ...this.state.blocks.slice(0, toBlockIndex),
            newBlock,
            ...this.state.blocks.slice(toBlockIndex)
        ];

        // Remove the existing link between fromId and toId
        const updatedLinks = this.state.links.filter(
            link => !(link.from === fromId && link.to === toId)
        );

        // Add new links
        updatedLinks.push({from: fromId, to: newBlock.id});
        updatedLinks.push({from: newBlock.id, to: toId});

        const blockHeight = 100;

        this.shiftBlocksDown(toId, updatedBlocks, updatedLinks, blockHeight);

        this.setState({
            blocks: updatedBlocks,
            links: updatedLinks,
        }, this.renderConnections);
    };

    /**
     * Converts a block to an end block, ensuring no descendants remain linked.
     * @param {number} blockId - The ID of the block to be converted to the end type.
     */
    convertToEndBlock = (blockId) => {
        const {blocks, links} = this.state;
        const block = this.getBlock(blockId);

        if (block?.type === 'end') return; // Already an end block

        // Remove all descendants if any
        const descendants = this.findDescendants(blockId);
        const blocksToKeep = blocks.filter(b => !descendants.includes(b.id));
        const linksToKeep = links.filter(link => !descendants.includes(link.from));

        const updatedBlock = {...block, type: 'end', linkedBlocks: []};

        this.setState({
            blocks: blocksToKeep.map(b => b.id === blockId ? updatedBlock : b),
            links: linksToKeep,
        }, this.renderConnections);
    };

    /**
     * Reverts an end block back to the default type.
     * @param {number} blockId - The ID of the end block to be converted.
     */
    convertEndToDefaultBlock = (blockId) => {
        this.setState((prevState) => ({
            blocks: prevState.blocks.map(block =>
                block.id === blockId && block.type === 'end'
                    ? {...block, type: 'default'}
                    : block
            ),
        }), this.renderConnections);
    };

    /**
     * Renders the connection lines between blocks, handling their SVG paths and optional interaction buttons.
     */
    renderConnections = () => {
        const {blocks, links} = this.state;
        const blockWidth = 318;
        const blockHeight = 100;

        return links.map((link, index) => {
            const fromBlock = this.getBlock(link.from);
            const toBlock = this.getBlock(link.to);

            if (!fromBlock || !toBlock) return null;

            // Dynamically find block height
            const fromBlockElement = document.getElementById(`block-${fromBlock.id}`);
            const toBlockElement = document.getElementById(`block-${toBlock.id}`);

            const blockActualHeight = fromBlockElement?.offsetHeight || blockHeight;

            let fromX = fromBlock.position.x + blockWidth / 2;
            let fromY = fromBlock.position.y + blockActualHeight;
            let toX = toBlock.position.x + blockWidth / 2;
            let toY = toBlock.position.y;

            const {fromPosition, toPosition} = link;
            // Calculate specific from/to positions if specified
            switch (fromPosition) {
                case 'top':
                    fromY = fromBlock.position.y;
                    break;
                case 'right':
                    fromX = fromBlock.position.x + blockWidth;
                    fromY = fromBlock.position.y + blockHeight / 2;
                    break;
                case 'bottom':
                    fromY = fromBlock.position.y + blockHeight;
                    break;
                case 'left':
                    fromX = fromBlock.position.x;
                    fromY = fromBlock.position.y + blockHeight / 2;
                    break;
                default:
                    break;
            }

            switch (toPosition) {
                case 'top':
                    toY = toBlock.position.y;
                    break;
                case 'right':
                    toX = toBlock.position.x + blockWidth;
                    toY = toBlock.position.y + blockHeight / 2;
                    break;
                case 'bottom':
                    toY = toBlock.position.y + blockHeight;
                    break;
                case 'left':
                    toX = toBlock.position.x;
                    toY = toBlock.position.y + blockHeight / 2;
                    break;
                default:
                    break;
            }

            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;

            const isBranchPath = fromBlock.type === 'branch';
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
                                className="add-button block-between"
                                onClick={() => this.addBlockBetween(link.from, link.to)}
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
            blocks.map((block) => {
                const isLastBlock = !links.some(link => link.from === block.id);
                if (!isLastBlock || block.type === 'end') return null; // Skip rendering for end block or if it is not the last in the chain

                const blockElement = document.getElementById(`block-${block.id}`);
                const blockActualHeight = blockElement?.offsetHeight || 130;

                const x = block.position.x + blockWidth / 2;
                const y = block.position.y + blockActualHeight;

                return (
                    <button
                        key={`last-${block.id}`}
                        className="add-button"
                        onClick={() => this.selectBlock(block.id, 'block')}
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
     * Finds and returns all descendant block IDs of a given block recursively.
     * @param {number} blockId - The ID of the block whose descendants are to be found.
     * @param {Array} updatedLinks - Optional, allows for passing a specific set of links for traversal.
     * @returns {Array} - List of descendant block IDs.
     */
    findDescendants = (blockId, updatedLinks = []) => {
        if (!updatedLinks.length) {
            updatedLinks = this.state.links;
        }
        const visited = new Set();  // To track visited nodes and prevent cycles
        const collectDescendants = (id) => {
            if (visited.has(id)) return [];
            visited.add(id);

            let descendants = [];
            updatedLinks.forEach(link => {
                if (link.from === id) {
                    descendants.push(link.to);
                    descendants.push(...collectDescendants(link.to));
                }
            });

            return descendants;
        };

        return collectDescendants(blockId);
    };

    /**
     * Removes a block and all its descendants from the canvas.
     * @param {number} blockId - The ID of the block to be removed.
     */
    removeBlockAndDescendants = (blockId) => {
        const {blocks, links} = this.state;

        // Check if the block is directly linked from a branch
        const isLinkedFromBranch = links.some(link =>
            link.to === blockId && this.getBlock(link.from)?.type === 'branch'
        );

        if (isLinkedFromBranch) {
            alert('Cannot delete a block that is part of a branch connection.');
            return; // Skip deleting if it's linked from a branch
        }

        // Collect all blocks to be deleted
        const descendants = this.findDescendants(blockId);
        const blocksToDelete = [blockId, ...descendants];

        // Update blocks and links excluding these
        const updatedBlocks = blocks.filter(block => !blocksToDelete.includes(block.id));
        const updatedLinks = links.filter(link => !(blocksToDelete.includes(link.from) || blocksToDelete.includes(link.to)));

        this.setState({
            blocks: updatedBlocks,
            links: updatedLinks,
        }, this.renderConnections);
    };

    /**
     * Recursively shifts blocks down to make space for new additions in the workflow.
     *
     * @param {number} startBlockId - The ID of the block from where the shift should start.
     * @param {Array} updatedBlocks - The array of updated blocks that need to be shifted.
     * @param {Array} updatedLinks - The array of updated links to find descendants.
     * @param {number} [blockHeight=100] - The assumed height of each block.
     */
    shiftBlocksDown = (startBlockId, updatedBlocks, updatedLinks, blockHeight = 100) => {
        const shiftY = blockHeight + 170;
        const seenBlocks = new Set();

        const shiftRecursive = (blockId) => {
            // Base condition: check for cycles or already shifted blocks
            if (seenBlocks.has(blockId)) return;
            seenBlocks.add(blockId);

            // Find the block to shift
            const block = updatedBlocks.find(block => block.id === blockId);
            if (!block) return;

            // Apply the shift downward
            block.position.y += shiftY;

            // Identify and shift its direct descendants
            updatedLinks.forEach(link => {
                if (link.from === blockId) {
                    shiftRecursive(link.to);
                }
            });
        };


        shiftRecursive(startBlockId);
    };

    /**
     * Renders block-specific action buttons based on conditions like type and descendant presence.
     * @param {number} blockId - The ID of the block for which actions are to be rendered.
     */
    renderBlockActions = (blockId) => {
        const {links} = this.state;
        const block = this.getBlock(blockId)
        if (block.type === 'start') return null; // Don't allow deletion of these

        // Determine if the block is directly linked as a child of a branch
        const isDirectBranchDescendant = links.some(link =>
            link.to === block.id &&
            this.getBlock(link.from)?.type === 'branch'
        );
        const hasDescendants = this.findDescendants(blockId).length

        return (
            <div className="block-actions">
                {!isDirectBranchDescendant && (
                    <button onClick={() => this.removeBlockAndDescendants(block.id)}>
                        Remove Block
                    </button>
                )}

                {!hasDescendants && (
                    <>
                        {block.type === 'default' && (
                            <button onClick={() => this.convertToEndBlock(blockId)}>
                                Convert to End Block
                            </button>
                        )}
                        {block.type === 'end' && (
                            <button onClick={() => this.convertEndToDefaultBlock(blockId)}>
                                Convert to Default Block
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    };

    /**
     * Removes a specified link between two blocks and checks for any blocks that become disjoint.
     * @param {number} fromId - The ID of the block where the link starts.
     * @param {number} toId - The ID of the block where the link ends.
     */
    removeLink = (fromId, toId) => {
        const {blocks, links} = this.state;

        // Remove the specified link
        const updatedLinks = links.filter(link => !(link.from === fromId && link.to === toId));

        // Helper function to detect true disconnects
        const isDisjoint = (blockId, links) => {
            return !links.some(link => link.to === blockId);
        };


        // Check which blocks would become disjointed
        const blocksToRemove = [];
        if (isDisjoint(toId, updatedLinks)) {
            blocksToRemove.push(toId, ...this.findDescendants(toId, updatedLinks));
        }

        // Only remove nodes that are truly isolated
        const updatedBlocks = blocks.filter(block => !blocksToRemove.includes(block.id));
        const validLinks = updatedLinks.filter(link =>
            updatedBlocks.some(block => block.id === link.from) &&
            updatedBlocks.some(block => block.id === link.to)
        );

        this.setState({
            blocks: updatedBlocks,
            links: validLinks,
        }, this.renderConnections);
    };

    /**
     * Retrieves a block object from the current state by its ID.
     * @param {number} id - The ID of the block to be retrieved.
     * @returns {object|null} - The block object if found, otherwise null.
     */
    getBlock = (id) => {
        return this.state.blocks.find((block) => block.id === id);
    };

    /**
     * Renders the main structure of the FlowBuilder component, including the panels, blocks, and connections.
     * @returns {JSX.Element} - The main component structure rendered as JSX.
     */
    render() {
        const {canvasHeight, isBlockPanelOpen, isPropertyPanelOpen, activeBlock, spaceDown, dragging} = this.state;
        const cursorStyle = spaceDown
            ? dragging === 'canvas'
                ? 'grabbing'
                : 'grab'
            : 'default'; // Default cursor when not interacting with the canvas

        return (
            <div className="canvas-container">
                {isBlockPanelOpen && (
                    <BlockPanel
                        block={activeBlock}
                        closePanel={this.handlePanelCollapse}
                        handleBlockSelect={this.handleBlockSelect}
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
                    {this.state.blocks.map((block) => (
                        <Block
                            key={block.id}
                            block={block}
                            onMouseDown={(event) => this.handleMouseDown(event, block.id)}
                            onLinkClick={(position) => this.handleLinkClick(position, block.id)}
                            convertToBranchBlock={() => this.convertToBranchBlock(block.id)}
                            addBranch={() => this.addBranch(block.id)}
                            renderBlockActions={this.renderBlockActions(block.id)}
                            activeLinkPosition={
                                this.state.activeLinkPosition?.blockId === block.id
                                    ? this.state.activeLinkPosition.position
                                    : null
                            }
                            isActive={activeBlock?.id === block.id}
                            onClick={() => this.selectBlock(block.id, 'property')}
                        />
                    ))}
                </div>
                {isPropertyPanelOpen && (
                    <PropertyPanel block={activeBlock}
                                   closePanel={this.handlePanelCollapse}
                                   onSubmit={this.handlePropertyPanelSubmit}
                    />
                )}
            </div>
        );
    }
}

export default FlowBuilder;
