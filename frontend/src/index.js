import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import GameField from './components/gamefield/Gamefield';
import Lobby from './components/lobby/Lobby';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/gamefield" element={<GameField />} />
                <Route path="*" element={<h1>404 - nem található</h1>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
