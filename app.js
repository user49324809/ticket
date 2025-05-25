const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sequelize = require("./config/db");
const ticketRoutes = require("./routes/ticket.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Статические файлы (фронтенд)
app.use(express.static(path.join(__dirname, "public")));

app.use("/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Unable to connect to DB:", e);
  }
}

start();
