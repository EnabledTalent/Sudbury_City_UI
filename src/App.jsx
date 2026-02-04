import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentHome from "./pages/StudentHome";
import ProfileSuccess from "./pages/ProfileSuccess";
import ProfileBuilder from "./pages/ProfileBuilder";
import ViewProfile from "./pages/ViewProfile";
import MyJobs from "./pages/MyJobs";
import Dashboard from "./pages/Dashboard";
import { ProfileProvider } from "./context/ProfileContext";

export default function App() {
  return (
    <ProfileProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student" element={<StudentHome />} />
       <Route path="/student/success" element={<ProfileSuccess />} />
      <Route path="/student/profile" element={<ProfileBuilder />} />
      <Route path="/student/view-profile" element={<ViewProfile />} />
      <Route path="/student/my-jobs" element={<MyJobs />} />
      <Route path="/student/dashboard" element={<Dashboard />} />
    </Routes>
    </ProfileProvider>
  );
}
