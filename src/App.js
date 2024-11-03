import './App.css';
import FlowBuilder from "./components/FlowBuilder";

function App() {
    return (
        <div className="App">
            <FlowBuilder nodes={[]}
                         edges={[]}
                         onUpdate={(nodes, edges) => {
                         }}
                         renderPropertyPanel={(node) => {
                         }}
                         allowDragging={true}
                         flow={'vertical'}/>
        </div>
    );
}

export default App;
