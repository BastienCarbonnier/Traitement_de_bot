//var bdd = require('./fonctions_bdd.js');

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

module.exports = class Analyse {

	/* @return les mots du messages en un tableau */
	static words (message) {
		return message.split(/ |\'/);
	}

	/* A refaire */
	static searchRelation (words) {
		if (words.length==3) return words[1];

		return false;
	}

/* Ancienne fonction fonctionnelle avec l'ancien JSON
	static isRelationTrue (words, obj)
	{
		let rel;
			for (rel in obj)
			{
				if (obj[rel]['mot1']==words[0] & obj[rel]['mot2']==words[2])
				{
					let res = {};
					res.code = (obj[rel]['poid'] > 0)?1:0;
					res.relation = obj[rel]['lien'];
			//console.log(res[1]);
					return res;
				}
			}
			return -1;

	}

	*/

/* Version 2 de isRelationTrue avec la nouvelle BD JSON
	@return un code indiquant la présence et le poids de la relation dans la BD
	-1 non présente ; 0 présente mais négative ; 1 présente et positive */
	static isRelationTrue (words, obj, mot2)
	{
		const tempid = '4'; // l'idMot=4 correspond au mot "ordinateur"
		let rel; let res = {};
			for (rel in obj)
			{
				if (obj[rel]['idMot']==tempid & obj[rel]['mot']==mot2.word)
				{

					res.code = (obj[rel]['poid'] > 0)?1:0;
					res.relation = obj[rel]['relation'];
					console.log("je renvoie bien");
					return res;
				}
			}
			res.code = -1;
			return res;

	}

	/* @return le second mot à analyser dans la phrase */
	static secondWord(words)
	{
		let w;
		for (w in words)
		{
			if ((words[w].role == "Nom") & (words[w].word != "ordinateur")) // à modifier plus tard
			{
				return words[w];
			}
		}
		return -1;
	}

	/* @return true si la phrase est une question */
	static isQuestion (words)
	{
		return ((words[0].word=="Est-ce" & words[1].word=="que") | (words[words.length-1]=='?'));
	}

	/* @return la chaine words en ayant modifié le rôle des mots "Est-ce que" */
	static modifIfQuestion(words)
	{
		words[0].role = "Question";
		words[1].role = "Question";
		return words;
	}

	/* @return true si le mot en paramètre est un déterminant */
	static isArticle(word)
	{
		var tabArticles = [
			"le","la","l","les",
			"une","un","des",
			"mon","ton","son","notre","votre","leur","ma","ta","sa","mes","tes","ses","nos","vos","leurs",
			"ce","cet","cette","ces",
			"chaque","quelques","plusieurs"
		];

		return (tabArticles.indexOf(word)!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
	}

	/* @return la relation adéquate au verbe donné */
	static laRelation(verbe)
	{
		var tabRelations = [
			{"relation" : "r_carac", "mot" : "est"},
			{"relation" : "r_isa", "mot" : "a"}
		]

		function t(tabRelations){
			return tabRelations.mot === verbe;
		}

		let res = tabRelations.find(t);

		if (res) return res.relation;
		return null;
	}

	/* corrige le ":" */
	static fixRole(role)
	{
		return role.substring(0, role.length - 1); // Enlever le ':' après le role r_pos
	}

	/* @return le rôle du mot donné ("Nom", "Déterminant" ou la relation) */
	static roleWord(word, obj)
	{
		let rel;
		let temp = word.word;

		if (Analyse.isArticle(word.word)) return "Déterminant";
		if (Analyse.laRelation(word.word)) return Analyse.laRelation(word.word);

		for (rel in obj)
		{
			if (word.word == "ordinateur") temp = 4;
			if (temp == obj[rel]['idMot']) //temp à remplacer par le mot quand il y aura une fonction pour rechercher le mot par l'id
			{
				let role = obj[rel]['relation'];
				if (role=='r_pos') return Analyse.fixRole(obj[rel]['mot']);
			} else return "Nom";
		}
	}

	/* @return le tableau de mots en y ajoutant leurs rôles */
	static allRoleWord(words,obj)
	{
		let rel,w;
		for (w in words)
		{
			words[w].role = Analyse.roleWord(words[w],obj);
		}
		return words;
	}

	/* @return le tableau de mots en leur ajoutant un paramètre */
	static giveWord(analyzed)
	{
		let words = {}; let word;
		for (word in analyzed)
		{
			words[word] = {};
			words[word].word = analyzed[word];
		}
		return words;
	}

	/* @return un String contenant le message à afficher dans le cas d'une analyse */
	static printSentenceAnalyzed(words)
	{
		let word;
		let message = "[Composition de la phrase :\n";
		for (word in words)
		{
			message += "{Mot : " + words[word].word + "; Role : " + words[word].role + "}\n";
		}
		message += "]";
		return message;
	}

	/* @return un String contenant le message à afficher selon le cas (question, affirmation) */
	static printSentence(words,question,obj)
	{
		let res = "";
		if (question)
		{
			let first = "ordinateur";
			let second = Analyse.secondWord(words);
			let isRelationTrue = Analyse.isRelationTrue(words,obj,second);
			console.log("deuxièmemot:"+second.word);
			console.log("coderelation:"+isRelationTrue.code);
			switch (isRelationTrue.code) {
				case -1:
					res += "Les mots " + first + " et " + second.word + " n'ont aucun lien. ";
					break;
				case 0:
					res += "Relation " + isRelationTrue.relation + " négative entre les mots " + first + " et " + second.word;
					break;
				case 1:
					res += "Les deux mots " + first + " et " + second.word + " ont bien le lien " + isRelationTrue.relation + ". ";
					console.log(isRelationTrue.relation);
					break;
				default:
					res += "Erreur de sortie isRelationTrue";
			}
		}
		else
		{
			res += Analyse.printSentenceAnalyzed(words);
		}
		return res;
	}

	/* Fonction principal à appeler dans le bot
	@param un String contenant le message de l'utilisateur
	@return un String contenant le message à renvoyer à l'utilisateur */
	static parse (message)
	{

		var fs = require("fs");
		var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
		var contentTraite = content.replace(/'/g,'"');
		const obj = JSON.parse(contentTraite);

		var analyzed = Analyse.words(message);
		var words = Analyse.giveWord(analyzed);
		words = Analyse.allRoleWord(words,obj);

		console.log(words);
		const question = Analyse.isQuestion(words);
		if (question) words = Analyse.modifIfQuestion(words);

		var finalMessage = "";

		finalMessage += Analyse.printSentence(words,question,obj);

		return finalMessage;
	}
};

//console.log("Essai : ", essai.SelectAll('SELECT * FROM animal'));
