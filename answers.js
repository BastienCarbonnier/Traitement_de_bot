/*jshint esversion: 6 */
var http        = require('http'),
    tools       = require('./tools.js'),
    bot         = require('../server.js'),
    windows1252 = require('windows-1252'),
    fs          = require('fs');


function getAdverbeAffAleatoire(){
    var listAdverbeAffirmatif = [
        "toujours","assurément","certainement","probablement","vraisembablement",
        "souvent","presque tout le temps","eventuellement","exclusivement","parfois"
    ];

    var numRandom = Math.floor(Math.random()*listAdverbeAffirmatif.length);

    return listAdverbeAffirmatif[numRandom];
}
function getAdverbeNegAleatoire(){
    var listAdverbeNegatif = [
        "aucunement","jamais","nullement","pas","certainement pas","assurément pas",
        "vraisembablement pas", "probablement pas"
    ];

    var numRandom = Math.floor(Math.random()*listAdverbeNegatif.length);

    return listAdverbeNegatif[numRandom];
}

function getVerbeCaracAleatoire(){
    var listVerbeCarac = [
        "est bien"//,"peut-être"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeCarac.length);

    return listVerbeCarac[numRandom];
}

function getVerbeIsaAleatoire(){
    var listVerbeIsa = [
        "est bien","est"//"peut-avoir","est-constitué"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeIsa.length);

    return listVerbeIsa[numRandom];
}

function getVerbeNegCaracAleatoire(){
    var listVerbeCaracNeg = [
        "n'est"//,"peut-être"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeCaracNeg.length);

    return listVerbeCaracNeg[numRandom];
}

function getVerbeNegIsaAleatoire(){
    var listVerbeIsaNeg = [
        "n'est"//,"peut-avoir","est-constitué"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeIsaNeg.length);

    return listVerbeIsaNeg[numRandom];
}

function getArticleBeforeWord(word,words_tab){
    for (var w in words_tab)
	{
        if (words_tab[w].word === word){
            if (w>0){
                if (words_tab[w-1].role === "article"){
                    return words_tab[w-1].word;
                }
            }
        }
	}
    return -1;

}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.sendBackAnswer = function(first,second,result_isRelationTrue,words_tab)
{
    var res = "";
    var verbe = "";
    var listPhraseErreur = [
        "C'est pas faux !",
        "Faut arrêter ces conneries de nord et de sud ! Une fois pour toutes, le nord, suivant comment on est tourné, ça change tout !",
        "Ah ! oui... j' l'ai fait trop fulgurant, là. Ça va ?",
        "J'voudrais pas faire ma raclette, mais la soirée s'annonce pas super.",
        "Mais cherchez pas à faire des phrases pourries... On en a gros, c'est tout !",
        "Il s'agirait de grandir hein, il s'agirait de grandir...",
        "Habile !",
        "Oui, je connais cette théorie",
        "J'aime le bruit blanc de l'eau.",
        "Je vois pas le rapport avec la Bretagne..."
    ];
    console.log("first word : "+first.word+" second word : "+second.word);
    if (first.word !== "ordinateur" || second.word === -1 || first.word === -1){

        var numRandom = Math.floor(Math.random()*listPhraseErreur.length);
        var reponse = listPhraseErreur[numRandom];
        logMessageSended (true, reponse);
        bot.sendMessage(reponse);
        return;
    }
    var firstArticle = getArticleBeforeWord(first.word,words_tab);
    var secondArticle = getArticleBeforeWord(second.word,words_tab);

    firstArticle = (firstArticle==-1 ? "" : firstArticle);
    secondArticle = (secondArticle==-1 ? "" : secondArticle);
    console.log("relation = "+result_isRelationTrue.relation);
    switch (result_isRelationTrue.code) {
        case -1:


            res += firstArticle + " " +first.word+ " et " +
                   secondArticle+ " " + second.word +
                   " n'ont aucun lien";

        break;

        case 0:

            if (result_isRelationTrue.relation === "r_carac"){
                verbe = getVerbeNegCaracAleatoire();
            }
            else if (result_isRelationTrue.relation === "r_isa"){
                verbe = getVerbeNegIsaAleatoire();
            }
            else {
                return "La réponse pour cette relation n'a pas été implémenté.";
            }

            res += firstArticle + " " +first.word+ " " +
                   verbe + " " + getAdverbeNegAleatoire()+ " " +
                   secondArticle + " " + second.word ;
        break;
        case 1:

            if (result_isRelationTrue.relation === "r_carac"){
                verbe = getVerbeCaracAleatoire();
            }
            else if (result_isRelationTrue.relation === "r_isa"){
                verbe = getVerbeIsaAleatoire();
            }
            else {
                return "La réponse pour cette relation n'a pas été implémenté.";
            }

            res += firstArticle + " " +first.word+ " " +
                   verbe + " " + getAdverbeAffAleatoire()+ " " +
                   secondArticle + " " + second.word ;

        break;
        default:
        res += "Erreur de sortie isRelationTrue";


    }
    var message = capitalizeFirstLetter(res) + ".";
    logMessageSended (false, message);
    bot.sendMessage(message);


    //+ "  article : "+ getArticleBeforeWord(second.word,words_tab);
};

function logMessageSended (err, message){
    var date = new Date();
    var month = date.getMonth()+1;
    var date_string = date.getDate() + ":"+ month+":"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" ";
    var log = "\n" + date_string + "; BOT ;" + message;

    var logger = fs.createWriteStream("./logs.txt", {
        flags: 'a' // 'a' means appending (old data will be preserved)
    });
    if (err){
        log += "   -----FAIL-----";
    }

    logger.write(log);
    logger.end();
}
function getArticleBeforeFirstWord(id_word,words_tab){
    if (id_word>0){
        return words_tab[id_word-1];
    }
    else{
        return -1;
    }
}

function getArticleBeforeSecondWord(id_word,index_verbe,words_tab){
    /*
    console.log("\n Dans getArticleBeforeSecondWord() : \n");
    console.log("\n Id sw = "+id_word);
    console.log("\n index_verbe : "+index_verbe);
    console.log("\n");
    */
    if (id_word>0 && id_word>index_verbe+1){
        return words_tab[id_word-1];
    }
    else{
        return -1;
    }
}
exports.sendBackAnswerBis = function(fw,sw,fw_id,sw_id,index_verbe,rel,result,words_tab)
{

    var relations = {
        "r_isa" : 6,
        "r_has_part" : 9,
        "r_carac" : 17
    };
    var res = "";
    var verbe = "";
    var listPhraseErreur = [
        "C'est pas faux !",
        "Faut arrêter ces conneries de nord et de sud ! Une fois pour toutes, le nord, suivant comment on est tourné, ça change tout !",
        "Ah ! oui... j' l'ai fait trop fulgurant, là. Ça va ?",
        "J'voudrais pas faire ma raclette, mais la soirée s'annonce pas super.",
        "Mais cherchez pas à faire des phrases pourries... On en a gros, c'est tout !",
        "Il s'agirait de grandir hein, il s'agirait de grandir...",
        "Habile !",
        "Oui, je connais cette théorie",
        "J'aime le bruit blanc de l'eau.",
        "Je vois pas le rapport avec la Bretagne..."
    ];

    var listDebPhraseAff = [
        "En effet",
    ];
    console.log("\nDans la méthode sendBackAnswerBis() : \n");
    console.log("first word : "+fw+" second word : "+sw+"\n");
    if (fw === -1 || sw === -1){

        var numRandom = Math.floor(Math.random()*listPhraseErreur.length);
        var reponse = listPhraseErreur[numRandom];
        logMessageSended(true, reponse);
        bot.sendMessage(reponse);
        return;
    }
    var fa = getArticleBeforeFirstWord(fw_id,words_tab); // first article
    var sa = getArticleBeforeSecondWord(sw_id,index_verbe,words_tab); // second article

    fa = (fa==-1 ? "" : fa);
    sa = (sa==-1 ? "" : sa);
    console.log("\nresult = ");
    console.log(result);
    var code = -1;
    if (result.res === "oui"){
        code = 1;
    }
    else if (result.res === "non"){
        code = 0;
    }
    switch (code) {
        case -1: //ne sait pas
            res += "Je ne sais pas";
        break;

        case 0:

            if (rel === "r_carac"){
                verbe = getVerbeNegCaracAleatoire();
            }
            else if (rel === "r_isa"){
                verbe = getVerbeNegIsaAleatoire();
            }
            else if (rel === "r_has_part") {
                verbe = "n'a pas";
            }
            else {
                return "La réponse pour cette relation n'a pas été implémenté.";
            }
            /*
            res += fa + " " +fw+ " " +
                   verbe + " " + getAdverbeNegAleatoire()+ " " +
                   sa + " " + sw ;
            */
            res += fa + " " +fw+ " " +
                   verbe + " " +
                   sa + " " + sw ;
        break;
        case 1:

            if (rel === "r_carac"){
                verbe = getVerbeCaracAleatoire();
            }
            else if (rel === "r_isa"){
                verbe = getVerbeIsaAleatoire();
            }
            else if (rel === "r_has_part") {
                verbe = "a";
            }
            else {
                res += "La réponse pour cette relation n'a pas été implémenté.";
            }
            /*
            res += fa + " " +fw+ " " +
                   verbe + " " + getAdverbeAffAleatoire()+ " " +
                   sa + " " + sw ;
            */
            res += fa + " " +fw+ " " +
                   verbe + " "+
                   sa + " " + sw ;
        break;
        default:
        res += "Erreur de sortie isRelationTrue";


    }
    var message = capitalizeFirstLetter(res) + ".";
    logMessageSended (false, message);
    bot.sendMessage(message);

};

exports.sendBackAnswerAffirmation = function (fw,sw,fw_id,sw_id,index_verbe,rel,result,words_tab){
    var mes = "Très bien j'enregistre les informations suivantes :";
    bot.sendMessage(mes);
    mes = "Premier mot : "+ fw + "  Deuxième mot : "+sw+"\n";
    bot.sendMessage(mes);
    mes = "Relation : "+rel+"\n";
    bot.sendMessage(mes);

    var log = fw+"  "+rel+"  "+sw;
    logMessageSended (false, log);
};
exports.sendBackAnswerError = function(error_message){
    bot.sendMessage(error_message);
};
