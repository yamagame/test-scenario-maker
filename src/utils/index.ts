import * as CSV from "utils/csv-parser";

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
  const [startLine, screen, step, marker] = pos.split(":").map((v) => v.trim());
  const ret = {
    startLine: parseInt(startLine), // 行
    screen: parseInt(alphaToNumber(screen)), // 列(画面名)
    step: parseInt(alphaToNumber(step)), // 列(ステップ)
    marker: parseInt(alphaToNumber(marker)), // 列(選択マーカー)
  };
  return ret;
};

export const csvToScenario = (csv: string, pos: string) => {
  const csvArray = CSV.parse(csv).map((v) => v);
  const p = strToPos(pos);
  let prescreen = "";
  let index = 1;
  const sum = csvArray.reduce((sum, row, rowInd) => {
    if (rowInd >= p.startLine) {
      const screen = row[p.screen]?.value || prescreen;
      const step = row[p.step]?.value || "";
      const marker = row[p.marker]?.value || "";
      if (marker) {
        if (sum.length > 0) {
          const last = sum[sum.length - 1];
          if (last[1].value === screen) {
            sum.push([{ value: `${index}` }, { value: "" }, { value: step }, { value: marker }]);
          } else {
            sum.push([
              { value: `${index}` },
              { value: screen },
              { value: step },
              { value: marker },
            ]);
          }
        } else {
          sum.push([{ value: `${index}` }, { value: screen }, { value: step }, { value: marker }]);
        }
        index++;
      }
      prescreen = screen;
    }
    return sum;
  }, [] as CSV.Item[][]);
  return sum;
};
