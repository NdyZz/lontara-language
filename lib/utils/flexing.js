const { getCmd } = require("../rules/getCmd.js");

function flexing(input) {
  const cmdLines = input
    .replace(/\r\n/g, `\n`)
    .split("\n")
    .filter((v) => !!v);
  const cmds = getCmd(cmdLines);

  return cmds;
}

module.exports = flexing;