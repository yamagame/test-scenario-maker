import React from "react";
import "./App.css";
import { copyToClipboard, csvToScenario } from "utils";
import * as CSV from "utils/csv-parser";

function App() {
  const [csv, setCsv] = React.useState("");
  const [scenario, setScenario] = React.useState<CSV.Item[][]>([]);
  const [pos, setPos] = React.useState("0:A:B:C");

  const onUpdateCsv = (value: string) => {
    setCsv(value);
  };

  React.useEffect(() => {
    try {
      setScenario(csvToScenario(csv, pos));
    } catch (e) {
      //
    }
  }, [csv, pos]);

  return (
    <>
      <div className="maker-top-header">
        <textarea
          placeholder="Paste the tab space scenario matrix here."
          className="maker-textarea"
          value={csv}
          onChange={(e) => onUpdateCsv(e.target.value)}
        />
        <button
          className="maker-button"
          onClick={() => {
            copyToClipboard(CSV.stringify(scenario));
          }}
        >
          Copy to Clipboard
        </button>
        <button
          className="maker-margin-button"
          onClick={() => {
            setCsv("");
          }}
        >
          Clear
        </button>
        <div className="maker-text-input">
          <input
            placeholder="0:A:B"
            type="text"
            value={pos}
            onChange={(e) => {
              setPos(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="maker-container">
        {scenario.map((line, i) => {
          return (
            <div className={i > 0 ? "maker-col" : "maker-col-first"}>
              <div className="maker-index">
                <pre key={`index-${i}`}>
                  <code>{line[0].value}</code>
                </pre>
              </div>
              <div className="maker-cell">
                <pre key={`screen-${i}`}>
                  <code>{line[1].value}</code>
                </pre>
              </div>
              <div className="maker-cell">
                <pre key={`step-${i}`}>
                  <code>{line[2].value}</code>
                </pre>
              </div>
              <div className="maker-cell">
                <pre key={`marker-${i}`}>
                  <code>{line[3].value}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
