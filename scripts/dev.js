const { spawn } = require("child_process");

function run(command, args, cwd) {
  const process = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  process.on("error", (err) => {
    console.error(`Failed to start ${command}`, err);
  });
}

// Start Docker services
run("docker", ["compose", "up", "-d"], ".");

// Start backend API
run("npm", ["start"], "./server");

// Start worker
run("npm", ["run", "start:worker"], "./server");

// Start frontend
run("npm", ["run", "dev"], "./client/web");
