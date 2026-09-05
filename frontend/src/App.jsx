import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddTask from "./pages/Addtask.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/add-task" element={<AddTask />} />

        <Route path="/" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;