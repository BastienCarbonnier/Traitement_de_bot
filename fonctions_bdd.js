var mysql = require('mysql2');

//${mysql.escape(userLandVariable)}
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database : "test"
});

exports.SelectAll = function (sqlQuery, callback)
{
    // simple query
    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        callback(err,results);
        console.log(results);
        connection.end();
      }
    );

};

exports.getRelation = function (id1, id2, callback){

    var sqlQuery = "SELECT * FROM relation WHERE ( n1 = "+ id1 +" OR n1 = "+ id2 +") AND (n2 = "+ id1 +" OR n2 = "+ id2 +")";
    console.log(sqlQuery);
    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        callback(err,results);
        connection.end();
      }
    );
};

exports.checkRelation = function (id1, relation, id2, callback){

    var sqlQuery = "SELECT * FROM relation WHERE ( n1 = "+ id1 +" OR n1 = "+ id2 +") AND (n2 = "+ id1 +" OR n2 = "+ id2 +")"+" AND t='"+relation+"'";
    console.log(sqlQuery);

    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        callback(err,results);
        connection.end();
      }
    );
};

exports.existRelation = function (id1, id2, callback){

    var sqlQuery = "SELECT * FROM relation WHERE ( n1 = "+ id1 +" OR n1 = "+ id2 +") AND (n2 = "+ id1 +" OR n2 = "+ id2 +")";

    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        if (results.length==0)
            callback(null,null,false);
        else
            callback(null,null,true);
        connection.end();
      }
    );
};

exports.getIdFromWord = function (word, callback){

    var sqlQuery = "SELECT eid FROM node WHERE n='"+word+"'";

    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        if (results.length==0)
            callback(null,0);
        else
            callback(null,results);
        connection.end();
      }
    );
};

exports.getWordFromId = function (idWord, callback){

    var sqlQuery = "SELECT n FROM node WHERE eid='"+idWord+"'";

    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        if (results.length==0)
            callback(null,0);
        else
            callback(null,results);
        connection.end();
      }
    );
};


exports.getIdFromRelation = function (relation, callback){

    var sqlQuery = "SELECT id FROM listerelation WHERE relation='"+relation+"'";

    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        if (results.length==0)
            callback(null,0);
        else
            callback(null,results);
        connection.end();
      }
    );
};

exports.getRelationFromId = function (idrelation, callback){

    var sqlQuery = "SELECT relation FROM listerelation WHERE id='"+idrelation+"'";

    connection.query(sqlQuery,function(err, results, fields){
        if (err) return callback(err);
        if (results.length==0)
            callback(null,0);
        else
            callback(null,results);
        connection.end();
      }
    );
};


// create the connection to database


/*
connection.query(
  'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
  ['Page', 45],
  function(err, results) {
    console.log(results);
  }
);*/
