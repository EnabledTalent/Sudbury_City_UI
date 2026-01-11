import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Programs from "./components/programs";
import Services from "./components/Services";
import Jobs from "./components/Jobs";
import Events from "./components/Events";
import "./App.css";
import AiCtaFooter from "./components/AiCtaFooter";


export default function App() {
  return (
    <>
      <Navbar />

      <Hero />

      <Programs />

      <Services />

      <Jobs />

      <Events />
      
      <AiCtaFooter/>
    </>
  );
}
