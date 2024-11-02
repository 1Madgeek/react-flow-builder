import './App.css';
import {FlowBuilder} from '@madgeek_in/react-flow-builder'

function App() {
    return (
        <div className="App">
            <FlowBuilder allowDragging={true} flow={'vertical'}/>
        </div>
    );
}

export default App;
