import './App.css';
import Flowy from "./components/Flowy";

function App() {
    return (
        <div className="App">
            <Flowy allowDragging={false} flow={'vertical'}/>
        </div>
    );
}

export default App;
