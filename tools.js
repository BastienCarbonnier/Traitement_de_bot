/*jshint esversion: 6 */

var rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    fs 			= require("fs");

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

exports.initialization = function(callback){
    var mc = fs.readFileSync("./Traitement_de_bot/mots_composes.txt","binary");
    var mc_tab = mc.split("\n");
    var hashmap_mc = new Map();

    for (var i in mc_tab){
        var t = mc_tab[i].split(";");
        hashmap_mc.set(t[1],t[0]);
    }

    callback(hashmap_mc);

};
/*
exports.isRelationTrueBis= function(fw, sw,rel,heber_ordi, callback){
	const tempid = '4'; // l'idMot=4 correspond au mot "ordinateur"
	var i; var res = -1;
	for (i in heber_ordi)
	{
		if (heber_ordi[i].idMot == tempid && heber_ordi[i].mot == sw)
		{
            var relation = heber_ordi[i].relation;
            if (relation == rel){
                res= (heber_ordi[i].poid > 0)?1:0;
    			      callback(res);
                return;
            }
		}
	}
	callback(res);

};
*/

exports.checkComposedWord = function(words_tab,index_verbe,hashmap_mc,callback){
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
};
exports.checkRelationFromRezoAsk = function(fw,sw,rel,callback){
  //var url = windows1252.encode("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel="+fw+"&rel="+rel_id);
  var url = windows1252.encode("http://www.jeuxdemots.org/rezo-ask.php?doinfer=NO&gotermsubmit=Demander&term1="+fw+"&rel="+rel+"&term2="+sw);

  const options = {
      uri: url,
      encoding: 'binary',
      transform: function (body) {
          return cheerio.load(body, {decodeEntities: false});
      }
  };

  rp(options)
  .then(($) => {

      var result = {
          res : $('r').text(),
          poid : $('w').text(),
          annot : $('anot').text().replace(/\s|;/g,''),
      };
      callback(result);
  })
  .catch((err) => {
      console.log(err);
      callback(err);
  });
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
