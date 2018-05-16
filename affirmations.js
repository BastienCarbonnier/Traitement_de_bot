/*jshint esversion: 6 */

var tools = require('./tools.js'),
    answers = require('./answers.js'),
    fs    = require("fs"),
    request    = require('./../request.js');



function process(words,pseudo,hashmap_mc)
{
    var relations = {
        "r_isa" : 6,
        "r_has_part" : 9,
        "r_carac" : 17,
        "r_agent_1" : 24
    };

	if (words[words.length-1]=== ".")
		words.splice(words.length-1);

	findRelation(words,function (index_verbe,words,offset_fw,offset_sw,rel,rel_neg){
		if (index_verbe == -1){
			console.log("Erreur verbe non trouvé !!!");

			console.log("relation verbe : "+rel+" \n");
			console.log(words);
			answers.sendBackAnswerError(pseudo,"Je n'ai pas réussi à détecter le verbe présent dans la phrase...");
		}
		else{
            var is_r_isa = (rel=="r_isa");
			tools.checkComposedWord (words,index_verbe,hashmap_mc,is_r_isa,function(words_tab,new_index_verbe){
				var fw_id = new_index_verbe+offset_fw;
				var sw_id = new_index_verbe+offset_sw;

                console.log("fw_id = "+fw_id);
                console.log("sw_id = "+sw_id);
                console.log(words_tab);
				var fw = words_tab[fw_id];
				var sw = words_tab[sw_id];
                var poids;
                if (rel_neg){
                    neg = 1;
                }
                else{
                    neg = 0;
                }
                var code = 0;




                var listSujet=[
					"il","ils","elle","elles"
				];
				if (listSujet.indexOf(fw.toLowerCase())!=-1){
					request.getUserLastFaFw(pseudo,function(err,fa,fw){
						if (!err){
							if(fw != null){
								fw = fw;

                                request.insertRelation(fa,fw,sw,relations[rel],pseudo,10,neg,function(){
                                    answers.sendBackAnswerAffirmation(pseudo,fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab,rel_neg,fa);
                                });
							}
							else{
								answers.sendBackAnswerError(pseudo,"Je ne sais pas à quel mot fait référence le sujet donné.");
							}
						}
					});
				}
				else{
                    var fa = getArticleBeforeFirstWord(fw_id,words_tab);
                    request.insertRelation(fa,fw,sw,relations[rel],pseudo,10,neg,function(){
                        answers.sendBackAnswerAffirmation(pseudo,fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab,rel_neg,fa);
                    });
				}
			});
		}
	});
}

function getArticleBeforeFirstWord(id_word,words_tab){
    if (id_word>0){
        if (tools.isArticle(words_tab[id_word-1]))
            return words_tab[id_word-1];
        else
            return null;
    }
    else{
        return null;
    }
}

function findRelation(words,callback){

	var rel = "";
	var index_verbe = -1;
	var offset_fw = -1;
	var offset_sw = 1;
	console.log("*** Dans findRelation() : \n");

    var rel_neg = false;

	for (var i in words){
		i = Number(i);
		var w = words[i];



        if (i>0 && i+2 < words.length && isVerbeIsaAff(w) && words[i-1]=="ne" && (tools.isArticle(words[i+1])||tools.isArticle(words[i+2]))){
            let temp = words[i-1];
            words.splice(i-1,1);
            i--;
            words[i] = temp+" "+words[i];


            if(tools.isArticle(words[i+2]) && words[i+1]=="pas"){
                let temp = words[i+1];
                words.splice(i+1,1);
                words[i] = w+" "+temp;
            }

            index_verbe = i;
			offset_fw += 0;
			offset_sw += 1;
			rel = "r_isa";
            rel_neg = true;
			break;
		}
        else if (i+2 < words.length && isVerbeIsaNeg(w) && words[i+1]=="pas"&& tools.isArticle(words[i+2])){
            let temp = words[i+1];
            words.splice(i+1,1);
            words[i] = words[i]+" "+temp;
            index_verbe = i;
			offset_fw += 0;
			offset_sw += 1;
			rel = "r_isa";
            rel_neg = true;
			break;
		}
        else if (i+1 < words.length && isVerbeIsaAff(w) && tools.isArticle(words[i+1])){
			index_verbe = i;
			offset_fw += 0;
			offset_sw += 1;
			rel = "r_isa";
			break;
		}
        else if (i>0&& isVerbeCaracAff(w) && words[i-1]=="ne" ){
            let temp = words[i-1];
            words.splice(i-1,1);
            i--;
            words[i] = temp+" "+words[i];
            index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_carac";
            rel_neg = true;
			break;
		}
        else if (i+1 < words.length && isVerbeCaracNeg(w) && words[i+1]=="pas"){
            let temp = words[i+1];
            words.splice(i+1,1);
            words[i] = words[i]+" "+temp;
            index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_carac";
            rel_neg = true;
			break;
		}
		else if (isVerbeCaracAff(w)){

			index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_carac";
			break;
		}
        else if (i>0 && isVerbeHasPartAff(w) && words[i-1]=="ne"){
            let temp = words[i-1];
            words.splice(i-1,1);
            i--;
            words[i] = temp+" "+words[i];

            index_verbe = i;
            if (tools.isArticle(words[i+1])){
                offset_sw += 1;
            }
			offset_fw += 0;

			rel = "r_has_part";
            rel_neg = true;
			break;
		}
        else if (i+1 < words.length && isVerbeHasPartNeg(w) && words[i+1]=="pas"){
            let temp = words[i+1];
            words.splice(i+1,1);
            words[i] = words[i]+" "+temp;

            console.log(words);
            console.log("i = "+i);
            if (tools.isArticle(words[i+1])){
                offset_sw += 1;
            }
            index_verbe = i;
			offset_fw += 0;
			offset_sw += 0;
			rel = "r_has_part";
            rel_neg = true;
			break;
		}
		else if (isVerbeHasPartAff(w)){
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
		else if (isVerbeAgent_1Aff(w)){
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

    console.log("index verbe = "+index_verbe);
    console.log("fw_offset = "+offset_fw);
    console.log("sw_offset = "+offset_sw);

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
				callback(index_verbe,words,offset_fw,offset_sw,rel,rel_neg);
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

function isVerbeIsaAff(word){
    var tabVerbeIsa = [
        "est","peut-être","peut-etre"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeIsaNeg(word){
    var tabVerbeIsa = [
        "n'est","peut-être","peut-etre"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeCaracAff(word){
    var tabVerbeCarac = [
        "est","peut-être","peut-etre"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}
function isVerbeCaracNeg(word){
    var tabVerbeCarac = [
        "n'est"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeHasPartAff(word){
    var tabVerbeHasPart = [
        "a","possède","peut-avoir"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeHasPartNeg(word){
    var tabVerbeHasPart = [
        "n'a","possède","peut-avoir"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}
function isVerbeAgent_1Aff(word){
	var tabVerbeAgent_1 = [
        "peut"
    ];
    return (tabVerbeAgent_1.indexOf(word.toLowerCase())!=-1);
}
function isVerbeAgent_1Neg(word){
	var tabVerbeAgent_1 = [
        "peut"
    ];
    return (tabVerbeAgent_1.indexOf(word.toLowerCase())!=-1);
}

module.exports.process = process;
