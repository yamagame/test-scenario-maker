import React from "react";
import "./App.css";
import { copyToClipboard, csvToScenario, scenarioJoin, ScenarioItem, joinItem } from "utils";
import * as CSV from "utils/csv-parser";

type Config = {
  pos: string;
};

const initialConfig: Config = {
  pos: "0:A:B:C",
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
  const [scenario, setScenario] = React.useState<ScenarioItem[][]>([]);
  const [pos, setPos] = React.useState(initialConfig.pos);

  React.useEffect(() => {
    const config = loadConfig();
    setPos(config.pos);
  }, []);

  const onUpdateCsv = (value: string) => {
    setCsv(value);
  };

  React.useEffect(() => {
    setScenario(csvToScenario(csv, pos));
  }, [csv, pos]);

  const result = React.useMemo(() => scenarioJoin(scenario, pos), [scenario, pos]);

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
            copyToClipboard(CSV.stringify(joinItem(scenarioJoin(scenario, pos), pos)));
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
            placeholder="0:A:B:C"
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
                  <div key={`${i}-${j}`} className={j === 0 ? "maker-index" : "maker-cell"}>
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
