import { randomUUID } from 'crypto';
import { LogStorage } from "./logstorage.js";
import { Storage } from './storage.js';
import { ExporterWorker } from "./handler.js";

//测试
//const logStorage = new LogStorage()
//const exporterWorker = new ExporterWorker(logStorage)

const myCfg = {
    "callback_url": "http://127.0.0.1:1901/file", //the converted model data POST to this url
    "callback_file": true //use axios to POST
}
const myStorage = new Storage(myCfg)

const exporterWorker = new ExporterWorker(myStorage)
var data = {
    gid: "debug",
    request_id: "1",
    urlType: 2,
    url: "./testfiles/stp/test.stp",
    file_name: "test.stp",
    convert_type: "glb",
    save_path: "",
}
exporterWorker.export(data)






