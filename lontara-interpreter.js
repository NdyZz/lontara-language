const fs = require("fs");
const { flexing, execCmd } = require("./lib/utils/index.js");

// ================= Engine =====================
let fileLocate = null;
const parseArgs = () => {
  const args = process.argv;

  if (args.length < 3) {
    console.log(
      "Require file args, ex: 'node lontara-interpreter.js example/main.ugi' or 'ugi example/main.ugi'"
    );
    return false;
  }

  fileLocate = args[2];
  if (!fs.existsSync(fileLocate)) {
    console.log(`File "${args[2]}" not found, please verify file location`);
    return false;
  }

  return true;
};

if (!parseArgs()) {
  process.exit(1);
}

const inputbugis = fs.readFileSync(fileLocate, "utf-8");

const result = flexing(inputbugis);
//console.log(result)
execCmd(result);
