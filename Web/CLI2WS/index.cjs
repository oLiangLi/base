const ws = require("ws");
const clild_process = require("child_process");

const PORT = process.env["PORT"] || "13000";
const HOST = process.env["HOST"] || "localhost";

function usage() {
  console.error(`usage: node CLI2WS/index.cjs [--count=CLIENT_COUNT] <CLI_PATH> ...`);
  process.exit(1);
}

const [CLIENT_COUNT, CLIENT_ARGV] = (function () {
  if (process.argv.length < 3) usage();

  const m = process.argv[2].match(/^--count=(\d+)$/);
  if (m) {
    return [parseInt(m[1]), process.argv.slice(3)];
  }

  return [1, process.argv.slice(2)];
})();

if (CLIENT_COUNT < 1 || CLIENT_COUNT > 10000) {
  console.error(`invalid CLIENT_COUNT: ${CLIENT_COUNT}`);
  usage();
}

if (CLIENT_ARGV.length < 1) {
  usage();
}

console.info(`HOST: ${HOST}, PORT: ${PORT}`);
console.info(`CLIENT_COUNT: ${CLIENT_COUNT}, CLIENT_ARGV: ${CLIENT_ARGV.join(" ")}`);

const all_clients = new Set();

const wss = new ws.Server({ port: PORT, host: HOST });
wss.on("connection", function connection(ws, req) {
  const client_address = req.connection.remoteAddress;
  console.info(`Client ${client_address} connected}`);

  if (all_clients.size >= CLIENT_COUNT) {
    ws.send(`429 Too Many Clients\r\n`);
    return ws.close();
  }

  try {
    const child = clild_process.spawn(CLIENT_ARGV[0], CLIENT_ARGV.slice(1), {
      stdio: ["pipe", "pipe", "inherit"],
    });

    let timer = null;
    all_clients.add(child);

    function OnExit(err) {
      console.info(`Client ${client_address} disconnected}`);
      if (err) console.error(err?.stack);
      all_clients.delete(child);

      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      ws.close();
    }

    function CloseClient(err) {
      if (err) console.error(err?.stack);

      child.stdin.end();
      timer = setTimeout(() => {
        child.kill("SIGTERM");
        timer = setTimeout(() => {
          child.kill("SIGKILL");
        }, 10000);
      }, 30000);
    }

    child.on("error", function (err) {
      CloseClient(err);
    });
    child.on("exit", function (code, signal) {
      if (0 === code) OnExit(null);
      else OnExit(new Error(`child process exited with code ${code}, signal ${signal}`));
    });

    child.stdout.on("data", function (data) {
      ws.send(data, (err) => {
        if (err) CloseClient(err);
      });
    });

    ws.on("message", function (message) {
      if (Array.isArray(message)) message = Buffer.concat(message);
      else if (false === message instanceof Buffer) message = Buffer.from(message);
      child.stdin.write(message, (err) => {
        if (err) CloseClient(err);
      });
    });

    ws.on("close", function () {
      CloseClient(null);
    });

    ws.on("error", function (err) {
      CloseClient(err);
    });
  } catch (err) {
    ws.send(`\r\n500 Internal Server Error\r\n${err.stack}\r\n`);
    return ws.close();
  }
});
