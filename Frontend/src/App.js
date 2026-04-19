import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Pages/LoginPage/Login";
import Inscription from "./Pages/Inscription/Inscription";
import "./index.css";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Inscription />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;