import React from "react";
import "./App.css";
import SimonBoard from "./SimonBoard";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Simon Says</h1>
        </header>
        <main className="App-main">
          <Routes>
            <Route
              path="/"
              element={
                <Link to="/board">
                  <button className="start-btn">Start Game</button>
                </Link>
              }
            />
            <Route path="/board" element={<SimonBoard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
