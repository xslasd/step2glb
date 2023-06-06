import axios from 'axios';
import Minio from 'minio';
import path from 'path';
import FormData from 'form-data';
export class Storage {
    constructor(cfg) {
        this.config = cfg
        this.reqMap = {}
        this.minioClient = null

        if (!cfg.callback_file) {
            this.minioClient = new Minio.Client({
                endPoint: cfg.s3_upload_config.endPoint,
                port: cfg.s3_upload_config.port,
                useSSL: cfg.s3_upload_config.useSSL,
                accessKey: cfg.s3_upload_config.accessKey,
                secretKey: cfg.s3_upload_config.secretKey
            });
        }
    }
    startExport (gid, request_id, convert_type) {
        this.reqMap[gid] = {
            request_id: request_id,
            convert_type: convert_type,
            stage: "LoadStart",
            msg: ""
        }
    }
    listExportMap () {
        return this.reqMap
    }
    getExportMap (gid) {
        return this.reqMap[gid]
    }

    exportStage (gid, stage, msg) {
        this.reqMap[gid].stage = stage
        this.reqMap[gid].msg = msg
        console.log('[' + gid + ']exportStage:', stage, msg)
    }
    executionErr (gid, stage, err) {
        let form = new FormData();
        form.append("request_id", gid)
        form.append("status", 1)
        form.append("stage", stage)
        form.append("msg", err)
        this.callbackResult(form)
        delete this.reqMap[gid];
        console.log('[' + gid + ']executionErr:', err)
    }
    executionSuccess (gid, save_path, file) {
        let form = new FormData();
        form.append("request_id", gid)
        if (this.minioClient != null) {
            let dir = path.join(save_path, gid + ".glb");
            let ref = this
            this.minioClient.putObject(this.config.s3_upload_config.bucketName, dir, file, function (err, etag) {
                if (err) {
                    console.log('[' + gid + ']minioClient PutObject error:', err)
                    form.append("status", 1)
                    form.append("msg", err)
                } else {
                    console.log('[' + gid + ']executionSuccess File uploaded successfully.')
                    form.append("status", 0)
                    form.append("file_path", dir)
                }
                ref.callbackResult(form)
                delete ref.reqMap[gid];
            });
            return
        }
        form.append("status", 0)
        form.append("file", file)
        console.log('[' + gid + ']executionSuccess successfully.')
        this.callbackResult(form)
        delete this.reqMap[gid];
    }


    callbackResult (form) {
        axios.post(this.config.callback_url, form, { headers: form.getHeaders() })
            .then((res) => {
                console.log("callback result ok.")
            })
            .catch((error) => {
                console.error("callback result err:", error)
            })
    }

}
