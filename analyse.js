
//var bdd = require('./fonctions_bdd.js');

var affirmation = require('./affirmations.js'),
	question	= require('./questions.js'),
	answers		= require('./answers.js'),
	tools 		= require('./tools.js') ;
	//bdd = require('./functions_bdd.js');


	/* Fonction principal à appeler dans le bot
	@param un String contenant le message de l'utilisateur
	@return un String contenant le message à renvoyer à l'utilisateur */
	exports.parse = function(message)
	{

		var fs = require("fs");
		var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
		var contentTraite = content.replace(/'/g,'"');
		const obj = JSON.parse(contentTraite);

		var finalMessage = "";

		if (tools.isQuestion(message)){
			finalMessage = question.process(message);
		}
		else{
			finalMessage = affirmation.process(message);
		}

		return finalMessage;
	};


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
