import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentHome from "./pages/StudentHome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student" element={<StudentHome />} />
    </Routes>
  );
}
