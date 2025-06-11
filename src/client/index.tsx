import "./styles.css";

import React from "react";
import { createRoot } from "react-dom/client";
import usePartySocket from "partysocket/react";

function App() {
  // Optionally, you can keep the counter or remove it if not needed
  // const [counter, setCounter] = React.useState(0);

  return (
    <div className="App">
      <h1>Where's everyone at?</h1>
      {/* 
      {counter !== 0 ? (
        <p>
          <b>{counter}</b> {counter === 1 ? "person" : "people"} connected.
        </p>
      ) : (
        <p>&nbsp;</p>
      )} 
      */}

      {/* Static SVG World Map */}
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
        <svg
          viewBox="0 0 2000 1001"
          width="100%"
          height="auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="2000" height="1001" fill="#cce6ff" />
          <g>
            {/* Simple world map shape, replace with more detailed SVG if desired */}
            <path
              d="M1848,675Q1777,780,1650,800Q1523,820,1430,900Q1337,980,1200,950Q1063,920,900,950Q737,980,590,900Q443,820,350,800Q257,780,152,675Q47,570,100,400Q153,230,350,130Q547,30,900,50Q1253,70,1450,130Q1647,190,1700,400Q1753,610,1848,675Z"
              fill="#a3d977"
              stroke="#5fa052"
              strokeWidth="15"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App />);
