const express = require('express')
const fileUpload = require('express-fileupload');
const { home, add_product, delete_product } = require('./controller/home')
const app = express()
const port = 3000
// const multer = require('multer')
// const upload = multer()

app.use(fileUpload());
app.use(express.urlencoded());
// app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.get('/', home)
app.post('/them-san-pham', add_product)
app.get('/xoa-san-pham', delete_product)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})