/*jshint esversion: 6 */

var rp = require('request-promise');
var cheerio = require('cheerio');
var windows1252 = require('windows-1252');
var iconv = require('iconv-lite');

function Node (id,word,r_id,poids) {
  this.id = id;
  this.word = word;
  this.r_id = r_id;
  this.poids = poids;
}

exports.isQuestion = function(message)
{
    return message.indexOf("?") != -1;
};
exports.isArticle = function(word)
{
	var tabArticles = [
		"le","la","l","les", //article definis
		"une","un","uns","unes","des","d", // article indefini
        "du","de la","de l",// article partatifs
        "au","aux" // article def contracté
	];

	return (tabArticles.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
};
exports.isAdjectif = function(word){
    var tabAdjectifs = [
        "ce","cet","cette","ces", //adjectifs demonst
		"mon","ton","son","notre","votre","leur","ma","ta","sa","mes","tes","ses","nos","vos","leurs", // adj possessifs
        "aucun", "aucune" , "aucuns", "aucunes",// Adj indéfinis
        "maint", "mainte" , "maints", "maintes",
        "quel que", "quelle que" , "quels que", "quelles que",
        "tel", "telle" , "tels", "telles",
        "tout", "toute" , "tous", "toutes",
        "chaque", "plusieurs", "divers",
        "autre", "autres" , "même", "mêmes" , "quelque", "quelques",
        "quelconque", "quelconques",
        "certain", "certaine" , "certains", "certaines",
        "divers", "diverse" , "divers", "diverses",
        "différent", "différente" , "différents", "différentes",
        "nul", "nulle" , "nuls", "nulles"
    ];
    return (tabAdjectifs.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
};

exports.isVerbeIsa = function (word){
    var tabVerbeIsa = [
        "est","est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
};

exports.isVerbeCarac = function (word){
    var tabVerbeCarac = [
        "est","est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
};

exports.isRelationTrueBis= function(mot1, mot2, callback)
{
	var fs = require("fs");
    var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
    var contentTraite = content.replace(/'/g,'"');
    var obj2 = JSON.parse(contentTraite);


	const tempid = '4'; // l'idMot=4 correspond au mot "ordinateur"
	var rel; var res = {};
	for (rel in obj2)
	{
		if (obj2[rel].idMot == tempid && obj2[rel].mot == mot2)
		{
			res.code = (obj2[rel].poid > 0)?1:0;
			res.relation = obj2[rel].relation;
			callback(null,res);
		}
	}
	console.log(res);
	callback(-1);

};

exports.isVerbeHasPart = function (word){
    var tabVerbeHasPart = [
        "a","a-t-il","a-t-elle","possède"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
};

exports.getDataFromRezoDump = function(word,rel_id,callback){

    var url = windows1252.encode("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel="+word+"&rel="+rel_id);
    const options = {
        uri: url,
        encoding: 'binary',
        transform: function (body) {
            return cheerio.load(body, {decodeEntities: false});
        }
    };

    rp(options)
    .then(($) => {

        var result = $('code').text();

        formatResultRequest(result, function (data){
            var max_poids = 0;
            var max_word = "";
            for (var i in data){
                if (data[i].r_id == 4 && data[i].poids >= max_poids){
                    max_poids = data[i].poids;
                    max_word = data[i].word;
                }
            }
            //console.log(data);
            console.log(formatWordFromRequest(max_word));
            callback(null,formatWordFromRequest(max_word));
        });




    })
    .catch((err) => {
        console.log(err);
        callback(err);
    });
};

function formatWordFromRequest(word){
    return word.substring(1,word.length - 2);
}

function formatResultRequest(data,callback){
    // regex (e;\d.*)
    var res =data.match(/(e;\d.*)/g);

    var tab_Node = [];

    for (var i in res){
        var split_node = res[i].split(";");
        tab_Node[i] = new Node(split_node[1],split_node[2],split_node[3],split_node[4]);
    }
    callback(tab_Node);
}
