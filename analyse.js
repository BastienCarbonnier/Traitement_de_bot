/*jshint esversion: 6 */
var affirmation = require('./affirmations.js'),
		question		= require('./questions.js'),
		tools 			= require('./tools.js'),
		fs 				= require('fs');
	//bdd = require('./functions_bdd.js');

	/**
	 * Function call by bots
	 * @param  {String} message
	 * @param  {String} pseudo
	 * @param  {Map} hashmap
	 */
	exports.parse = function(message,pseudo,hashmap)
	{
		var words = getWordsFromMessage(message);
		logMessageReceived (message,pseudo);
		tools.isQuestion(words,function(res,words){
			if (res){
				question.process(words,pseudo,hashmap);
			}
			else {
				affirmation.process(words,pseudo,hashmap);
			}
		});

	};
	function getWordsFromMessage(message) {
		return message.split(/ /);
	}
	function logMessageReceived (message,pseudo){
		var date = new Date();
		var month = date.getMonth()+1;
		var date_string = date.getDate() + ":"+ month+":"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" ";
		var log = "\n" + date_string + "; " + pseudo + " ;" + message;

	    var logger = fs.createWriteStream("./logs.txt", {
	        flags: 'a' // 'a' means appending (old data will be preserved)
	    });

	    logger.write(log);
		logger.end();
	}
