/*jshint esversion: 6 */

var answers = require('./answers.js'),
	tools 	= require('./tools.js');
/* @return les mots du messages en un tableau */

function getWordsFromMessage(message) {
	return message.split(/ |\'/);
}

/* A refaire */
function searchRelation(words) {
	if (words.length==3) return words[1];

	return false;
}

/* Version 2 de isRelationTrue avec la nouvelle BD JSON
@return un code indiquant la présence et le poids de la relation dans la BD
-1 non présente ; 0 présente mais négative ; 1 présente et positive */
function isRelationTrue(words, obj, mot2)
{
	const tempid = '4'; // l'idMot=4 correspond au mot "ordinateur"
	var rel; var res = {};
	for (rel in obj)
	{
		if (obj[rel].idMot==tempid & obj[rel].mot==mot2.word)
		{

			res.code = (obj[rel].poid > 0)?1:0;
			res.relation = obj[rel].relation;
			return res;
		}
	}
	res.code = -1;
	return res;

}

/* @return le second mot à analyser dans la phrase */
function secondWord(first,words)
{
	var w;
	for (w in words)
	{
		if ((words[w].role === "Nom") && (words[w].word !== first.word)) // à modifier plus tard
		{
			return words[w];
		}
	}
	return -1;
}
/* @return le premier mot à analyser dans la phrase */
function firstWord(words)
{
	var w;
	for (w in words)
	{
		if (words[w].role == "Nom") // à modifier plus tard
		{
			return words[w];
		}
	}
	return -1;
}

/* @return la chaine words en ayant modifié le rôle des mots "Est-ce que" */
function modifIfQuestion(words)
{
	words[0].role = "Question";
	words[1].role = "Question";
	return words;
}

/* @return la relation adéquate au verbe donné */
function laRelation(verbe)
{
	var tabRelations = [
		{"relation" : "r_carac", "mot" : "est"},
		{"relation" : "r_isa", "mot" : "a"}
	];

	function t(tabRelations){
		return tabRelations.mot === verbe;
	}

	var res = tabRelations.find(t);

	if (res) return res.relation;
	return null;
}

/* corrige le ":" */
function fixRole(role)
{
	return role.substring(0, role.length - 1); // Enlever le ':' après le role r_pos
}

/* @return le rôle du mot donné ("Nom", "Déterminant" ou la relation) */
function roleWord(word, obj)
{
	var rel;
	var temp = word.word;

	if (tools.isArticle(word.word)) return "article";
	if (tools.isAdjectif(word.word)) return "adjectif";
	if (laRelation(word.word)) return laRelation(word.word);

	for (rel in obj)
	{
		if (word.word == "ordinateur") temp = 4;
		if (temp == obj[rel].idMot) //temp à remplacer par le mot quand il y aura une fonction pour rechercher le mot par l'id
		{
			let role = obj[rel].relation;
			if (role=='r_pos') return fixRole(obj[rel].mot);
		} else return "Nom";
	}
}

/* @return le tableau de mots en y ajoutant leurs rôles */
function allRoleWord(words,obj)
{
	var rel,w;
	for (w in words)
	{
		words[w].role = roleWord(words[w],obj);
	}
	return words;
}

/* @return le tableau de mots en leur ajoutant un paramètre */
function giveWord(analyzed)
{
	var words = {}; var word;
	for (word in analyzed)
	{
		words[word] = {};
		words[word].word = analyzed[word];
	}
	return words;
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

/* @return un String contenant le message à afficher selon le cas (question, affirmation) */
function getAnswer(words,obj)
{
    var first = firstWord(words);
    var second = secondWord(first,words);
    var result_isRelationTrue = isRelationTrue(words,obj,second);

    answers.sendBackAnswer(first,second,result_isRelationTrue,words);
}


exports.process = function(message)
{


    var fs = require("fs");
    var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
    var contentTraite = content.replace(/'/g,'"');
    const obj = JSON.parse(contentTraite);


    var analyzed = getWordsFromMessage(message);
    console.log(analyzed);
    var words = giveWord(analyzed);
    words = allRoleWord(words,obj);

    console.log(words);
    words = modifIfQuestion(words);
	console.log(words);


    getAnswer(words,obj);
	parseMessage(message);
};


function parseMessage(message){

	var words = getWordsFromMessage(message);
	var rel = "";
	var index_verbe = -1;

	if (words[0] === "Est-ce" && words[1]=== "que")
		words.splice(0,2);
	if (words[words.length-1]=== "?")
		words.splice(words.length-1);

	findRelation(words);

}

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
