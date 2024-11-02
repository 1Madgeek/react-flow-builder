import React, {Component} from "react";
import DefaultBlock from "./blocks/DefaultBlock";
import '../assets/css/flowy.css';
import BlockPanel from "./BlockPanel";
import IconPlus from "../assets/icon/IconPlus";
import IconX from "../assets/icon/IconX";
import Block from "./blocks/Block";
import IconSquarePlus from "../assets/icon/IconSquarePlus";

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

            collapseBlockPanel: true,
            blockPanelBlock: null
        };
    }

    componentDidMount() {
        this.initializeCanvas()
    }

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

    selectBlock = (blockId) => {
        const block = this.getBlock(blockId)
        this.setState({
            collapseBlockPanel: false,
            blockPanelBlock: block
        })
    }

    handleBlockSelect = (blockId, type) => {
        switch (type) {
            case 'branch':
                this.addBranch(blockId)
                break
            case 'end':
                break
            case 'default':
            default:
                this.addBlock(blockId)
                break
        }
    }

    handleBlockPanelCollapse = () => {
        this.setState({
            collapseBlockPanel: true,
            blockPanelBlock: null
        })
    }
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

    addBranch = (prevBlockId) => {
        const {blocks} = this.state;

        const prevBlock = this.getBlock(prevBlockId);
        if (!prevBlock) return; // Safety check

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
            {from: prevBlockId, to: branchBlock.id} // Link the previous block to the new branch
        ];

        this.setState((prevState) => ({
            collapseBlockPanel: true,
            blockPanelBlock: null,
            blocks: [...prevState.blocks, branchBlock, positiveChild, negativeChild],
            links: [...prevState.links, ...newLinks],
        }), this.renderConnections);
    };
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

        const blockWidth = 100;
        const scrollY = blockWidth + 120;

        // Determine new block position relative to the previous block
        const newBlockPosition = {
            x: prevBlock.position.x,
            y: prevBlock.position.y + scrollY, // Set gap for vertical or adjust for horizontal layouts
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
            collapseBlockPanel: true,
            blockPanelBlock: null,
            blocks: [...prevState.blocks, newBlock],
            links: [...prevState.links, newLink],
        }), this.renderConnections); // Optionally, re-draw connection lines
    };

    addBlockBetween = (fromId, toId) => {
        const fromBlockIndex = this.state.blocks.findIndex(block => block.id === fromId);
        const toBlockIndex = this.state.blocks.findIndex(block => block.id === toId);

        if (fromBlockIndex < 0 || toBlockIndex < 0 || fromBlockIndex === toBlockIndex) return;

        // Find necessary block positions
        const fromBlock = this.state.blocks[fromBlockIndex];
        const toBlock = this.state.blocks[toBlockIndex];

        const newPosition = {
            x: (fromBlock.position.x + toBlock.position.x) / 2,
            y: (fromBlock.position.y + toBlock.position.y) / 2 + 120,  // Center y and add margin
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

    convertToEndBlock = (blockId) => {
        const {blocks, links} = this.state;
        const block = this.getBlock(blockId);

        if (block.type === 'end') return; // Already an end block

        // Remove all descendants if any
        const descendants = this.findDescendants(blockId);
        const blocksToKeep = blocks.filter(b => !descendants.includes(b.id));
        const linksToKeep = links.filter(link => !descendants.includes(link.from));

        const updatedBlock = {...block, type: 'end', linkedBlocks: []};

        this.setState({
            blocks: blocksToKeep.map(b => b.id === blockId ? updatedBlock : b),
            links: linksToKeep,
        }, this.renderConnections);
    }

    convertEndToDefaultBlock = (blockId) => {
        this.setState((prevState) => ({
            blocks: prevState.blocks.map(block =>
                block.id === blockId && block.type === 'end'
                    ? {...block, type: 'default'}
                    : block
            ),
        }), this.renderConnections);
    };

    renderConnections = () => {
        const {blocks, links} = this.state;

        const blockWidth = 318;
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
                        left: 0,
                        top: 0,
                        width: Math.abs(x2 - x1),
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
                                className="add-button block-between"
                                onClick={() => this.addBlockBetween(link.from, link.to)}
                                style={{
                                    position: 'absolute',
                                    left: x1 - 15, // Adjust button position as necessary
                                    top: (y1 + y2) / 2 - 25,
                                    zIndex: 2,
                                    pointerEvents: 'all',
                                }}>
                                <IconSquarePlus width={20} height={20}/>
                            </button>
                            <button className="remove-button" onClick={() => this.removeLink(link.from, link.to)}
                                    style={{
                                        position: 'absolute',
                                        left: x1 - 15, // Adjust button position as necessary
                                        top: (y1 + y2) / 2 + 15,
                                        zIndex: 2,
                                        pointerEvents: 'all',
                                    }}>
                                <IconX width={20} height={20}/>
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
                        onClick={() => this.selectBlock(block.id)}
                        style={{
                            position: 'absolute',
                            left: x - 15, // Center-align button
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

    findDescendants = (blockId) => {
        const {links} = this.state;
        let descendants = [];
        links.forEach(link => {
            if (link.from === blockId) {
                descendants.push(link.to);
                descendants = descendants.concat(this.findDescendants(link.to));
            }
        });
        return descendants;
    }
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
     * @param {number} blockHeight - The assumed height of each block.
     */
    shiftBlocksDown = (startBlockId, updatedBlocks, updatedLinks, blockHeight = 100) => {
        const shiftY = blockHeight + 170; // Adjust block separation to prevent overlap.
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

    removeLink = (fromId, toId) => {
        const {blocks, links} = this.state;

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
        const {canvasHeight, collapseBlockPanel, blockPanelBlock} = this.state;

        return (
            <div className="canvas-container">
                <BlockPanel collapseBlockPanel={collapseBlockPanel}
                            block={blockPanelBlock}
                            handler={this.handleBlockPanelCollapse}
                            handleBlockSelect={this.handleBlockSelect}/>
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
                            isActive={this.state.activeBlock === block.id}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default FlowBuilder
