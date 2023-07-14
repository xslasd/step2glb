import { randomUUID } from 'crypto';
import { LogStorage } from "./logstorage.js";
import { ExporterWorker } from "./handler.js";

const logStorage = new LogStorage()
const exporterWorker = new ExporterWorker(logStorage)
var data = {
    gid: "debug",
    request_id: "1",
    urlType: 2,
    url: "./testfiles/3dm/RhinoLogo.3dm",
    file_name: "RhinoLogo.3dm",
    convert_type: "glb",
    save_path: "",
}
exporterWorker.export(data)