import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
//import { SocketProvider } from "./contexts/SocketContext";
import { RetroProvider } from "./contexts/RetroContext";
import Home from "./pages/Home";
import Retro from "./pages/Retro";
import Header from "./components/Header";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import RetroListPage from "./pages/retroList";
import CreateTemplate from "./pages/CreateTemplate";
import TemplateListPage from "./pages/TemplateList";

const App: React.FC = () => {
  return (
    //  <SocketProvider>
    <RetroProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/retro/:id" element={<Retro />} />
              <Route path="/create-template" element={<CreateTemplate />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/retroList" element={<RetroListPage />} />
              <Route path="/templateList" element={<TemplateListPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RetroProvider>
    //  </SocketProvider>
  );
};

export default App;
