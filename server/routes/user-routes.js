const express = require('express');
const router = express.Router();

const AWS = require("aws-sdk");

const awsConfig = {
  region: "us-east-2",
//   endpoint: "https://dynamodb.us-east-2.amazonaws.com"
//   endpoint: "http://localhost:8000",
};

AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = "DeepThoughts";

router.get('/users', (req,res) =>{
    const params = {
        TableName:table
    };
//Scan return all items in the table
    dynamodb.scan(params, (err, data) =>{
        if(err) {
            res.status(500).json(err); //an error occured
        } else {
            res.json(data.Items)
        }
    });
})

//get all thoughts from a user
router.get('/users/:username', (req, res) =>{
    console.log(`Querying for thought(s) from ${req.params.username}.`);
    //declare params to define the query call to DynamoDB
    const params = {
        TableName:table,
        KeyConditionExpression: "#un = :user",
        //alias
        ExpressionAttributeNames:{
            "#un": "username",
            "#ca": "createdAt",
            "#th": "thought"
        },
        ExpressionAttributeValues:{
            ":user" : req.params.username
        },
        ProjectionExpression: "#th, #ca",
        //descending by createdAt date
        ScanIndexForward:false
    };

dynamodb.query(params, (err, data) =>{
    if(err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        res.status(500).json(err); //an error occurred
    } else {
        console.log("Query succeeded.");
        res.json(data.Items)
    }
});
});

//create a new thought
router.post('/users', (req, res) =>{
    const params = {
        TableName: table,
        Item:{
            "username": req.body.username,
            "createdAt":Date.now(),
            "thought":req.body.thought
        }
    };

    //database call
    dynamodb.put(params, (err, data) =>{
        if(err){
            console.error("Unable to add items, Error JSON:",JSON.stringify(err, null, 2));
            res.status(500).json(err);
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            res.json({"Added": JSON.stringify(data, null, 2)});
        }
    });
}); 

module.exports = router;