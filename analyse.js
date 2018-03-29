/*jshint esversion: 6 */
var affirmation = require('./affirmations.js'),
		question		= require('./questions.js'),
		tools 			= require('./tools.js'),
		fs 					= require('fs');
	//bdd = require('./functions_bdd.js');


	/* Fonction principal à appeler dans le bot
	@param un String contenant le message de l'utilisateur
	@return un String contenant le message à renvoyer à l'utilisateur */
	exports.parse = function(message,username,hashmap)
	{

		logMessageReceived (message,username);
		if (tools.isQuestion(message)){
			question.process(message,hashmap);
		}
		else{
			affirmation.process(message,hashmap);
		}

	};

	function logMessageReceived (message,username){
		var date = new Date();
		var month = date.getMonth()+1;
		var date_string = date.getDate() + ":"+ month+":"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" ";
		var log = "\n" + date_string + "; " + username + " ;" + message;

	    var logger = fs.createWriteStream("./logs.txt", {
	        flags: 'a' // 'a' means appending (old data will be preserved)
	    });

	    logger.write(log);
		logger.end();
	}



//Method to use
/*
bdd.SelectAll('SELECT * FROM animal WHERE idanimal=9', function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});

bdd.getRelation(104993,2503675,function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});

bdd.checkRelation(104993,27,2503675,function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});



bdd.existRelation(104993,2503675,function(err,data,exist){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("relation exist ?",exist);

        }
});


bdd.getIdFromWord("ordinateur",function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});
bdd.getWordFromId(94978,function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});

bdd.getRelationFromId(120,function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});



bdd.getIdFromRelation("r_sentiment-1",function(err,data){
        if (err) {
            // error handling code goes here
            console.log("ERROR : ",err);
        } else {
            // code to execute on data retrieval
            console.log("result from db is : ",data);

        }
});
*/

//console.log("Essai : ", essai.SelectAll('SELECT * FROM animal'));
