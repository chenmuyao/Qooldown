import { useState } from "react";
import Confetti from "react-confetti";

const ConfettiButton = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleButtonClick = () => {
    setShowConfetti(true);
    // Hide confetti after a few seconds
    setTimeout(() => setShowConfetti(false), 30000);
  };

  return (
    <div className="text-right">
      <button
        onClick={handleButtonClick}
        className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 my-3"
      >
        Je m'ennuie
      </button>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
    </div>
  );
};

export default ConfettiButton;
