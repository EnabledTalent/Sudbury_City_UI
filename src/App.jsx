import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentHome from "./pages/StudentHome";
import ProfileSuccess from "./pages/ProfileSuccess";
import ProfileBuilder from "./pages/ProfileBuilder";
import ViewProfile from "./pages/ViewProfile";
import MyJobs from "./pages/MyJobs";
import Dashboard from "./pages/Dashboard";
import EmployerHome from "./pages/employer/EmployerHome";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import Candidates from "./pages/employer/Candidates";
import ListedJobs from "./pages/employer/ListedJobs";
import CompanyProfile from "./pages/employer/CompanyProfile";
import PostJob from "./pages/employer/PostJob";
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
      <Route path="/employer/home" element={<EmployerHome />} />
      <Route path="/employer/dashboard" element={<EmployerDashboard />} />
      <Route path="/employer/candidates" element={<Candidates />} />
      <Route path="/employer/listed-jobs" element={<ListedJobs />} />
      <Route path="/employer/company-profile" element={<CompanyProfile />} />
      <Route path="/employer/post-job" element={<PostJob />} />
    </Routes>
    </ProfileProvider>
  );
}
