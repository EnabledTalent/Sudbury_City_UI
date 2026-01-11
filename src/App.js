import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Jobs from "./components/Jobs";
import JobDetails from "./components/JobDetails";

// other sections
import Hero from "./components/hero";
import Programs from "./components/programs";
import Services from "./components/Services";
import Events from "./components/Events";
import AiCtaFooter from "./components/AiCtaFooter";
import JobsList from "./components/JobsList";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Home page (single-page sections) */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Programs />
              <Services />
              <Jobs />
              <Events />
              <AiCtaFooter/>
            </>
          }
        />

        {/* Job details page */}
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
      </Routes>
    </>
  );
}
