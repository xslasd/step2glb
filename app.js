import express from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { readFile } from "fs/promises";
import { exit } from 'process';
import { Storage } from "./storage.js";
import { ExporterWorker } from "./handler.js";

const config = JSON.parse(
    await readFile(new URL('./config.json', import.meta.url))
)
console.log("loading config:", config)
if (config.callback_url == "" || config.port == "") {
    console.log("config file error!")
    exit()
}
const app = express()
const port = 3000
var upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 8 } })
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const storage = new Storage(config)
const exporterWorker = new ExporterWorker(storage)



app.post('/convertwork/v1/importfile', upload.single('file'), (req, res) => {
    let data = req.body
    if (data.file_name == "" || data.request_id == "" || req.convert_type == "" || req.save_path == "") {
        res.json({ code: 4000, msg: "Request parameter error. Verify mandatory parameters" })
        return
    }
    if (data.file == "" && data.url == "") {
        res.json({ code: 4000, msg: "Request parameter error. Verify mandatory parameters" })
        return
    }

    data.gid = randomUUID()
    data.urlType = 1
    exporterWorker.export(data)
    res.json({ code: 0, msg: "ok", data: data.gid })
})

app.get('/convertwork/v1/progress', (req, res) => {
    let data = req.query
    if (data.gid == "") {
        res.json({ code: 4000, msg: "Request parameter error. Verify mandatory parameters" })
        return
    }
    let v = storage.getExportMap(data.gid)
    if (v == undefined) {
        res.json({ code: 4003, msg: "Conversion file progress information does not exist" })
        return
    }
    res.json({ code: 0, msg: "ok", data: v })
})

app.use((err, req, res, next) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ code: 4130, msg: 'File too large: the import limit is 10 MiB' })
        return
    }
    if (err && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) {
        res.status(400).json({ code: 4000, msg: err.message })
        return
    }
    next(err)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
