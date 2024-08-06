import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import Loading from "./components/loading";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Recovery from "./Pages/Recovery";

import Start from "./Pages/Start";
import Persona from "./Pages/Persona";
import Card from "./Pages/Card";
import Shoppings from "./Pages/Shopping";
import ShoppingId from "./Pages/ShoppingId";
import Settings from "./Pages/Settings";

export default function RoutesApp() {
    const { isAuthenticated, loadingPage } = useContext(AuthContext);

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <>
            {!isAuthenticated ? (
                <Routes>
                    <Route path="*" element={<Navigate to='/' />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/recovery" element={<Recovery />} />
                </Routes>
            ) : (
                <Routes>
                    <Route path="*" element={<Navigate to='/' />} />
                    <Route path="/" element={<Start />} />
                    <Route path="/persona" element={<Persona />} />
                    <Route path="/card" element={<Card/>} />
                    <Route path="/shopping" element={<Shoppings/>} />
                    <Route path="/shopping/:id" element={<ShoppingId/>} />
                    <Route path="/settings" element={<Settings/>} />
                </Routes>
            )}
        </>
    )
}
