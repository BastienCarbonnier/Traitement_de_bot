/*jshint esversion: 6 */

var answers = require('./answers.js'),
	tools 	= require('./tools.js'),
	fs 			= require("fs"),
	request    = require('./../request.js');

/**
 * Split the message into a table
 * @param  {string} message
 * @return {string:table}
 */



/**
 * Process the message by doing the following task :
 * - Parse the message
 * - Find relation
 * - Check for composed words
 * - Check relation from RezoDump
 * - Send back the answer to the user
 * @param  {string} message    Message sent by the user
 * @param  {Map} 	hashmap_mc hashmap containing a lot of potential compound words
 */
exports.process = function(words,username,hashmap_mc)
{

	var rel = "";

	findRelation(words,function (index_verbe,words,offset_fw,offset_sw,rel){
		if (index_verbe == -1){
			console.log("Erreur verbe non trouvé !!!");
			console.log(words);
			console.log(rel);
			console.log(index_verbe);
			answers.sendBackAnswerError("Je n'ai pas réussi à détecter le verbe présent dans la phrase...");
		}
		else{
			tools.checkComposedWord (words,index_verbe,hashmap_mc,function(words_tab,new_index_verbe){

				var fw_id = new_index_verbe+offset_fw;
				var sw_id = new_index_verbe+offset_sw;
				var fw = words_tab[fw_id];
				var sw = words_tab[sw_id];

				console.log("index_verbe : "+index_verbe);
				console.log("new_index : "+new_index_verbe);
				console.log("First word : "+fw);
				console.log("Second word : "+sw);
				console.log(words_tab);

				var relations = {
					"r_isa" : 6,
					"r_has_part" : 9,
					"r_carac" : 17,
					"r_agent_1" : 24
				};

				tools.checkRelationFromRezoDump(fw,sw,rel,function(code){
					answers.sendBackAnswer(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
				});

				/*
				request.isRelationInBDD(fw,sw,relations(rel),function(err,res){
					if (err){
						tools.checkRelationFromRezoDump(fw,sw,rel,function(code){
							answers.sendBackAnswer(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
						});
					}
					else{
						if(res){
							answers.sendBackAnswer(fw,sw,fw_id,sw_id,index_verbe,rel,1,words_tab);
						}
						else{
							tools.checkRelationFromRezoDump(fw,sw,rel,function(code){
								answers.sendBackAnswer(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab);
							});
						}
					}
				});
				*/



			});
		}
	});
};
/**
 * Find relation by checking the verb in the words table
 * @param  {string:table}   words
 * @param  {Function} callback Callback of the function
 */
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
		callback(-1,words,rel);
	}
}
function getYword (index,words){
	var y = "";
	for (var i = index;i<words.length-1;i++){
		y+=words[i]+" ";
	}
	y+= words[words.length-1];
	return y;
}
function isVerbe(word){
	return true;
}
function isVerbeIsa(word){
    var tabVerbeIsa = [
        "est","sont","est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeCarac (word){
    var tabVerbeCarac = [
        "est","sont","est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeHasPart(word){
    var tabVerbeHasPart = [
        "a","a-t-il","a-t-elle","possède-t-il","possède-t-elle"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeAgent_1(word){
	var tabVerbeAgent_1 = [
        "peut","peut-il","peut-elle","peuvent-ils","peuvent-elles"
    ];
    return (tabVerbeAgent_1.indexOf(word.toLowerCase())!=-1);
}
