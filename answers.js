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

function getVerbeAffIsaOrCaracAleatoire(){
    var listVerbeAffIsaOrCarac = [
        "est bien","est","peut-être","peut être"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeAffIsaOrCarac.length);

    return listVerbeAffIsaOrCarac[numRandom];
}

function getVerbeNegIsaOrCaracAleatoire(){
    var listVerbeNegIsaOrCarac = [
        "n'est pas","ne peut être","ne peut pas être"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeNegIsaOrCarac.length);

    return listVerbeNegIsaOrCarac[numRandom];
}

function getVerbeAffHasPartAleatoire(){
    var listVerbeAffHasPart = [
        "a","a bien","possède","possède bien","peut avoir"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeAffHasPart.length);

    return listVerbeAffHasPart[numRandom];
}
function getVerbeNegHasPartAleatoire(){
    var listVerbeNegHasPart = [
        "n'a pas","ne possède pas","ne peut avoir"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeNegHasPart.length);

    return listVerbeNegHasPart[numRandom];
}

function getVerbeAffAgent_1Aleatoire(){
    var listVerbeAffAgent_1 = [
        "peut","peut bien","a la possibilité de"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeAffAgent_1.length);

    return listVerbeAffAgent_1[numRandom];
}
function getVerbeNegAgent_1Aleatoire(){
    var listVerbeNegAgent_1 = [
        "ne peut pas","n'a pas la possibilité de"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeNegAgent_1.length);

    return listVerbeNegAgent_1[numRandom];
}

function getAdverbeAffDebutAleatoire(){
    var listAdverbeAffDebut = [
        "En effet, ","Il se trouve que ","Oui, ",""
    ];

    var numRandom = Math.floor(Math.random()*listAdverbeAffDebut.length);

    return listAdverbeAffDebut[numRandom];
}
function getAdverbeAffDebutContractableAleatoire(){
    var listAdverbeAffDebut = [
        "En effet, ","Il se trouve qu'","Oui, ",""
    ];

    var numRandom = Math.floor(Math.random()*listAdverbeAffDebut.length);

    return listAdverbeAffDebut[numRandom];
}

function getAdverbeNegDebutAleatoire(){
    var listAdverbeNegDebut = [
        "En effet, ","Il se trouve que ","Non, ",""
    ];

    var numRandom = Math.floor(Math.random()*listAdverbeNegDebut.length);

    return listAdverbeNegDebut[numRandom];
}
function getAdverbeNegDebutContractableAleatoire(){
    var listAdverbeNegDebut = [
        "En effet, ","Il se trouve qu'","Non, ",""
    ];

    var numRandom = Math.floor(Math.random()*listAdverbeNegDebut.length);

    return listAdverbeNegDebut[numRandom];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerCaseFirstLetter(string){
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function getArticleBeforeFirstWord(id_word,words_tab){
    if (id_word>0){
        if (tools.isArticle(words_tab[id_word-1]))
            return words_tab[id_word-1];
        else
            return -1;
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
        if (tools.isArticle(words_tab[id_word-1]))
            return words_tab[id_word-1];
        else {
            return -1;
        }
    }
    else{
        return -1;
    }
}

function getPhraseErreurComique (){
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
    var numRandom = Math.floor(Math.random()*listPhraseErreur.length);

    return listPhraseErreur[numRandom];
}
function getPhraseErreurInconnu(){
    var listPhraseErreur = [
        "Je ne sais pas",
        "Je n'en ai aucune idée",
        "J'en ai aucune idée",
        "Je ne sais pas du tout",
        "Je ne connais pas la réponse"
    ];
    var numRandom = Math.floor(Math.random()*listPhraseErreur.length);

    return listPhraseErreur[numRandom];
}

exports.sendBackAnswer = function(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab){
    var res = "";
    var verbe = "";

    if (fw === -1 || sw === -1){
        var reponse = getPhraseErreurComique();
        logMessageSended(true, reponse);
        bot.sendMessage(reponse);
        return;
    }
    var fa = getArticleBeforeFirstWord(fw_id,words_tab); // first article
    var sa = getArticleBeforeSecondWord(sw_id,index_verbe,words_tab); // second article

    fa = (fa==-1 ? "" : lowerCaseFirstLetter(fa)+" ");
    sa = (sa==-1 ? "" : " "+lowerCaseFirstLetter(sa));


    switch (code) {
        case -1: //ne sait pas
            res = getPhraseErreurInconnu();
        break;

        case 0:

        if (tools.isArticleContractable(fa)){
            res += getAdverbeNegDebutContractableAleatoire();
        }
        else{
            res += getAdverbeNegDebutAleatoire();
        }
            if (rel === "r_carac"){
                verbe = getVerbeNegIsaOrCaracAleatoire();
            }
            else if (rel === "r_isa"){
                verbe = getVerbeNegIsaOrCaracAleatoire();
            }
            else if (rel === "r_has_part") {
                verbe = getVerbeNegHasPartAleatoire();
            }
            else if (rel === "r_agent_1") {
                verbe = getVerbeNegAgent_1Aleatoire();
            }
            else {
                return "La réponse pour cette relation n'a pas été implémenté.";
            }
            res += fa +fw+ " " +
                   verbe +
                   sa + " " + sw ;
        break;
        case 1:

        if (tools.isArticleContractable(fa)){
            res += getAdverbeAffDebutContractableAleatoire();
        }
        else{
            res += getAdverbeAffDebutAleatoire();
        }

            if (rel === "r_carac"){
                verbe = getVerbeAffIsaOrCaracAleatoire();
            }
            else if (rel === "r_isa"){
                verbe = getVerbeAffIsaOrCaracAleatoire();
            }
            else if (rel === "r_has_part") {
                verbe = getVerbeAffHasPartAleatoire();
            }
            else if (rel === "r_agent_1") {
                verbe = getVerbeAffAgent_1Aleatoire();
            }
            else {
                res += "La réponse pour cette relation n'a pas été implémenté.";
            }
            res += fa +fw+ " " +
                   verbe +
                   sa + " " + sw ;
        break;
        default:
            res = getPhraseErreurInconnu();


    }
    var message = capitalizeFirstLetter(res) + ".";
    logMessageSended (false, message);
    bot.sendMessage(message);

};
exports.sendBackAnswerWithInference = function(fw,sw,fw_id,sw_id,index_verbe,rel,code,words_tab,n3){
    var res = "";
    var verbe = "";

    if (fw === -1 || sw === -1){
        var reponse = getPhraseErreurComique();
        logMessageSended(true, reponse);
        bot.sendMessage(reponse);
        return;
    }
    var fa = getArticleBeforeFirstWord(fw_id,words_tab); // first article
    var sa = getArticleBeforeSecondWord(sw_id,index_verbe,words_tab); // second article

    fa = (fa==-1 ? "" : lowerCaseFirstLetter(fa)+" ");
    sa = (sa==-1 ? "" : " "+lowerCaseFirstLetter(sa));


    if (tools.isArticleContractable(fa)){
        advDebut = getAdverbeAffDebutContractableAleatoire();
        res += getAdverbeAffDebutContractableAleatoire();
    }
    else{
        advDebut = getAdverbeAffDebutContractableAleatoire();
        res += getAdverbeAffDebutAleatoire();
    }


    switch (code) {
        case -1: //ne sait pas
            res = getPhraseErreurInconnu();
        break;

        case 0:

            if (rel === "r_carac"){
                verbe = getVerbeNegIsaOrCaracAleatoire();
            }
            else if (rel === "r_isa"){
                verbe = getVerbeNegIsaOrCaracAleatoire();
            }
            else if (rel === "r_has_part") {
                verbe = getVerbeNegHasPartAleatoire();
            }
            else if (rel === "r_agent_1") {
                verbe = getVerbeNegAgent_1Aleatoire();
            }
            else {
                res = "La réponse pour cette relation n'a pas été implémenté.";
            }
            res += fa +fw+ " " +
                   verbe +
                   sa + " " + sw;
            if(n3 != null){
                res+= " par déduction car "+fa+fw+" "+getVerbeNegIsaOrCaracAleatoire()+" "+fa+n3;
            }
        break;
        case 1:

            if (rel === "r_carac"){
                verbe = getVerbeAffIsaOrCaracAleatoire();
            }
            else if (rel === "r_isa"){
                verbe = getVerbeAffIsaOrCaracAleatoire();
            }
            else if (rel === "r_has_part") {
                verbe = getVerbeAffHasPartAleatoire();
            }
            else if (rel === "r_agent_1") {
                verbe = getVerbeAffAgent_1Aleatoire();
            }
            else {
                res = "La réponse pour cette relation n'a pas été implémenté.";
            }
            res += fa +fw+ " " +
                   verbe +
                   sa + " " + sw;
            if(n3 != null){
               res+= " par déduction car "+fa+fw+" "+getVerbeAffIsaOrCaracAleatoire()+" "+fa+n3;
            }
        break;
        default:
            res = getPhraseErreurInconnu();


    }
    var message = capitalizeFirstLetter(res) + ".";
    logMessageSended (false, message);
    bot.sendMessage(message);

};

exports.sendBackAnswerAffirmation = function (fw,sw,fw_id,sw_id,index_verbe,rel,result,words_tab){
    var mes = "Très bien ! Je retiens les informations suivantes";
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
