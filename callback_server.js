import express from "express"
import multer from "multer"
import cors from "cors"

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/file", upload.single("file"), (req, res) => {
    const file = req.file;
    console.log("recv file: ", file);

    res.send({
        code: 200,
        data: "ok",
    });
});

app.listen(1901, () => {
    console.log("listen 1901");
});