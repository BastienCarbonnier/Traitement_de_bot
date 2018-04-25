/*jshint esversion: 6 */

var rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    fs 			= require("fs");

exports.isArticle = function(word){
    var tabArticles = [
        "le","la","l","les", //article definis
        "une","un","uns","unes","des","d", // article indefini
        "du","de la","de l",// article partatifs
        "au","aux" // article def contracté
    ];

    return (tabArticles.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
};

exports.isQuestion = function(words,callback){
    if (words.indexOf("?") != -1 ){
        words.splice(words.length-1);
    }
    if(words[0]==="Est-ce"){
        if (words[2]==="que"){
            words.splice(0,2);
        }
        else{
            var w1_tab = words[1].split(/\'/);
            console.log(w1_tab);
            if (w1_tab.length>1){
                words.splice(0,1);
                words[0] = w1_tab[1];
            }
            else{
                words.splice(0,2);
            }
        }
        console.log(words);
        callback(true,words);
        return;
    }
    else if(words[0]==="Est"&&words[1]==="ce"){
        if (words[2]==="que"){
            words.splice(0,3);
        }
        else{
            var w2_tab = words[2].split(/\'/);

            if (w2_tab.length>1&&isArticle(w2_tab[1])){
                words.splice(0,2);
                words[0] = w2_tab[1];
            }
            else{
                words.splice(0,3);
            }
        }

        callback(true,words);
        return;
    }
    else{
        for (var i in words){
            if (isVerbeIsa(words[i])||isVerbeCarac(words[i])||isVerbeHasPart(words[i])||isVerbeAgent_1(words[i])){
                callback(true,words);
                return;
            }

        }
    }
    callback(false,words);
};
function isVerbeIsa(word){
    var tabVerbeIsa = [
        "est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeCarac (word){
    var tabVerbeCarac = [
        "est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeHasPart(word){
    var tabVerbeHasPart = [
        "a-t-il","a-t-elle","possède-t-il","possède-t-elle"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeAgent_1(word){
	var tabVerbeAgent_1 = [
        "peut-il","peut-elle","peuvent-ils","peuvent-elles"
    ];
    return (tabVerbeAgent_1.indexOf(word.toLowerCase())!=-1);
}

exports.isArticleContractable =function (art){
    var listArticleContr = [
        "une","un","uns","unes","au","aux"
    ];

    var numRandom = Math.floor(Math.random()*listArticleContr.length);

    return listArticleContr[numRandom];
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
			words_tab.splice(i,k-2);
			words_tab[i]=mot;
			index_verbe = index_verbe - k+2;
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
        "r_carac" : 17,
        "r_agent_1" : 24
    };
    console.log("relation : "+rel);
    var rel_id = relations[rel];
    //// TODO: Done !!
    //// Recupérer les données de la page rezo_dump pour rel_id et first_word
    //// Récupérer l'id du first word : e;eid;'vache';1;w
    //// Voir si une relation existe : e;id_sw;secondWord;1;w
    //// Checker la relation : r;r_id;db_fw_id;db_sw_id;rel_id;w
    //// Check le poids et appeler callback

    makeGetRequestRezoDump(fw,rel_id,null,function(err, result){
        if (err) callback(-1);
        else{
            getFirstWordID(result,fw,function(db_fw_id){
                getSecondWordID(result,sw,function(db_sw_id){
                    if (db_sw_id == -1){
                        console.log("Pas de relations entrantes");
                        console.log("Lancement Inferences Live : ");
                        makeLiveInference(fw,sw,db_fw_id,db_sw_id,rel_id,function(err,id_n3,w_rel){
                            if (w_rel != null){
                                console.log("\nPoids relation : "+w_rel);
                                if (w_rel>0){
                                    callback(1,true,id_n3);
                                }
                                else{
                                    callback(0,true,id_n3);
                                }
                            }
                            else {
                                console.log("Poids inconnu !");
                                callback(-1);
                            }
                        });
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
        }

    });
};

exports.wordIsInDatabase = function(word,callback){

    makeGetRequestRezoDump(word,1,function(err, result){
        if (!err){
            var regex = new RegExp("e;\\d*;"+word+";1;\\d*","g");
            var res = data.match(regex);
            if (res == null){
                callback(false);
            }
            else{
                callback(true);
            }
        }
        else {
            callback(false);
        }

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

function getRelationsSortantes(fw,rel_id,callback){

    makeGetRequestRezoDump(fw,rel_id,"&relin=norelin",function(err, result){
        if (!err){

            var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var rs = result.match(regex_rs);
            //console.log(rs);
            var n3_tab = [];
            var w_tab = [];
            if (rs != null){
                for (var i in rs){
                    var tab_rs = rs[i].split(";");
                    if (Number(tab_rs[5])>0){
                        n3_tab[n3_tab.length] = Number(tab_rs[3]);
                        w_tab[w_tab.length] = Number(tab_rs[5]);
                    }
                }
                callback(null,n3_tab,w_tab);
            }
            else{
                callback(-1);
            }

        }
        else {
            callback(-1);
        }

    });
}
function getRelationsEntrantes(sw,rel_id,callback){

    makeGetRequestRezoDump(sw,rel_id,"&relout=norelout",function(err, result){
        if (!err){

            var regex_re = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var re = result.match(regex_re);
            //console.log(re);
            var n3_tab = [];
            var w_tab = [];
            if (re != null){
                for (var i in re){
                    var tab_re = re[i].split(";");
                    n3_tab[n3_tab.length] = Number(tab_re[2]);
                    w_tab[w_tab.length] = Number(tab_re[5]);
                }
                callback(null,n3_tab,w_tab);
            }
            else{
                callback(-1);
            }

        }
        else {
            callback(-1);
        }

    });
}
function makeLiveInference (fw,sw,db_fw_id,db_sw_id,rel_id,callback){

    getRelationsSortantes(fw,6,function(err,rs,w_tab_rs){

        console.log("Je suis dans makeLiveInference() : ");
        console.log(rs);
        getRelationsEntrantes(sw,rel_id,function(err,re,w_tab_re){
            findInference(rs,re,w_tab_rs,w_tab_re,function(id_n3,poids){
                console.log("rs = re =  "+ id_n3);
                console.log("Poids relation = "+poids);
                callback(null,id_n3,poids);
            });


        });


    });



}
function findInference (rs,re,w_tab_rs,w_tab_re,callback){
    var max_index_rs=-1;
    var max_poids_rs =-1;
    var i;
    for(i in rs){
        var index = re.indexOf(rs[i]);
        if (index != -1){
            if(w_tab_rs[i]>max_poids_rs){
                max_poids_rs = w_tab_rs[i];
                max_index_rs = rs[i];
            }

        }
    }
    if(i==rs.length-1){
        callback(max_index_rs,max_poids_rs);
    }

}

function makeGetRequestRezoDump(word,rel_id,param,callback){
    var url = windows1252.encode("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel="+word+"&rel="+rel_id+(param==null?"":param));
    console.log(url);
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
        callback(null,result);


    })
    .catch((err) => {
        console.log(err);
        callback(err);
    });
}

// TODO: Inférences live :
/*N1 t N2

Vérification si la relation est déjà présente ainsi
Si oui OK

Si non :
   - récupération des relations sortantes de n1 avec relation 6 (r_isa)
   - récupération des relations entrantes de n2 avec relation t

   - Recherche si il existe un n3 tel que [ n1 6 n3 ] ET [ n3 t n2 ]

*/
