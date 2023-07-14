
export class LogStorage {
    startExport (gid, request_id, convert_type) {
        console.log(gid, request_id, convert_type)
    }
    exportStage (gid, stage, msg) {
        console.log(gid, stage, msg)
    }
    executionErr (gid, stage, err) {
        console.log(gid, stage, err)
    }
    executionSuccess (gid, save_path, file) {

        console.log(gid, save_path)
    }
}