import './App.css';
import FlowBuilder from "./components/FlowBuilder";

function App() {
    return (
        <div className="App">
            <FlowBuilder allowDragging={true} flow={'vertical'}/>
        </div>
    );
}

export default App;
