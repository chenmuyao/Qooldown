import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RetroProvider } from "./contexts/RetroContext";
import Home from "./pages/Home";
import Retro from "./pages/Retro";
import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <RetroProvider>
      <Router>
        <Header />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/retro/:id" element={<Retro />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </RetroProvider>
  );
};

export default App;
