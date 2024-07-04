import React, { useState } from 'react';
import axios, { isAxiosError } from 'axios'


import { useHistory } from 'react-router';

export function root() {
    const history = useHistory();
    const handleRename = () => {
        history.push("/rename"); // Navigate to /login route
    };
    const handleRegister = () => {
        history.push("/register"); // Navigate to /login route
    };



    return (
        <div className="App">
            <header className="App-header">
                <h1>HTTP Post Requests</h1>
            </header>
            <button className="rename" onClick={handleRename}>Rename</button>
            <button className="register" onClick={handleRegister}>Register</button>
        </div>
    );
}