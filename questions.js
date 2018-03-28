/*jshint esversion: 6 */

var answers = require('./answers.js'),
		tools 	= require('./tools.js'),
		fs 			= require("fs");
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

var hashmap_mc = new Map();
var heber_ordi = {};
exports.process = function(message,hashmap,heber_ordi_init)
{

	hashmap_mc = hashmap;
	heber_ordi = heber_ordi_init;
	/*
	var analyzed = getWordsFromMessage(message);
	console.log(analyzed);
	var words = giveWord(analyzed);
	words = allRoleWord(words,heber_ordi);

	console.log(words);
	words = modifIfQuestion(words);
	console.log(words);


	getAnswer(words,heber_ordi);
	*/
	parseMessage(message);
};


function parseMessage(message){

	var words = getWordsFromMessage(message);
	var rel = "";

	if (words[0] === "Est-ce" && words[1]=== "que")
		words.splice(0,2);
	if (words[words.length-1]=== "?")
		words.splice(words.length-1);

	findRelation(words);


}

function findRelation(words){

	var rel = "";
	var index_verbe = -1;
	var offset_fw = -1;
	var offset_sw = 1;
	console.log("*** Dans findRelation() : \n");
	for (var i in words){
		i = Number(i);
		var w = words[i];


		if (i+1 < words.length && tools.isVerbeIsa(w) && tools.isArticle(words[i+1])){
			index_verbe = i;
			offset_fw += 0;
			offset_sw += 1;
			rel = "r_isa";
			break;
		}
		else if (tools.isVerbeCarac(w)){

			index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_carac";
			break;
		}
		else if (tools.isVerbeHasPart(w)){
			if (i+1 < words.length && tools.isArticle(words[i+1])){
				index_verbe = i;
				offset_fw += 0;
				offset_sw += 1;
			}
			else{
				index_verbe = i;
				offset_fw += 0;
				offset_sw += 0;
			}
			rel = "r_has_part";
			break;
		}
		else if (w === "peut-il"||w === "peut-elle"||w === "peuvent-ils"||w === "peuvent-elles"){
			if(i+1 < words.length && (words[i+1]=== "être"||words[i+1]=== "etre")){

				if(i+2 < words.length && tools.isArticle(words[i+2])){
					rel = "r_isa";
					index_verbe = i;
				}
				else{
					rel = "r_carac";
					index_verbe = i;
				}


				let temp = words[i+1];
				words.splice(i+1,1);
				words[i] = words[i]+" "+temp;

				offset_fw += 0;
				offset_sw += 0;
				break;
			}
			else if(i+1 < words.length && (words[i+1]=== "avoir")){
				let temp = words[i+1];
				words.splice(i+1,1);
				words[i] = words[i]+" "+temp;
				index_verbe = i;

				offset_fw += 0;
				offset_sw += 1;
				rel = "r_has_part";
				break;
			}

		}
	}


	if (index_verbe != -1){
		/*
		console.log("relation verbe : "+rel);
		console.log("index verbe : "+index_verbe);
		console.log(words);
		*/
		checkComposedWord (words,index_verbe,function(words_tab,new_index_verbe){
			/*
			console.log("\n Dans le callback de checkComposedWord\n");
			console.log(words_tab);
			console.log("new index verbe : "+new_index_verbe+" \n");
			*/
			var fw_id = new_index_verbe+offset_fw;
			var sw_id = new_index_verbe+offset_sw;
			var fw = words_tab[fw_id];
			var sw = words_tab[sw_id];

			//console.log("first word : "+fw+"   second word : "+sw+" index_sw = "+Number(sw_id)+" \n");
			tools.checkRelationFromRezoAsk(fw,sw,rel,function(result){
				/*
				console.log("*** Result from checkRelationFrowRezoDump() : \n");
				console.log(result);
				*/
				answers.sendBackAnswerBis(fw,sw,fw_id,sw_id,index_verbe,rel,result,words_tab);
			});
		});

	}
	else{
		console.log("Erreur verbe non trouvé !!!");

		console.log("relation verbe : "+rel+" \n");
		console.log(words);
		answers.sendBackAnswerError("Je n'ai pas réussi à détecter le verbe présent dans la phrase...");
	}

}

function checkComposedWord (words_tab,index_verbe,callback){

	//console.log("*** Dans checkComposedWord : \n");
	for (var i=0;i<index_verbe;i++){
		let mot = "";
		i = Number(i);

		let k = 0;
		for (k=i;k<index_verbe;k++){
			mot += words_tab[k]+" ";
		}
		mot = mot.substring(0,mot.length-1);
		//console.log("mot = "+mot+"\n");

		if(hashmap_mc.get(mot)!== undefined){
			words_tab.splice(i,k-1);
			words_tab[i]=mot;
			index_verbe = index_verbe - k+1;
			break;
		}
	}

	for (var j=index_verbe+1;j<words_tab.length;j++){
		let mot = "";
		j = Number(j);

		let k = 0;
		for (k=j;k<words_tab.length;k++){
			mot += words_tab[k]+" ";
		}
		mot = mot.substring(0,mot.length-1);

		//console.log("mot = "+mot+"\n");

		if(hashmap_mc.get(mot)!== undefined){
			words_tab.splice(j,k-1);
			words_tab[j]=mot;
		}

	}
	callback(words_tab,index_verbe);
}
