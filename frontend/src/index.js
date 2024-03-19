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
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/gamefield" element={<GameField />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
