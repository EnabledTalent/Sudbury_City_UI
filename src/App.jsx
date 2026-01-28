import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentHome from "./pages/StudentHome";
import ProfileSuccess from "./pages/ProfileSuccess";
import ProfileBuilder from "./pages/ProfileBuilder";
import { ProfileProvider } from "./context/ProfileContext";

export default function App() {
  return (
    <ProfileProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student" element={<StudentHome />} />
       <Route path="/student/success" element={<ProfileSuccess />} />
       <Route path="/student/profile" element={<ProfileBuilder />} />
    </Routes>
    </ProfileProvider>
  );
}
