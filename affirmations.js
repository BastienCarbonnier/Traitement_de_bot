/*jshint esversion: 6 */

var tools = require('./tools.js'),
    answers = require('./answers.js'),
    fs    = require("fs");



exports.process = function(words,hashmap_mc)
{

	var rel = "";

	if (words[words.length-1]=== ".")
		words.splice(words.length-1);

	findRelation(words,function (index_verbe,words,offset_fw,offset_sw,rel){
		if (index_verbe == -1){
			console.log("Erreur verbe non trouvé !!!");

			console.log("relation verbe : "+rel+" \n");
			console.log(words);
			answers.sendBackAnswerError("Je n'ai pas réussi à détecter le verbe présent dans la phrase...");
		}
		else{
			tools.checkComposedWord (words,index_verbe,hashmap_mc,function(words_tab,new_index_verbe){
				var fw_id = new_index_verbe+offset_fw;
				var sw_id = new_index_verbe+offset_sw;
				var fw = words_tab[fw_id];
				var sw = words_tab[sw_id];
                var code = 0;
                answers.sendBackAnswerAffirmation(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
                /*
                tools.checkRelationFromRezoDump(fw,sw,rel,function(code){
					answers.sendBackAnswerAffirmation(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
				});*/
			});
		}
	});
};

function findRelation(words,callback){

	var rel = "";
	var index_verbe = -1;
	var offset_fw = -1;
	var offset_sw = 1;
	console.log("*** Dans findRelation() : \n");
	for (var i in words){
		i = Number(i);
		var w = words[i];


		if (i+1 < words.length && isVerbeIsa(w) && tools.isArticle(words[i+1])){
			index_verbe = i;
			offset_fw += 0;
			offset_sw += 1;
			rel = "r_isa";
			break;
		}
		else if (isVerbeCarac(w)){

			index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_carac";
			break;
		}
		else if (isVerbeHasPart(w)){
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
		else if (w === "peut"){
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
		callback(index_verbe,words,offset_fw,offset_sw,rel);
	}
	else{
		callback(-1);
	}

}

function isVerbeIsa(word){
    var tabVerbeIsa = [
        "est","peut-être","peut-etre"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeCarac (word){
    var tabVerbeCarac = [
        "est","peut-être","peut-etre"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeHasPart(word){
    var tabVerbeHasPart = [
        "a","possède","peut-avoir"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}
