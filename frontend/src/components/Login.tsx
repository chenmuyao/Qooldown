import React from "react";
import AuthForm from "./AuthForm";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const handleLogin = async (username: string, password: string) => {
    const response = await fetch("/users/login", {
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

  return <AuthForm onSubmit={handleLogin} isRegister={false} />;
};

export default Login;

