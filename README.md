# FlowBuilder

**FlowBuilder** is an open-source, lightweight, and flexible flow builder designed to make process mapping simple,
intuitive, and manageable. Unlike other flow libraries, FlowBuilder avoids unnecessary bulkiness and focuses on
delivering a streamlined experience for developers. With easy setup and rich customization options, FlowBuilder enables
users to create and visualize workflows effectively.

WIP...
[React Flow Builder Demo](https://react-flow-builder-demo.vercel.app/)

![Work In Progress](screenshots/screenshot-4.png)

## Demo

[React Flow Builder Demo](https://react-flow-builder-demo.vercel.app/)


## Getting Started

### Installation
```bash
# npm
npm install @madgeek_in/react-flow-builder

# yarn
yarn add @madgeek_in/react-flow-builder
```

### Basic Usage
The FlowBuilder component is capable of rendering a flowchart composed of nodes and edges, offering interactivity through dragging and updating node properties. Here is the minimal setup required to get started with FlowBuilder.

```javascript
import React from 'react';
import { FlowBuilder } from '@madgeek_in/react-flow-builder';

// Function to render the property panel for a node
const renderPropertyPanel = (node) => {
    // Custom logic for rendering node properties goes here
};

// Function that gets called whenever nodes or edges are updated
const handleUpdate = (nodes, edges) => {
    console.log('Updated Nodes:', nodes);
    console.log('Updated Edges:', edges);
};

const nodes = []; // Array of initial nodes
const edges = []; // Array of initial edges

function App() {
    return (
        <div className="App">
            <FlowBuilder
                nodes={nodes}
                edges={edges}
                onUpdate={handleUpdate}
                renderPropertyPanel={renderPropertyPanel}
                allowDragging={true} // Enable or disable dragging of nodes
                flow="vertical" // Define the flow direction (vertical or horizontal)
            />
        </div>
    );
}

export default App;
```
### Explanation

- **Nodes and Edges:** These are the primary inputs to the FlowBuilder. Nodes represent discrete elements, while edges denote connections between them. Customize the arrays to set initial configurations.
- **`onUpdate` Callback**: This function gets called whenever the nodes or edges are updated, allowing you to handle their state changes or save them.
- **`renderPropertyPanel` Function**: Customize this function for rendering node-specific properties. You can leverage this to provide custom UIs for node data editing.
- **Draggable Nodes**: Whether nodes can be repositioned via dragging is controlled through the `allowDragging` prop.
- **Flow Direction:** The flow prop determines the primary orientation of node arrangement within the canvas.

## Advanced Usage
For enhanced customization, such as overriding existing functionalities or extending the base component, you can create a subclass of `FlowBuilder`:

```javascript
import React from 'react';
import { FlowBuilder } from '@madgeek_in/react-flow-builder';

class CustomFlowBuilder extends FlowBuilder {
  // Override existing functionalities or add new methods here
  // For example, we can override the `addNode` method

  addNode(prevNodeId, type = 'default') {
    // Customized logic for adding a new node
    super.addNode(prevNodeId, type);
    // Additional custom operations
  }

  // More custom methods and overrides as needed
}

export default CustomFlowBuilder;

// In your application
function App() {
  return (
    <div className="App">
      <CustomFlowBuilder
        nodes={nodes}
        edges={edges}
        onUpdate={handleUpdate}
        renderPropertyPanel={renderPropertyPanel}
        allowDragging={true}
        flow="vertical"
      />
    </div>
  );
}
```

### Explanation
- **Class Inheritance:** By creating a subclass of FlowBuilder, you get access to its internal methods and can override them as needed. This offers flexibility if the default functionality does not meet certain requirements.
- **Custom Methods:** You can define new methods or override existing ones, enabling more complex interactions with nodes, such as custom node creation or enhanced UI responses.



## Features

- **Manual Edge Creation**: Quickly establish connections between nodes by manually selecting edge points.
- **Automatic & Programmatic Edge Connection:** Automate connections based on predefined logic or create edges programmatically
  as your application scales.
- **Branching**: Easily design complex workflows with branching logic and merges, supporting diverse use cases.
- **Lightweight and Performant**: Built with simplicity in mind, FlowBuilder is optimized to be lightweight, with
  minimal setup required.

## Why FlowBuilder?

FlowBuilder fills the gap between heavy, complex flow solutions and simpler, more manageable setups. Designed to support
various workflow applications, FlowBuilder gives developers the freedom to customize and integrate workflows without the
overhead.

## Flow Builder Features and Functionalities

### Core Features

1. [x] **Node Management:**
    - **Add Nodes**: Dynamically add nodes to the canvas.
    - **Remove Nodes**: Remove nodes and automatically delete their descendant nodes.
    - **Convert Node to Branch**: Transform a regular node into a branch node with constraints to maintain positive
      and negative paths.

2. [x] **Branch Logic:**
    - **Positive and Negative Paths**: Ensure each branch node maintains exactly two children, representing positive
      and negative paths.
    - **Prevent Invalid Branch Creation**: Disallow conversion if the node violates branch constraints (e.g., more than
      two descendants).

3. [x] **Edge Management:**
    - **Create Edges**: Connect nodes to establish flow paths.
    - **Remove Edges**: Remove edges, and if resulting nodes are disjointed (i.e., not connected to a root), remove
      those nodes.

4. [x] **Drag-and-Drop Functionality:**
    - **Individual node Movement**: Allow users to drag individual nodes to new positions.
    - **Canvas Drag**: Enable dragging of the entire canvas and its content if specific user settings are selected.

5. [x] **Auto-Arrangement and Centering:**
    - **Arrange nodes**: Automatically center nodes horizontally while maintaining their top positions.
    - **Responsive Positioning**: Dynamic adjustment for different screen sizes.

### User Interface Features

1. [x] **Interactive Elements:**
    - **"+" Button**: Add new nodes to existing connections.
    - **"Remove" Button**: Remove nodes or edges through direct interaction.

2. [x] **Styling and Display:**
    - **Node Appearance**: Differentiate node types with unique colors and labels using a consistent design language.
    - **Connection Paths**: Render connections with SVG paths, adjusting for straight or "L"-shaped paths to indicate
      flow or branching.

### Notifications and Feedback

1. [ ] **Alert Messages**: Provide user-friendly notifications when disallowed actions are attempted (e.g., trying to
   delete protected branch children).

2. [ ] **In-App Guidance**: Tooltips or instructional text for first-time users or complex actions.

### Advanced Functionalities

1. [ ] **Undo/Redo Functionality**: Allow users to undo or redo their most recent changes.

2. [ ] **Exporting Workflows**: Provide options to save or export workflow configurations for sharing or later use.

3. [ ] **Enhanced Conditional Logic**: Enable complex branching conditions, allowing for more advanced workflows based
   on dynamic data or inputs.

4. [ ] **Customizable UI**: Options for users to customize the look and feel of their canvas, nodes, and connections.

### Future Enhancements

1. [ ] **Collaboration Features**: Enable multiple users to collaborate on the same workflow in real-time.

2. [ ] **Zoom and Pan Controls**: Implement zooming and panning to navigate larger workflows easily.

3. [ ] **Version Control**: Maintain history and versioning for workflows, providing rollback capabilities.

4. [ ] **Elements/Node Panel**: List of nodes to choose from when creating a node.

5. [ ] **Node Property Panel**: Node configuration panel like [Elementor](https://github.com/elementor/elementor).

6. [ ] **Drag & Drop Node**: Allow dragging & dropping nodes from the node lists into the canvas.

7. [ ] **Auto Snapping**: Automatically snap to an existing node and create edges.

8. [ ] **Start Node**: Allow start node configuration to determine if the flow should be executed.

9. [ ] **End Node**: Allow nodes to be of type "End". Nodes of type end won't have any descendents and stop the flow. 

## Use Cases

- **AI Event-based Workflow Automation:** Perfect for AI tools that need dynamic flow designs to handle conditional and
  event-based workflows. Define sequences for actions based on real-time events and improve decision-making automation.

- **Marketing Automation Tools:** Ideal for mail marketing workflows and campaign automation, allowing marketing teams
  to visualize customer journeys, manage touch points, and streamline campaign flows.

- **Business Process Automation:** Tailored for enterprise process automation, FlowBuilder is a great fit for designing
  complex business workflows. [Madgeek](https://www.madgeek.in), a leader in enterprise tools, specializes in creating
  solutions that simplify business processes and boost operational efficiency.

### Credits

This project was inspired by and borrows ideas from the following open-source projects:

- [Flowy](https://github.com/alyssaxuu/flowy): A simple drag-and-drop library for creating flowcharts and workflows.
- [Drawflow](https://github.com/jerosoler/Drawflow): A JavaScript library for creating flowcharts and diagrams with a
  user-friendly interface.
- [Xyflow](https://github.com/xyflow/xyflow): A flow chart library that emphasizes ease of use and flexibility for
  developers.
- [flow-builder](https://github.com/bytedance/flow-builder): A highly customizable streaming flow builder.

Thank you for your contributions to the open-source community!

### Open Source Libraries Used

This project utilizes several open-source libraries to provide a robust and responsive experience:

- [React](https://reactjs.org/): A JavaScript library for building user interfaces, providing the foundation for responsive and dynamic components.
- [Tabler Icons](https://tabler-icons.io/): A set of customizable and responsive SVG icons, enhancing the visual appeal and usability of the application.

A huge thank you to these open-source communities for their invaluable contributions!

## Contributing

We encourage contributions to improve FlowBuilder! Here are a few guidelines to ensure a smooth collaboration:

- **Be Respectful and Collaborative:** Open-source is a collaborative space, and contributions are encouraged! Instead
  of requesting features, consider joining the development effort by sharing ideas, fixing bugs, or implementing
  functionalities.
- **Raise Issues Thoughtfully:** If you encounter issues, please describe them clearly and include steps to reproduce.
  This will help the community better understand and resolve them.
- **Submit PRs with Care:** When submitting a pull request, ensure your code follows project conventions and includes
  comments where necessary.

- Let’s work together to make FlowBuilder better, one contribution at a time!

## 💕 Sponsor FlowBuilder

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-pink.svg)](https://github.com/sponsors/1Madgeek)

If you find this project useful and would like to support its development,
consider [sponsoring me on GitHub](https://github.com/sponsors/1Madgeek).

We are grateful to the following individuals and organizations for supporting this project:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/1Madgeek">
        <img src="https://avatars.githubusercontent.com/u/33049092?s=200&v=4" width="100px;" alt="Sponsor 1"/>
        <br/>
        <sub><b>Madgeek</b></sub>
      </a>
    </td>
  </tr>
</table>

Want to see your profile here? [Become a sponsor](https://github.com/sponsors/1Madgeek)!
