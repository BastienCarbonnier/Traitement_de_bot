/*jshint esversion: 6 */

var tools = require('./tools.js'),
    answers = require('./answers.js'),
    fs    = require("fs"),
    request    = require('./../request.js');



function process(words,username,hashmap_mc)
{
    var relations = {
        "r_isa" : 6,
        "r_has_part" : 9,
        "r_carac" : 17,
        "r_agent_1" : 24
    };

	if (words[words.length-1]=== ".")
		words.splice(words.length-1);

	findRelation(words,function (index_verbe,words,offset_fw,offset_sw,rel){
		if (index_verbe == -1){
			console.log("Erreur verbe non trouvé !!!");

			console.log("relation verbe : "+rel+" \n");
			console.log(words);
			answers.sendBackAnswerError(pseudo,"Je n'ai pas réussi à détecter le verbe présent dans la phrase...");
		}
		else{
			tools.checkComposedWord (words,index_verbe,hashmap_mc,function(words_tab,new_index_verbe){
				var fw_id = new_index_verbe+offset_fw;
				var sw_id = new_index_verbe+offset_sw;
				var fw = words_tab[fw_id];
				var sw = words_tab[sw_id];
                var code = 0;



                request.insertRelation(fw,sw,relations[rel],username,function(){
                    answers.sendBackAnswerAffirmation(pseudo,fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
                });


                /*
                tools.checkRelationFromRezoDump(fw,sw,rel,function(code){
					answers.sendBackAnswerAffirmation(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
				});*/
			});
		}
	});
}

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
		else if (isVerbeAgent_1(w)){
            var secondPart = getYword(i+1,words);
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
            else if (isVerbe(secondPart)){
				var secondPartLength = words.length-i;
				words.splice(i+1,secondPartLength);
				words[i+1] = secondPart;
				index_verbe = i;
				rel = "r_agent_1";
				console.log(words);
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
function isVerbe(word){
	return true;
}

function getYword (index,words){
	var y = "";
	for (var i = index;i<words.length-1;i++){
		y+=words[i]+" ";
	}
	y+= words[words.length-1];
	return y;
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
function isVerbeAgent_1(word){
	var tabVerbeAgent_1 = [
        "peut"
    ];
    return (tabVerbeAgent_1.indexOf(word.toLowerCase())!=-1);
}

module.exports.process = process;
