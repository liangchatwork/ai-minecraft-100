import { App } from "./app/App";
import "./app/styles.css";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app element.");
}

const app = new App(root);
app.start();