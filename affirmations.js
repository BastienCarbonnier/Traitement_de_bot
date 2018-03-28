/*jshint esversion: 6 */
var tools = require('./tools.js'),
    bot   = require('../server.js'),
    fs    = require("fs");



exports.process = function(message)
{
    var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
    var contentTraite = content.replace(/'/g,'"');
    var obj = JSON.parse(contentTraite);

    if (message[message.length-1]===".") message = message.substring(0,message.length-1);
    var words_tab = getWordsFromMessage(message);
    console.log(words_tab);
    findRelation(words_tab);
    logMessageSended(message);
    //var analyzed = analyseWords(words_tab);
    //console.log(analyzed);
    //var rel_id = 4;



    /*
    tools.getDataFromRezoDump(message,rel_id,function(err,message){
            if (err) {
                // error handling code goes here
                console.log("ERROR : ",err);
                bot.sendMessage(err);
                logMessageSended (message);
            } else {
                // code to execute on data retrieval
                console.log("result from requete to word : "+message+"\n",message);
                bot.sendMessage(message);
                logMessageSended (message);
            }
    });

    var words = giveWord(analyzed);
    words = allRoleWord(words,obj);

    console.log(words);


    var finalMessage = "";

    finalMessage += printSentence(words,question,obj);

    return finalMessage;
    */
};


function findRelation(words){

	var rel = "";
	var index_verbe = -1;
	var firstWord = "";
	var secondWord = "";

	for (var i in words){
		var w = words[i];
		i = Number(i);

		if (i+1 < words.length && tools.isVerbeIsa(w) && tools.isArticle(words[i+1])){
			index_verbe = i+1;
			firstWord = words[index_verbe-2];
			secondWord = words[Number(index_verbe)+1];
			rel = "r_isa";
			break;
		}
		else if (tools.isVerbeCarac(w)){

			index_verbe = i;
			firstWord = words[index_verbe-1];
			secondWord = words[Number(index_verbe)+1];
			rel = "r_carac";
			break;
		}
		else if (tools.isVerbeHasPart(w)){
			if (i+1 < words.length && tools.isArticle(words[i+1])){
				index_verbe = i+1;

				firstWord = words[index_verbe-2];
				secondWord = words[Number(index_verbe)+1];
			}
			else{
				index_verbe = i;

				firstWord = words[index_verbe-1];
				secondWord = words[Number(index_verbe)+1];
			}
			rel = "r_has_part";
			break;
		}
		else if (w === "peut-il"||w === "peut-elle"||w === "peuvent-ils"||w === "peuvent-elles"){
			if(i+1 < words.length && (words[i+1]=== "être"||words[i+1]=== "etre")){

				if(i+2 < words.length && tools.isArticle(words[i+2])){
					rel = "r_isa";
					index_verbe = i+1;
				}
				else{
					rel = "r_carac";
					index_verbe = i;
				}


				let temp = words[i+1];
				words.splice(i+1,1);
				words[i] = words[i]+" "+temp;

				firstWord = words[index_verbe-2];
				secondWord = words[Number(index_verbe)+1];
				break;
			}
			else if(i+1 < words.length && (words[i+1]=== "avoir")){
				let temp = words[i+1];
				words.splice(i+1,1);
				words[i] = words[i]+" "+temp;
				index_verbe = i+1;

				firstWord = words[index_verbe-2];
				secondWord = words[Number(index_verbe)+1];
				rel = "r_has_part";
				break;
			}

		}
	}


	if (index_verbe != -1){

		console.log("relation verbe : "+rel+" \n");
		console.log("index verbe : "+index_verbe+" \n");
		console.log("first word : "+firstWord+"   second word : "+secondWord+" \n");
		console.log("index verbe : "+index_verbe+" \n");
		console.log(words);
		tools.isRelationTrueBis(firstWord, secondWord,function(err,data){
			if (err){
				console.log(err);
			}
			else{
				console.log(data);

			}
		});
	}
	else{
		console.log("Erreur verbe non trouvé !!!");
		console.log("relation verbe : "+rel+" \n");
		console.log(words);
	}

}

function Word (word,role) {
    this.word = word;
    this.role = role;
}
function filledRole (words_tab){
    var word;
    var analyzed_tab = {};
    var rel_id =4;

    for (var w in words_tab){
        word = words_tab[w];
        var last = (w==words_tab.length-1);
        tools.getDataFromRezoDump(word,rel_id,function(err,role,last){
                if (err) {
                    // error handling code goes here
                    console.log("ERROR : ",err);

                } else {

                    analyzed_tab[w] = new Word(word,role);
                    if (last){
                        console.log("result from requete to word : "+analyzed_tab);
                    }
                    // code to execute on data retrieval


                }
        });
        console.log("\n ----- w = "+w+"   tab.length =  "+words_tab.length+" -------");


    }
}

function logMessageSended (message){
    var date = new Date();
    var month = date.getMonth()+1;
    var date_string = date.getDate() + ":"+ month+":"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" ";
    var log = "\n" + date_string + "; BOT ;" + message;

    var logger = fs.createWriteStream("./logs.txt", {
        flags: 'a' // 'a' means appending (old data will be preserved)
    });


    logger.write(log);
    logger.end();
}
/* @return un String contenant le message à afficher dans le cas d'une analyse */
function printSentenceAnalyzed(words)
{
	var word;
	var message = "[Composition de la phrase :\n";
	for (word in words)
	{
		message += "{Mot : " + words[word].word + "; Role : " + words[word].role + "}\n";
	}
	message += "]";
	return message;
}

function getWordsFromMessage(message){
    return message.split(/ |\'/);
}

function analyseWords(words_tab){
    var word,role;
    var analyzed_tab = {};
    for (var w in words_tab){
        word = words_tab[w];

        if (tools.isArticle(word)){
            role = "article";
        }
        else if (tools.isAdjectif(word)){
            role = "adjectif";
        }
        else{
            role = "nom";
        }
        analyzed_tab[w] = new Word(word,role);
    }
    return analyzed_tab;
}

function removeArticles(words_tab){
    var words_n_art = [];
    for (var w in words_tab){
        if (!tools.isArticle(words_tab[w])){
            words_n_art.push(words_tab[w]);
        }
    }
    return words_n_art;
}
