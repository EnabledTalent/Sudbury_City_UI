import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Jobs from "./pages/Jobs";
import JobDetails from "./components/JobDetails";

// other sections
import Hero from "./components/hero";
import Programs from "./components/programs";
import Services from "./components/Services";
import AiCtaFooter from "./components/AiCtaFooter";
import JobsList from "./components/JobsList";
import UserSelection from "./pages/UserSelection";
import StudentHub from "./pages/StudentHub";
import ResidentHub from "./pages/ResidentHub";
import Explore from "./pages/Explore";
import ServicesPage from "./pages/ServicesPage";
import TrainingPrograms from "./pages/TrainingPrograms";
import AIAssistant from "./pages/AIAssistant";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* User Selection/Onboarding page */}
        <Route path="/user-selection" element={<UserSelection />} />

        {/* Home page (single-page sections) */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Jobs />
              <Services />

              <Programs />
              
              <AiCtaFooter/>
            </>
          }
        />

        {/* Job details page */}
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Hub pages */}
        <Route path="/student-hub" element={<StudentHub />} />
        <Route path="/resident-hub" element={<ResidentHub />} />

        {/* Explore page */}
        <Route path="/explore" element={<Explore />} />

        {/* Services page */}
        <Route path="/services" element={<ServicesPage />} />

        {/* Training & Programs page */}
        <Route path="/training" element={<TrainingPrograms />} />

        {/* AI Assistant page */}
        <Route path="/ai-assistant" element={<AIAssistant />} />

        {/* Sign In page */}
        <Route path="/sign-in" element={<SignIn />} />

        {/* Sign Up page */}
        <Route path="/sign-up" element={<SignUp />} />

        {/* About page */}
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}
