const { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      { exec } = require("child_process");

console.log("Start f-control");

exec("ls -la", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
