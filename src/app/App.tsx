import React from "react";
import "./App.css";
import { copyToClipboard, csvToScenario, scenarioJoin, joinItem, makeHeader } from "utils";
import * as CSV from "utils/csv-parser";

type Config = {
  pos: string;
};

const defaultPos = "1:A:B:C:d:e";

const initialConfig: Config = {
  pos: defaultPos,
};

const configKey = "test-scenario-maker-config";

const loadConfig = () => {
  const config = localStorage.getItem(configKey);
  if (!config) return initialConfig;
  return JSON.parse(config) as Config;
};

const saveConfig = (config: Config) => {
  const c = loadConfig();
  localStorage.setItem(configKey, JSON.stringify({ ...c, ...config }));
};

function App() {
  const [csv, setCsv] = React.useState("");
  const [pos, setPos] = React.useState(initialConfig.pos);

  React.useEffect(() => {
    const config = loadConfig();
    setPos(config.pos);
  }, []);

  const onUpdateCsv = (value: string) => {
    setCsv(value);
  };

  const result = React.useMemo(
    () => makeHeader(joinItem(scenarioJoin(csvToScenario(csv, pos), pos), pos)),
    [csv, pos]
  );

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
            copyToClipboard(
              CSV.stringify(joinItem(scenarioJoin(csvToScenario(csv, pos), pos), pos))
            );
          }}>
          Copy to Clipboard
        </button>
        <button
          className="maker-margin-button"
          onClick={() => {
            setCsv("");
          }}>
          Clear
        </button>
        <div className="maker-text-input">
          <input
            placeholder={defaultPos}
            type="text"
            value={pos}
            onChange={(e) => {
              setPos(e.target.value);
              saveConfig({ pos: e.target.value });
            }}
          />
        </div>
      </div>
      {/* <div className="maker-container">
        {scenario.map((line, i) => {
          return (
            <div key={`${i}`} className={i > 0 ? "maker-col" : "maker-col-first"}>
              {line.map((v, j) => {
                return (
                  <div key={`${i}-${j}`} className={j === 0 ? "maker-index" : "maker-cell"}>
                    <pre key={`${i}-${j}`}>
                      <code>
                        {v.value}
                        {v.filled ? "*" : ""}
                      </code>
                    </pre>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div> */}
      <div className="maker-container">
        {result.map((line, i) => {
          return (
            <div key={`${i}`} className={i > 0 ? "maker-col" : "maker-col-first"}>
              {line.map((v, j) => {
                return (
                  <div
                    key={`${i}-${j}`}
                    className={j === 0 ? "maker-index" : j === 2 ? "maker-cell-1" : "maker-cell-2"}>
                    <pre key={`${i}-${j}`}>
                      <code>{v.value}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
