import * as CSV from "utils/csv-parser";

export type ScenarioItem = CSV.Item & { filled?: boolean };

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

const alphaToNumber = (str: string) => {
  const c = str.charCodeAt(0);
  const code_A = "A".charCodeAt(0);
  const code_Z = "Z".charCodeAt(0);
  if (c >= code_A && c <= code_Z) {
    return `${c - code_A}`;
  }
  const code_a = "a".charCodeAt(0);
  const code_z = "z".charCodeAt(0);
  if (c >= code_a && c <= code_z) {
    return `${c - code_a}`;
  }
  return str;
};

const strToPos = (pos: string) => {
  const array = pos
    .split(":")
    .map((v) => v.trim())
    .filter((v) => v !== "");
  return {
    startLine: parseInt(array[0]),
    data: [...array.slice(1).map((v) => parseInt(alphaToNumber(v)))],
    capital: [...array.slice(1).map((v) => v.match(/^[A-Z]+$/) !== null)],
  };
};

const trimSameValue = (src: ScenarioItem[], target: ScenarioItem[]) => {
  const r: ScenarioItem[] = src.map((s, i) => {
    if (target[i]) {
      if (target[i].value === s.value && s.filled) {
        return { value: "" };
      }
    }
    return s;
  });
  return r;
};

/* ◯のついた項目を抜き出す */
export const csvToScenario = (csv: string, pos: string) => {
  const csvArray = CSV.parse(csv).map((v) => v);
  const p = strToPos(pos);
  let prestr: ScenarioItem[] = [];
  const t = new Array(p.data.length).fill(0);
  const temp = csvArray.map((row, rowInd) => {
    if (rowInd >= p.startLine) {
      if (row.length >= p.data.length) {
        if (rowInd > 0) {
          p.data.forEach((v, i) => {
            if (row[v]?.value !== "") {
              t[i]++;
            }
          });
        }
      }
    }
    return [...t];
  });
  let index = 0;
  let lineCount: number[] = [];
  const sum = csvArray.reduce((sum, row, rowInd) => {
    if (rowInd >= p.startLine) {
      if (row.length >= p.data.length) {
        const ret: CSV.Item[] = p.data.map((v) => {
          return {
            value: row[v]?.value || prestr[v]?.value || "",
            filled: row[v]?.value ? false : lineCount[v] === temp[rowInd][v],
          };
        });
        if (row[p.data.length - 1].value) {
          const v = [{ value: `${index}` }, ...ret];
          sum.push(v);
          index++;
          lineCount = temp[rowInd];
        }
        prestr = ret;
      }
    }
    return sum;
  }, [] as CSV.Item[][]);
  return sum;
};

/* 穴埋め項目を空欄にする */
export const scenarioJoin = (scenario: ScenarioItem[][], pos: string) => {
  const p = strToPos(pos);
  const sum: ScenarioItem[][] = [];
  let preline: ScenarioItem[] = [];
  scenario.forEach((line, i) => {
    if (i > 0) {
      if (
        p.capital.some((v, j) => {
          if (v) return !scenario[i][j + 1].filled;
          return false;
        }) ||
        p.capital.some((v, j) => {
          if (v) return scenario[i - 1][j + 1].value !== scenario[i][j + 1].value;
          return false;
        })
      ) {
        // 異なる項目は表示にする
        sum.push(line);
      } else {
        // 同じ項目は非表示にする
        const t = [...line];
        t[0] = { ...line[0], filled: true };
        sum.push(t);
      }
    } else {
      sum.push(line);
    }
  });
  return sum.map((v, i) => {
    if (i > 0) {
      return trimSameValue(v, sum[i - 1]);
    }
    return trimSameValue(v, preline);
  });
};

export const joinItem = (scenario: CSV.Item[][], pos: string) => {
  const p = strToPos(pos);
  const ret: CSV.Item[][] = [];
  scenario.forEach((line, i) => {
    if (p.data.some((v, i) => p.capital[i] && line[v + 1].value !== "")) {
      ret.push(line);
    } else {
      const pre = ret[i - 1];
      line.forEach((v, i) => {
        pre[i].value = `${pre[i].value}\n${v.value}`;
      });
    }
  });
  return ret.map((v, i) => {
    const t = [...v];
    t[0].value = `${i + 1}`;
    return t.slice(0, t.length - 1);
  });
};
