const { fork } = require("child_process");
const numCPUs = require("os").cpus().length;
const childModuleName = `${__dirname}/child.js`;

let array = new Array(Number(process.env.SIZE) || 10);
let sum = 0;
const children = new Array(Number(process.env.CHILDREN) || numCPUs);
let currentChild;

// generate random numbers
for (let i = 0; i < array.length; ++i) {
  array[i] = Math.floor(Math.random() * 10);
}

console.log(`Master process: ${process.pid} is running`);

if (process.env.MODE == "multi") {
  for (
    let i = 0, offset = 0, amount = array.length / children.length;
    i < children.length;
    ++i, offset += amount
  ) {
    currentChild = fork(childModuleName);

    console.log(`Forked worker ${currentChild.pid}`);

    currentChild.on("message", total => {
      let { pid } = currentChild;

      sum += total;
      // console.log("Running total is:", sum);
      console.log(`Worker ${pid} has died`);
    });

    // currentChild.on("exit", ()=> "")

    currentChild.send(array.slice(offset, offset + amount - 1));
  }
} else {
  currentChild = fork(childModuleName);
  currentChild.send(array);
}

process.on("exit", () => console.log("Total sum is", sum));
