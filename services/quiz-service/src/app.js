const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoute = require("./routes/modules/health.route");
const quizRoute = require("./routes/modules/quiz.route");
const attemptRoute = require("./routes/modules/attempt.route");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

app.use(healthRoute);
app.use("/api", quizRoute);
app.use("/api", attemptRoute);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
