var tools = require('./tools.js');

exports.process = function(message)
{

    var fs = require("fs");
    var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
    var contentTraite = content.replace(/'/g,'"');
    var obj = JSON.parse(contentTraite);


    var words_tab = getWordsFromMessage(message);
    console.log(words_tab);
    var analyzed = analyseWords(words_tab);
    console.log(analyzed);
    /*
    var words = giveWord(analyzed);
    words = allRoleWord(words,obj);

    console.log(words);


    var finalMessage = "";

    finalMessage += printSentence(words,question,obj);

    return finalMessage;
    */
   return printSentenceAnalyzed(analyzed);
};

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
function Word (word,role) {
  this.word = word;
  this.role = role;
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
