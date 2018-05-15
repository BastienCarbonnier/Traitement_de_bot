/*jshint esversion: 6 */

var answers = require('./answers.js'),
tools 	= require('./tools.js'),
fs 			= require("fs"),
request    = require('./../request.js'),
rezo_request= require("./rezo_request.js");

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
function process(words,pseudo,hashmap_mc)
{

	var rel = "";

	findRelation(words,function (index_verbe,words,offset_fw,offset_sw,rel){
		if (index_verbe == -1){
			console.log("Erreur verbe non trouvé !!!");
			console.log(words);
			console.log(rel);
			console.log(index_verbe);
			answers.sendBackAnswerError(pseudo,"Je n'ai pas réussi à détecter le verbe présent dans la phrase...");
		}
		else{
			var is_r_isa = (rel=="r_isa");
			tools.checkComposedWord (words,index_verbe,hashmap_mc,is_r_isa,function(words_tab,new_index_verbe){

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

				rezo_request.checkRelationFromRezoDump(fw,sw,rel,function(code,inference,n3,rs_positive,re_positive){
					answers.sendBackAnswerWithInference(pseudo,fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab,n3,rs_positive,re_positive);
				});

				/*
				request.isRelationInBDD(fw,sw,relations(rel),function(err,res){
					if (err){
						rezo_request.checkRelationFromRezoDump(fw,sw,rel,function(code,inference,id_n3){
							answers.sendBackAnswerWithInference(pseudo,fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab,id_n3);
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
}
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
	var i;
	for (i in words){
		i = Number(i);
		var w = words[i];

		if (i+1 < words.length && tools.isVerbeIsaQuestion(w) && tools.isArticle(words[i+1])){
			index_verbe = i;
			offset_fw += 0;
			offset_sw += 1;
			rel = "r_isa";
			break;
		}
		else if (tools.isVerbeCaracQuestion(w)){

			index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_carac";
			break;
		}
		else if (tools.isVerbeHasPartQuestion(w)){
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
		else if (tools.isVerbeAgent_1Question(w)){
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
			else{
				index_verbe = i;
				break;
			}

		}
	}

	var secondPart = getYword(i+1,words);
	if (index_verbe!=-1){
		tools.isVerbe(secondPart,function(err,sp_is_verbe){
			if (sp_is_verbe){
				var secondPartLength = words.length-i;
				words.splice(i+1,secondPartLength);
				words[i+1] = secondPart;
				index_verbe = i;
				rel = "r_agent_1";
			}
			if (index_verbe != -1){
				callback(index_verbe,words,offset_fw,offset_sw,rel);
			}
		});
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

module.exports.process = process;
