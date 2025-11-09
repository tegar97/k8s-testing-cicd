const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// Versi app via env untuk demo
const VERSION = process.env.APP_VERSION || "v1.0.3";

app.get("/", (req, res) => {
  res.send(`Hello from my-app ${VERSION}! Rolling out v1.0.9, keep calm.`);
});

app.listen(PORT, () => {
  console.log(`my-app listening on port ${PORT}`);
});
