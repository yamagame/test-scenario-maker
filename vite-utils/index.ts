import path from "path/posix";
import fs from "fs/promises";

/**
 * 指定したディレクトリ内にあるディレクトリのフルパスを連想配列で返す
 */
export const getDirsAsync = async (baseDir: string) =>
  (await fs.readdir(baseDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .reduce((sum, dir) => {
      sum[dir.name] = path.resolve(process.cwd(), path.join(baseDir, dir.name));
      return sum;
    }, {} as { [index: string]: string });

if (require.main === module) {
  async function main() {
    console.log(await getDirsAsync("../src"));
  }
  main();
}
