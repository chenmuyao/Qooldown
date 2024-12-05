import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { RetroProvider } from "./contexts/RetroContext";
import Home from "./pages/Home";
import Retro from "./pages/Retro";
import Header from "./components/Header";
import RegisterPage from "./pages/RegisterPage";
import RetroListPage from "./pages/retroList";
import CreateTemplate from "./pages/CreateTemplate";
import TemplateListPage from "./pages/TemplateList";

const App: React.FC = () => {
  return (
    <SocketProvider>
      <RetroProvider>
        <Router>
          <Header />
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/retro/:id" element={<Retro />} />
              <Route path="/create-template" element={<CreateTemplate />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/retroList" element={<RetroListPage />} />
              <Route path="/templateList" element={<TemplateListPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </RetroProvider>
    </SocketProvider>
  );
};

export default App;
