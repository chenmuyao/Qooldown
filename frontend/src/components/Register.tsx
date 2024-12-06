import React from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const handleRegister = async (username: string, password: string) => {
    const response = await fetch("/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error("Failed to login");
    } else {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", data.data.id);
      localStorage.setItem("userName", data.data.username);
      navigate("/home");
      //navigate(`/game/${data.gameId}`);
    }
  };

  return <AuthForm onSubmit={handleRegister} isRegister={true} />;
};

export default Register;
