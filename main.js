const { fork } = require("child_process");
const numberOfCores = require("os").cpus().length;
const workerModuleName = `${__dirname}/worker.js`;

let array = new Array(Number(process.env.SIZE) || 10);
let sum = 0;

// let user know master process is operational
console.log(`Master process: ${process.pid} is running`);

// set function to log results of work to console
function logResult(result) {
  console.log("Total sum is", result);
}

// generate random numbers
for (let i = 0; i < array.length; ++i) {
  let innerArray = new Array(Math.floor(Math.random() * 100 + 1));

  for (let j = 0; j < innerArray.length; ++j) {
    innerArray[j] = Math.floor(Math.random() * 10);
  }

  array[i] = innerArray;
}

// check if user wants to run in multicore mode
if (process.env.MODE == "multi") {
  // create an array to
  const workerCount = Number(process.env.CHILDREN) || numberOfCores;
  let currentWorker;

  for (
    let i = 0, offset = 0, amount = array.length / workerCount;
    i < workerCount;
    ++i, offset += amount
  ) {
    currentWorker = fork(workerModuleName);
    let { pid } = currentWorker;

    console.log(`Forked worker ${pid}`);

    currentWorker.on("message", total => {
      sum += total;
      console.log(`Worker ${pid} has died`);
    });

    // send array to worker to do some work
    currentWorker.send(array.slice(offset, offset + amount - 1));
  }

  // on exit make sure to log result
  process.on("exit", () => logResult(sum));
} else {
  // finally load worker module if necessary
  const work = require(workerModuleName);

  // log master process result to console
  logResult(work(array));
}
