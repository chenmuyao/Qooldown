import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Animations de fond complexes et dynamiques */}
      <div className="absolute inset-0 z-0 opacity-50">
        {/* Blobs animés avec des variations plus complexes */}
        <div className="absolute animate-blob top-10 left-20 w-72 h-72 bg-gray-700/30 rounded-full filter blur-2xl animate-pulse"></div>
        <div className="absolute animate-blob animation-delay-2000 top-1/3 right-20 w-64 h-64 bg-gray-600/30 rounded-full filter blur-2xl animate-bounce"></div>
        <div className="absolute animate-blob animation-delay-4000 bottom-20 left-1/3 w-80 h-80 bg-gray-500/30 rounded-full filter blur-2xl animate-spin"></div>

        {/* Couches supplémentaires d'animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-900/70 animate-gradient-x"></div>

        {/* Effets de particules simulés */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full animate-float"
            style={{
              width: `${Math.random() * 10}px`,
              height: `${Math.random() * 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl font-bold mb-6 animate-slide-up">
            Qooldown
            <span className="ml-4 text-gray-400 text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="inline-block mr-2 text-blue-500"
              >
                <rect width="8" height="8" x="3" y="3" rx="2"></rect>
                <path d="M7 11v4a2 2 0 0 0 2 2h4"></path>
                <rect width="8" height="8" x="13" y="13" rx="2"></rect>
              </svg>
              Transformez vos rétrospectives
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 animate-fade-in animation-delay-500">
            Optimisez votre processus d'amélioration continue avec une approche
            moderne et collaborative
          </p>

          <div className="grid grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 mb-4 text-white opacity-80"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                ),
                title: "Créer un template",
                description: "Personnalisez vos modèles de rétrospective",
                bgColor: "bg-blue-600/20 hover:bg-blue-600/40",
                destination: "/create-template",
              },
              {
                icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 mb-4 text-white opacity-80"
                  >
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <path d="M12 11h4"></path>
                    <path d="M12 16h4"></path>
                    <path d="M8 11h.01"></path>
                    <path d="M8 16h.01"></path>
                  </svg>
                ),
                title: "Créer une rétrospective",
                description: "Lancez une nouvelle session collaborative",
                bgColor: "bg-green-600/20 hover:bg-green-600/40",
                destination: "/templateList",
              },
              {
                icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 mb-4 text-white opacity-80"
                  >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ),
                title: "Accéder à une rétrospective",
                description: "Rejoignez une session",
                bgColor: "bg-purple-600/20 hover:bg-purple-600/40",
                destination: "/retroList",
              },
            ].map((card, index) => (
              <div
                key={card.title}
                className={`
                  ${card.bgColor} 
                  border border-gray-700 
                  rounded-2xl p-6 
                  transform transition-all duration-300 
                  hover:-translate-y-4 hover:shadow-2xl
                  animate-slide-up
                  animation-delay-${index * 300}
                `}
              >
                {card.icon()}
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400 mb-4">{card.description}</p>
                <Link
                  to={card.destination ?? "/"}
                  className="
                    inline-flex items-center 
                    text-blue-300 hover:text-blue-200
                    transition-colors
                  "
                >
                  Commencer
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 w-5 h-5"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Élément de décoration techno */}
      <div className="absolute bottom-10 right-10 z-0 opacity-30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-32 h-32 text-gray-500"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Home;
