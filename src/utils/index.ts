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
    startLine: 0,
    starIndex: parseInt(array[0]),
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

/* マーク列のタイトルを取り出す */
export const getScenarioTitle = (csv: string, pos: string) => {
  try {
    const csvArray = CSV.parse(csv).map((v) => v);
    const p = strToPos(pos);
    return csvArray[0][p.data.length - 1].value;
  } catch (err) {
    console.error(err);
    return "";
  }
};

/* マークのある(空文字でない)項目を抜き出す */
export const csvToScenario = (csv: string, pos: string) => {
  try {
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
          // マークがある項目
          if (row[p.data.length - 1].value) {
            const v = [{ value: `${index}`, mark: row[p.data.length - 1].value }, ...ret];
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
  } catch (err) {
    console.error(err);
    return [];
  }
};

/* 穴埋め項目を空欄にする */
export const scenarioJoin = (scenario: ScenarioItem[][], pos: string) => {
  try {
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
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const joinItem = (scenario: CSV.Item[][], pos: string, title = "") => {
  try {
    const p = strToPos(pos);
    const ret: (CSV.Item & { mark?: string })[][] = [];
    scenario.forEach((line, i) => {
      if (p.data.some((v, i) => p.capital[i] && line[v + 1].value !== "")) {
        const m = line[0] as CSV.Item & { mark?: string };
        ret.push(
          line.map((v) => {
            const value = m.mark ? v.value.replace(/({{.+}})/, m.mark) : v.value;
            return { ...v, value };
          })
        );
      } else {
        const pre = ret[ret.length - 1];
        const m = line[0] as CSV.Item & { mark?: string };
        line.forEach((v, i) => {
          const value = m.mark ? v.value.replace(/({{.+}})/, m.mark) : v.value;
          pre[i].value = `${pre[i].value}\n${value}`;
        });
      }
    });
    return ret.map((v, i) => {
      const t = [...v];
      const idx = i + 1 - p.starIndex;
      if (idx <= 0) {
        t[0].value = ``;
      } else {
        t[0].value = `${idx}`;
      }
      return t.slice(0, t.length - 1).map((v, j) => {
        if (i === 0 && j === 0) return { ...v, value: title };
        const value = v.value
          .split("\n")
          .filter((v) => v !== "")
          .join("\n");
        return { ...v, value };
      });
    });
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const makeHeader = (scenario: CSV.Item[][]) => {
  return [...scenario];
};
