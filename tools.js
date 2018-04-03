/*jshint esversion: 6 */

var rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    fs 			= require("fs");

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

exports.checkComposedWord = function(words_tab,index_verbe,hashmap_mc,callback){

	for (var i=0;i<index_verbe;i++){
		let mot = "";
		i = Number(i);

		let k = 0;
		for (k=i;k<index_verbe;k++){
			mot += words_tab[k]+" ";
		}
		mot = mot.substring(0,mot.length-1);

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

		if(hashmap_mc.get(mot)!== undefined){
			words_tab.splice(j,k-1);
			words_tab[j]=mot;
		}

	}
	callback(words_tab,index_verbe);
};
exports.checkRelationFromRezoAsk = function(fw,sw,rel,callback){

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

/**
 * Make an http request to RezoDump and process the result
 * @param  {String}   fw       First Word
 * @param  {String}   sw       Second Word
 * @param  {String}   rel      Relation
 * @param  {Function} callback 
 */
exports.checkRelationFromRezoDump = function(fw,sw,rel,callback){
    var relations = {
        "r_isa" : 6,
        "r_has_part" : 9,
        "r_carac" : 17
    };

    var rel_id = relations[rel];
    //// TODO: Done !!
    //// Recupérer les données de la page rezo_dump pour rel_id et first_word
    //// Récupérer l'id du first word : e;eid;'vache';1;w
    //// Voir si une relation existe : e;id_sw;secondWord;1;w
    //// Checker la relation : r;r_id;db_fw_id;db_sw_id;rel_id;w
    //// Check le poids et appeler callback

    var url = windows1252.encode("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel="+fw+"&rel="+rel_id);
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

        getFirstWordID(result,fw,function(db_fw_id){
            getSecondWordID(result,sw,function(db_sw_id){
                if (db_sw_id == -1){
                    console.log("Pas de relations entrantes");
                    callback(-1);
                }
                else{
                    getRelationPoids(result,fw,sw,db_fw_id,db_sw_id,rel_id,function(rel_poids){

                        if (rel_poids != null){
                            console.log("\nPoids relation : "+rel_poids);
                            if (rel_poids>0){
                                callback(1);
                            }
                            else{
                                callback(0);
                            }
                        }
                        else {
                            console.log("Poids inconnu !");
                            callback(-1);
                        }
                    });

                }
            });
        });


    })
    .catch((err) => {
        console.log(err);
        callback(err);
    });
};

function getRelationPoids(data,fw,sw,fw_id,sw_id,rel_id,callback){
    var regex = new RegExp("r;\\d*;"+fw_id+";"+sw_id+";"+rel_id+";(-|)\\d*","g");
    var res = data.match(regex);

    if (res != null){
        var tab_res = res[0].split(";");
        callback(tab_res[5]);
    }
    else{
        callback(null);
    }

}
function getFirstWordID (data,fw,callback){
    var regex = new RegExp("e;\\d*;'"+fw+"';\\d*;\\d*","g");
    var res = data.match(regex);
    if (res != null){
        var tab_res = res[0].split(";");
        callback(tab_res[1]);
    }
    else{
        callback(-1);
    }

}

function getSecondWordID (data,sw,callback){
    var regex = new RegExp("e;\\d*;'"+sw+"';\\d*;\\d*","g");
    var res = data.match(regex);
    if (res != null){
        var tab_res = res[0].split(";");
        callback(tab_res[1]);
    }
    else{
        callback(-1);
    }
}
