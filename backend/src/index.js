require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes/index");
const prisma = require("./db");
const { startAutoFetchScheduler } = require("./scheduler");

const app = express();
let stopScheduler = null;

app.use(cors());
app.use(express.json());


app.use("/api", routes);

app.get("/health", (req, res) => {
    res.json({ ok: true });
});


app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        ok: false,
        error: err.message || "Internal Server Error",
    });
});



const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
    stopScheduler = startAutoFetchScheduler();
});


async function shutdown(signal) {
    console.log(`Received ${signal}. Shutting down...`);

    try {
        if (typeof stopScheduler === "function") {
            stopScheduler();
        }

        server.close(async () => {
            try {
                await prisma.$disconnect();
                process.exit(0);
            } catch (err) {
                console.error("Shutdown error:", err);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error("Shutdown error:", err);
        process.exit(1);
    }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
