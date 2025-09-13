const vm = require('vm');

const parsers = (line) => {
  let m;
  
  // close group
  m = line.match(/ᨌᨄᨊ$/);
  if (m) return {
    exp: ``,
    closeGroup: true,
  };
  
  // console.log
  m = line.match(/ᨆᨘᨕᨗᨈᨕᨗ (.*)/);
  if (m) return {
    exp: `console.log(${m[1]})`,
  };

  // IF / ELSE IF / ELSE
  m = line.match(/ᨊᨑᨙᨀᨚ ([a-zA-Z0-9]+) (.*) ([^\[\]\(\)\n]+)/);
  if (m) return {
    exp: `if (${m[1]} ${m[2]} ${m[3]})`,
    openGroup: true,
  };

  m = line.match(/ᨕᨗᨐᨑᨙᨋᨊᨑᨙ ([a-zA-Z0-9]+) (.*) ([^\[\]\(\)\n]+)/);
  if (m) return {
    exp: `else if (${m[1]} ${m[2]} ${m[3]})`,
    closeGroup: true,
    openGroup: true,
  };

  if (/^ᨊᨑᨙᨀᨚᨉᨙ$/.test(line.trim())) return {
    exp: `else`,
    closeGroup: true,
    openGroup: true,
  };

  // SWITCH / CASE / DEFAULT
  m = line.match(/ᨆᨄᨗᨒᨙ (.+)/);
  if (m) return {
    exp: `switch (${m[1]})`,
    openGroup: true
  };

  m = line.match(/ᨀᨔᨘᨔᨘ (.+)/);
  if (m) return {
    exp: `case ${m[1]}:`,
  };

  if (/^ᨆᨈᨛᨈᨘᨊᨗ/.test(line.trim())) return {
    exp: "default:",
  };

  // FOR
  m = line.match(/ᨒᨕᨚᨑᨗ ([a-zA-Z0-9_]+) ᨄᨚᨒᨙ (\d+) (.*) (\d+)/);
  if (m) return {
    exp: `for (let ${m[1]} = ${m[2]}; ${m[1]} ${m[3]} ${m[4]}; ${m[1]}++)`,
    openGroup: true
  };
  
  m = line.match(/ᨕᨗᨐᨆᨊᨛ ([a-zA-Z]+[a-zA-Z0-9]*) ᨄᨚᨒᨙ ([a-zA-Z]+[a-zA-Z0-9]*)/)
  if (m) return {
    exp: `for (const ${match[1]} of ${match[2]})`,
    openGroup: true,
  };

  // WHILE
  m = line.match(/ᨔᨗᨄᨘᨂᨛᨊ (.+)/);
  if (m) return {
    exp: `while (${m[1]})`,
    openGroup: true
  };

  // DO WHILE
  if (/^ᨄᨚᨁᨕᨘᨊᨗ$/.test(line.trim())) return {
    exp: "do",
    openGroup: true
  };

  m = line.match(/ᨔᨗᨄᨘᨂᨛᨊᨄᨌᨄᨘᨑᨛᨊ (.+)/);
  if (m) return {
    exp: `while (${m[1]});`,
    closeGroup: true
  };

  // FUNCTION
  m = line.match(/ᨕᨀᨙᨁᨘᨊᨊ\s+(\w+)(?:\s+(.+))?/);
  if (m) {
    const rawParams = m[2]?.trim() ?? "";
    const paramsArr = rawParams.length > 0
    ? rawParams.split(/[, ]+/).filter(Boolean)
    : [];
    const params = paramsArr.join(", ");
    return {
      exp: `function ${m[1]}(${params})`,
      openGroup: true,
    };
  }


  // ARROW FUNCTION
  m = line.match(/ᨕᨑᨚᨁᨘᨊ ([a-zA-Z0-9_]+) = \((.*?)\) => (.+)/);
  if (m) {
    return {
      exp: `const ${m[1]} = (${m[2]}) => ${m[3]}`,
    };
  }

  // RETURN
  m = line.match(/ᨄᨒᨗᨔᨘᨕᨗ (.+)/);
  if (m) return {
    exp: `return ${m[1]};`,
  };
  
  // TRY CATCH FINALLY
  if (/^ᨌᨚᨅ$/.test(line.trim())) return {
    exp: "try",
    openGroup: true
  };
  m = line.match(/ᨈᨗᨀᨛᨂᨗ \((.+)\)/);
  if (m) return {
    exp: `catch (${m[1]})`,
    openGroup: true
  };
  if (/^ᨄᨗᨊᨒᨗ$/.test(line.trim())) return {
    exp: "finally",
    openGroup: true
  };
  
  // VARIABLE (let, const, var)
  m = line.match(/ᨒᨕᨙ ([a-zA-Z0-9_]+) = (.+)/);
  if (m) return {
    exp: `let ${m[1]} = ${m[2]};`,
  };

  m = line.match(/ᨀᨚᨈᨈ ([a-zA-Z0-9_]+) = (.+)/);
  if (m) return {
    exp: `const ${m[1]} = ${m[2]};`,
  };

  m = line.match(/ᨄᨑᨅᨛ ([a-zA-Z0-9_]+) = (.+)/);
  if (m) return {
    exp: `var ${m[1]} = ${m[2]};`,
  };
  
  m = line.match(/ᨐᨈᨙᨁ ([a-zA-Z0-9_]+) (.*) (.+)/);
  if (m) return {
    exp: `${m[1]} ${m[2]} ${(m[3])};`,
  };

  // BREAK / CONTINUE / THROW
  if (/^ᨄᨛᨍᨕᨗ$/.test(line.trim())) return {
    exp: "break;",
  };
  if (/^ᨄᨈᨛᨑᨘᨕᨗ$/.test(line.trim())) return {
    exp: "continue;",
  };
  m = line.match(/ᨕᨄᨗᨕᨂᨗ (.+)/);
  if (m) return {
    exp: `throw ${m[1]};`,
  };

  // WITH
  m = line.match(/ᨔᨗᨅᨓ \((.+)\)/);
  if (m) return {
    exp: `with (${m[1]})`,
    openGroup: true
  };

  // SPREAD / REST (manual)
  m = line.match(/ᨈᨒᨛ (.+)/);
  if (m) return {
    exp: `...${m[1]}`,
  };
  m = line.match(/ᨔᨙᨔᨊ (.+)/);
  if (m) return {
    exp: `...${m[1]}`,
  };

  // OPTIONAL CHAINING
  m = line.match(/ᨄᨗᨒᨙᨄᨗᨒᨙ (.+)/);
  if (m) return {
    exp: `${m[1]}?.`,
  };
  
  // DEFAULT
  return null;
}

function getCmd(cmdLines) {
  return cmdLines
  .map((line) => {
      let cmd = parsers(line)
      return cmd;
    })
    .filter((v) => !!v);
}

module.exports = { getCmd };