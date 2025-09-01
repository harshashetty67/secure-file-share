import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import SignIn from './routes/SignIn';
import Landing from './routes/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
