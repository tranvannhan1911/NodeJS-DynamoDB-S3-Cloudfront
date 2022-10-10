const AWS = require('aws-sdk')
const uuid = require('uuid')
var _path = require('path');
const dotenv = require('dotenv')

dotenv.config()
console.log(process.env)

const REGION = process.env.REGION;
const S3_BUCKET = process.env.S3_BUCKET;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const DISTRIBUTE_DOMAIN = process.env.DISTRIBUTE_DOMAIN;

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

const docCLient = new AWS.DynamoDB.DocumentClient()
const tableName = "product"


exports.home = (req, res, next) => {
    const params = {
        TableName: tableName
    }
    docCLient.scan(params, (err, data) => {
        if(err){
            console.log(err)
            res.send("Lỗi server")
            return;
        }
        res.render('../views/home.ejs', {data: data.Items});
    })
}



const uploadFile = async (file, callback) => {
    const prefix = "san-pham"
    const filename = file.name
    const path = `${prefix}/${filename}`
    const params = {
        // ACL: 'public-read',
        Body: file.data,
        Bucket: S3_BUCKET,
        Key: path,
        ContentType: file.mimetype
    };

    myBucket.putObject(params)
    .on('httpUploadProgress', (evt) => {
        console.log(evt.loaded)
        console.log("uploading: ", Math.round((evt.loaded / evt.total) * 100))
    })
    .send((err) => {
        if (err) {
            console.log(err)
            // message.error("Không thể tải ảnh lên, vui lòng thử lại")
            return false;
        }
        console.log("oke")
        const url = `${DISTRIBUTE_DOMAIN}/${path}`
        callback(url)
    })
}

exports.add_product = async (req, res, next) => {
    const file = req.files.hinh_anh
    const prefix = "san-pham"
    const extension = _path.extname(file.name).substr(1)
    const path = `${prefix}/${uuid.v4()}.${extension}`
    const params = {
        Body: file.data,
        Bucket: S3_BUCKET,
        Key: path,
        ContentType: file.mimetype
    };

    myBucket.putObject(params)
    .on('httpUploadProgress', (evt) => {
        console.log(evt.loaded)
        console.log("uploading: ", Math.round((evt.loaded / evt.total) * 100))
    })
    .send((err) => {
        if (err) {
            console.log(err)
            // message.error("Không thể tải ảnh lên, vui lòng thử lại")
            return false;
        }
        console.log("oke")
        const image_url = `${DISTRIBUTE_DOMAIN}/${path}`
        const params = {
            TableName: tableName,
            Item: {
                ...req.body,
                hinh_anh: image_url
            }
        }
        docCLient.put(params, (err, data) => {
            if(err){
                console.log("Lỗi", err)
                res.send("Không thể thêm sản phẩm mới")
                return;
            }
            res.redirect("/")
        })
    })
}

exports.delete_product = (req, res, next) => {
    console.log(req.query)
    const params = {
        TableName: tableName,
        Key: {
            "ma_sp": req.query.ma_sp
        }
    }
    docCLient.delete(params, (err, data) => {
        if(err){
            console.log("Lỗi", err)
            res.send("Không thể xóa sản phẩm")
            return;
        }
        res.redirect("/")
    })
}