/* eslint-disable no-console */

const CDP = require("chrome-remote-interface");

const args = process.argv.slice(2);

const connectionOptions = {
  port: 9090
};

function expandUrl(path) {
  if (/^(https?|file):/.test(path)) {
    return path;
  } else {
    return `file://${process.cwd()}/${path}`;
  }
}

function qunitInit() {
  function qunitLog({ actual, expected, message, result, module, name }) {
    if (result) return;
    if (message) {
      console.log("%s: %s: %s", module, name, message);
    } else {
      console.log(
        `%s: %s: expected: %o; actual: %o`,
        module,
        name,
        expected,
        actual
      );
    }
  }

  return new Promise(resolve => {
    window.addEventListener("load", () => {
      QUnit.log(qunitLog);
      QUnit.done(resolve);
    });
  });
}

let connectRetries = 0;
function connect(options, callback) {
  CDP(options, callback).on("error", err => {
    if (err.code === "ECONNREFUSED" && connectRetries++ < 3) {
      setTimeout(
        () =>
          connect(
            options,
            callback
          ),
        1000
      );
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

connect(
  connectionOptions,
  async client => {
    const version = await CDP.Version(connectionOptions);
    console.log(version.Browser);
    const { Network, Page, Runtime } = client;

    try {
      await Network.enable();
      await Page.enable();
      await Runtime.enable();
      await Network.setCacheDisabled({ cacheDisabled: true });

      Runtime.consoleAPICalled(({ type, args }) => {
        const values = args.map(a => a.value);
        if (type === "log" && values[0] === "stdout:") {
          process.stdout.write(values[1]);
        } else {
          console[type](...values);
        }
      });

      Page.addScriptToEvaluateOnNewDocument({
        source: `_qunitDone = (${qunitInit.toString()})()`
      });

      let totalFailed = 0;
      for (const pathToTest of args) {
        await Page.navigate({ url: expandUrl(pathToTest) });
        await Page.domContentEventFired();
        const done = await Runtime.evaluate({
          expression: `_qunitDone`,
          returnByValue: true,
          awaitPromise: true
        });
        const result = done.result.value;
        console.log(pathToTest, result);
        totalFailed += result.failed;
      }
      if (totalFailed > 0) process.exit(1);
    } catch (err) {
      console.error(err);
      process.exit(1);
    } finally {
      client.close();
    }
  }
);