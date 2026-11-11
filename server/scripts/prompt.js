const readline = require('node:readline');

function ask(question) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => terminal.question(question, (answer) => { terminal.close(); resolve(answer.trim()); }));
}

function askHidden(question) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') return ask(question);
  return new Promise((resolve, reject) => {
    let value = '';
    process.stdout.write(question);
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    const done = (answer, error) => {
      process.stdin.off('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error); else resolve(answer);
    };
    const onKey = (character, key = {}) => {
      if (key.ctrl && key.name === 'c') return done('', new Error('Отменено.'));
      if (key.name === 'return' || key.name === 'enter') return done(value);
      if (key.name === 'backspace') { value = value.slice(0, -1); return; }
      if (character && !key.ctrl && !key.meta && value.length < 200) value += character;
    };
    process.stdin.on('keypress', onKey);
    process.stdin.resume();
  });
}

module.exports = { ask, askHidden };
