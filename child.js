process.on("message", numbers => {
  console.log(`Worker ${process.pid} started`);

  const total = numbers.reduce(
    (previousValue, currentValue) => previousValue + currentValue
  );

  process.send(total);

  process.disconnect();
});
