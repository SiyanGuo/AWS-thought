const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');

const paramsConfig = require('../utils/params-config');

//create a temporary storage container that will hold the image files until it is ready to be uploaded to the S3 bucket.
const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

// destination: storage; image is the key!s
const upload = multer({ storage }).single('image');

//instantiate the service object
const s3 = new AWS.S3({
    apiVersion: '2006-03-01'
});

//create the image upload route
router.post('/image-upload', upload, (req, res) => {
    //set up params config
    const params = paramsConfig(req.file);

    //set up s3 service call
    s3.upload(params, (err, data) => {
        if(err) {
            console.log(err);
            res.status(500).send(err);
        }
        res.json(data);
    });
});

module.exports = router;

