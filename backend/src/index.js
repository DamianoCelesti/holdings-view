require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});
