import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import ConnectionManager from './assets/components/ConnectionManager';
import Header from './assets/components/Header';
import WindowManager from './assets/components/WindowManager';
import Calculator from './assets/components/Calculator';
 
const App = () => {

  return (
    <div className="App">
      <WindowManager>
        <ConnectionManager>
          <Header />
          <Calculator contractName="Calculator" />
        </ConnectionManager>
      </WindowManager>
    </div>
  )
}

export default App
