import React, {Component} from "react";
import Block from "./Block";
import './flowy.css';
import classNames from "classnames";

class Flowy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            blocks: [
                {id: 1, position: {x: 50, y: 50}, type: 'default', linkedBlocks: []},
            ],
            links: [],
            dragging: null,
            canvasHeight: 600,
            offset: {x: 0, y: 0},
            activeBlock: null,
            activeLinkPosition: null,
            collapseElementStack: false
        };
    }

    componentDidMount() {
        this.arrangeBlocks();
    }

    toggleElementStackVisibility = (event) => {
        this.setState(prev => ({collapseElementStack: !prev.collapseElementStack}))
    }

    arrangeBlocks = () => {
        const {blocks} = this.state;
        const {flow} = this.props;

        const blockWidth = 150; // Assumed block width for centering

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

    handleMouseDown = (event, blockId) => {
        const {allowDragging} = this.props; // Access the prop

        if (allowDragging) {
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
        } else {
            // Handle dragging the entire canvas
            this.setState({
                dragging: 'canvas',
                initialClick: {
                    x: event.clientX,
                    y: event.clientY,
                },
                initialPositions: this.state.blocks.map(block => ({
                    ...block // Copy all properties of each block
                })),
            });
        }
    };
    handleMouseMove = (event) => {
        const {dragging} = this.state;

        if (dragging) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            if (dragging === 'canvas') {
                // Move the entire canvas
                const dx = mouseX - this.state.initialClick.x;
                const dy = mouseY - this.state.initialClick.y;

                this.setState(prevState => ({
                    blocks: prevState.initialPositions.map((block, index) => ({
                        ...block,
                        position: {
                            x: block.position.x + dx,
                            y: block.position.y + dy,
                        },
                    })),
                }), this.renderConnections);
            } else {
                // Move a single block
                this.setState(prevState => ({
                    blocks: prevState.blocks.map(block => {
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
                }), this.renderConnections);
            }
        }
    };

    handleMouseUp = () => {
        this.setState({
            dragging: null,
            initialClick: null,
            initialPositions: null,
            activeBlock: null
        });
    };

    addBranch = (branchId) => {
        const branchBlock = this.getBlock(branchId);

        if (branchBlock && branchBlock.type === 'branch') {
            console.warn("Block is already a branch. Cannot add another branch.");
            return;
        }

        const positiveChild = {
            id: this.state.blocks.length + 1,
            position: {x: branchBlock.position.x - 150, y: branchBlock.position.y + 170}, // Positioning for positive branch
            type: 'default', // Type for child blocks
            linkedBlocks: [],
        };

        const negativeChild = {
            id: this.state.blocks.length + 2,
            position: {x: branchBlock.position.x + 150, y: branchBlock.position.y + 170}, // Positioning for negative branch
            type: 'default',
            linkedBlocks: [],
        };

        const newBranchBlock = {
            ...branchBlock,
            type: 'branch',
            linkedBlocks: [positiveChild.id, negativeChild.id], // Establishes connection to children
        };

        // Remove the original block, add the branches, and the new branch block
        this.setState((prevState) => ({
            blocks: prevState.blocks.map(block =>
                block.id === branchId ? newBranchBlock : block
            ).concat([positiveChild, negativeChild]),
            links: prevState.links.concat([
                {from: branchId, to: positiveChild.id, type: 'positive'},
                {from: branchId, to: negativeChild.id, type: 'negative'}
            ]),
            canvasHeight: Math.max(prevState.canvasHeight, branchBlock.position.y + 300),
        }), this.arrangeBlocks);
    };

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

    linkBlocks = (fromData, toId, toPosition) => {
        const {blockId, position} = fromData;
        this.setState((prevState) => {
            const updatedBlocks = prevState.blocks.map((block) => {
                if (block.id === blockId) {
                    const existingLinkIndex = block.linkedBlocks.findIndex(
                        (link) => link.id === toId
                    );

                    if (existingLinkIndex !== -1) {
                        const updatedLinkedBlocks = [...block.linkedBlocks];
                        updatedLinkedBlocks[existingLinkIndex] = {
                            id: toId,
                            fromPosition: position,
                            toPosition,
                        };
                        return {...block, linkedBlocks: updatedLinkedBlocks};
                    } else {
                        return {
                            ...block,
                            linkedBlocks: [
                                ...block.linkedBlocks,
                                {id: toId, fromPosition: position, toPosition},
                            ],
                        };
                    }
                }
                return block;
            });

            const newLink = {from: blockId, to: toId, fromPosition: position, toPosition};
            return {blocks: updatedBlocks, links: [...prevState.links, newLink]};
        }, this.renderConnections);
    };


    // Method to add a new block taking reference from a given previous block ID
    addBlock = (prevBlockId) => {
        // Retrieve previous block's position for calculation
        const prevBlock = this.getBlock(prevBlockId);
        if (!prevBlock) return; // Safety check for existing block

        const {blocks, links} = this.state;

        // Determine new block position relative to the previous block
        const newBlockPosition = {
            x: prevBlock.position.x,
            y: prevBlock.position.y + 150, // Set gap for vertical or adjust for horizontal layouts
        };

        // Create new block with a unique ID
        const newBlock = {
            id: blocks.length + 1, // Assumed unique ID generation; use a more robust system if needed
            position: newBlockPosition,
            type: 'default', // Default block type for now
            linkedBlocks: [],
        };

        // Update the links: from previous block to the new block
        const newLink = {
            from: prevBlockId,
            to: newBlock.id,
        };

        // Update state with new block and link
        this.setState((prevState) => ({
            blocks: [...prevState.blocks, newBlock],
            links: [...prevState.links, newLink],
        }), this.renderConnections); // Optionally, re-draw connection lines
    };


    addBlockBetween = (fromId, toId) => {
        const fromBlockIndex = this.state.blocks.findIndex(block => block.id === fromId);
        const toBlockIndex = this.state.blocks.findIndex(block => block.id === toId);

        // Ensure from and to blocks are valid and in correct order
        if (fromBlockIndex < 0 || toBlockIndex < 0 || fromBlockIndex === toBlockIndex) return;

        // Create new block position between the two blocks
        const fromBlock = this.state.blocks[fromBlockIndex];
        const toBlock = this.state.blocks[toBlockIndex];
        const newPosition = {
            x: (fromBlock.position.x + toBlock.position.x) / 2,
            y: (fromBlock.position.y + toBlock.position.y) / 2,
        };

        const newBlock = {
            id: this.state.blocks.length + 1,
            position: newPosition,
            type: 'default',
            linkedBlocks: [],
        };

        // Insert new block into the blocks array at the correct position
        const updatedBlocks = [
            ...this.state.blocks.slice(0, toBlockIndex), // blocks before toBlock
            newBlock,
            ...this.state.blocks.slice(toBlockIndex), // blocks from toBlock onwards
        ];

        // Remove the existing link between fromId and toId
        const updatedLinks = this.state.links.filter(
            (link) => !(link.from === fromId && link.to === toId)
        );

        // Add new links from the original blocks to the new block
        updatedLinks.push(
            {from: fromId, to: newBlock.id},
            {from: newBlock.id, to: toId}
        );


        // Update the canvas height based on the last block's position
        const newCanvasHeight = updatedBlocks.length > 0 ? Math.max(...updatedBlocks.map(block => block.position.y + 250)) : 600; // Default height if no blocks

        this.setState((prevState) => ({
            blocks: updatedBlocks,
            links: updatedLinks,
            canvasHeight: newCanvasHeight,
        }), this.arrangeBlocks);
    };

    renderConnections = () => {
        const {blocks, links} = this.state;

        const blockWidth = 150;
        const blockHeight = 100;

        return links.map((link, index) => {
            const fromBlock = this.getBlock(link.from);
            const toBlock = this.getBlock(link.to);

            if (!fromBlock || !toBlock) return null;

            const x1 = fromBlock.position.x + blockWidth / 2;
            const y1 = fromBlock.position.y + blockHeight;
            const x2 = toBlock.position.x + blockWidth / 2;
            const y2 = toBlock.position.y;

            // Exclude the "+" on branch connections:
            const isBranchPath = fromBlock.type === 'branch';

            const path = isBranchPath
                ? `M${x1} ${y1} L${x1} ${(y1 + 40)} L${x2} ${(y1 + 40)} L${x2} ${y2}`
                : `M${x1},${y1} C${x1},${y1 + 50} ${x2},${y2 - 50} ${x2},${y2}`; // Original path for non-branch connections


            return (
                <div
                    key={`${link.from}-${link.to}`}
                    style={{
                        position: 'absolute',
                        left: -25,//Math.min(x1, x2) - 50,
                        top: 0,//Math.min(y1, y2),
                        width: Math.abs(x2 - x1) + 100,
                        height: Math.abs(y2 - y1) + 50,
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
                            d={`M${x2 - 5},${y2 - 5} L${x2},${y2} L${x2 + 5},${y2 - 5}`}
                            fill="#C5CCD0"
                        />
                    </svg>
                    {!isBranchPath && (
                        <>
                            <button
                                className="add-button"
                                onClick={() => this.addBlockBetween(link.from, link.to)}
                                style={{
                                    position: 'absolute',
                                    left: x1 - 12.5, // Adjust button position as necessary
                                    top: (y1 + y2) / 2 - 10,
                                    zIndex: 2,
                                    pointerEvents: 'all',
                                }}>
                                +
                            </button>
                            <button className="remove-button" onClick={() => this.removeLink(link.from, link.to)}
                                    style={{
                                        position: 'absolute',
                                        left: x1 - 12.5, // Adjust button position as necessary
                                        top: (y1 + y2) / 2 + 20,
                                        zIndex: 2,
                                        pointerEvents: 'all',
                                    }}>x
                            </button>
                        </>
                    )}
                </div>
            );
        }).concat(
            blocks.map((block) => {
                // Last blocks in their chains need a "+" button
                const isLastBlock = !links.some(link => link.from === block.id);

                if (!isLastBlock) return null;

                const x = block.position.x + blockWidth / 2;
                const y = block.position.y + blockHeight;

                return (
                    <button
                        key={`last-${block.id}`}
                        className="add-button"
                        onClick={() => this.addBlock(block.id)}
                        style={{
                            position: 'absolute',
                            left: x - 35, // Center-align button
                            top: y + 10,
                            zIndex: 2,
                            pointerEvents: 'all',
                        }}
                    >
                        +
                    </button>
                );
            })
        );
    };

    removeBlockAndDescendants = (blockId) => {
        const {blocks, links} = this.state;

        // Find all descendant block IDs using the links
        const findDescendants = (id) => {
            let descendants = [];
            links.forEach(link => {
                if (link.from === id) {
                    descendants.push(link.to);
                    descendants = descendants.concat(findDescendants(link.to));
                }
            });
            return descendants;
        };

        // Check if the block is directly linked from a branch
        const isLinkedFromBranch = links.some(link =>
            link.to === blockId && this.getBlock(link.from)?.type === 'branch'
        );

        if (isLinkedFromBranch) {
            alert('Cannot delete a block that is part of a branch connection.');
            return; // Skip deleting if it's linked from a branch
        }

        // Collect all blocks to be deleted
        const descendants = findDescendants(blockId);
        const blocksToDelete = [blockId, ...descendants];

        // Update blocks and links excluding these
        const updatedBlocks = blocks.filter(block => !blocksToDelete.includes(block.id));
        const updatedLinks = links.filter(link => !(blocksToDelete.includes(link.from) || blocksToDelete.includes(link.to)));

        this.setState({
            blocks: updatedBlocks,
            links: updatedLinks,
        }, this.renderConnections);
    };

    renderBlockActions = (blockId) => {
        const {links} = this.state;
        const block = this.getBlock(blockId)
        if (block.type === 'start' || block.type === 'end') return null; // Don't allow deletion of these

        // Determine if the block is directly linked as a child of a branch
        const isLinkedFromBranch = links.some(link =>
            link.to === block.id && this.getBlock(link.from)?.type === 'branch'
        );
        return (
            <div className="block-actions">
                {!isLinkedFromBranch && (
                    <button onClick={() => this.removeBlockAndDescendants(block.id)}>
                        Remove Block
                    </button>
                )}
            </div>
        );
    };

    removeLink = (fromId, toId) => {
        const { blocks, links } = this.state;

        // Remove the specific link in question
        const updatedLinks = links.filter(link => !(link.from === fromId && link.to === toId));

        // Function to recursively find all descendants of a given block
        const findDescendants = (blockId) => {
            let descendants = [];
            updatedLinks.forEach(link => {
                if (link.from === blockId) {
                    descendants.push(link.to);
                    descendants = descendants.concat(findDescendants(link.to));
                }
            });
            return descendants;
        };

        // Find all descendants of the block that is potentially disjointed
        const blocksToRemove = [toId, ...findDescendants(toId)];

        // Now filter out blocks to remove and keep only the relevant links
        const updatedBlocks = blocks.filter(block => !blocksToRemove.includes(block.id));
        const newLinks = updatedLinks.filter(link => !blocksToRemove.includes(link.to));

        this.setState({
            blocks: updatedBlocks,
            links: newLinks,
        }, this.renderConnections);
    };

    getBlock = (id) => {
        return this.state.blocks.find((block) => block.id === id);
    };

    render() {
        const {canvasHeight, collapseElementStack} = this.state;

        return (
            <div className="canvas-container">
                <div className={classNames("element-stack", {
                    "collapse": collapseElementStack
                })}>
                    <div id="close-element-stack" onClick={(event) => this.toggleElementStackVisibility(event)}>
                        <img src="/image/closeleft.svg" alt={'Collapse'}/>
                    </div>

                </div>
                <div className="canvas"
                     style={{
                         // height: `${canvasHeight}px`,
                     }}
                     onMouseUp={this.handleMouseUp}
                     onMouseMove={this.handleMouseMove}>
                    <div className="connections">
                        {this.renderConnections()}
                    </div>
                    {this.state.blocks.map((block) => (
                        <Block
                            key={block.id}
                            id={block.id}
                            position={block.position}
                            onMouseDown={(event) => this.handleMouseDown(event, block.id)}
                            onLinkClick={(position) => this.handleLinkClick(position, block.id)}
                            isBranch={block.type === 'branch'}
                            addBranch={() => this.addBranch(block.id)}
                            renderBlockActions={this.renderBlockActions(block.id)}
                            activeLinkPosition={
                                this.state.activeLinkPosition?.blockId === block.id
                                    ? this.state.activeLinkPosition.position
                                    : null
                            }
                            isActive={this.state.activeBlock === block.id}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default Flowy
