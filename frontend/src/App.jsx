import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HomeNew from './pages/HomeNew';


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeNew />} />
      {/* <Route path="/new" element={<Home />} /> */}
      
    </Routes>
  );
}

export default App;

