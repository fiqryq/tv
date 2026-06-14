import { ApplicationMenu, BrowserWindow, Updater, defineElectrobunRPC } from "electrobun/bun";
import { queries } from "./db";
import type { AppRPCSchema } from "../shared/rpcSchema";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

ApplicationMenu.setApplicationMenu([
  {
    label: "TV",
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "showAll" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { role: "toggleFullScreen" },
    ],
  },
]);

const rpc = defineElectrobunRPC<AppRPCSchema, "bun">("bun", {
  handlers: {
    requests: {
      getPlaylists: () => queries.getAll.all(),
      addPlaylist: ({ id, name, url }) => {
        queries.insert.run(id, name, url);
      },
      removePlaylist: ({ id }) => {
        queries.delete.run(id);
      },
      updateChannelCount: ({ id, channelCount }) => {
        queries.updateCount.run(channelCount, id);
      },
      renamePlaylist: ({ id, name }) => {
        queries.updateName.run(name, id);
      },
    },
  },
});

async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      return DEV_SERVER_URL;
    } catch { }
  }
  return "views://mainview/index.html";
}

const url = await getMainViewUrl();

new BrowserWindow({
  title: "",
  url,
  titleBarStyle: "hiddenInset",
  trafficLightOffset: { x: 16, y: 16 },
  frame: {
    width: 1280,
    height: 760,
    x: 100,
    y: 80,
  },
  rpc,
});
