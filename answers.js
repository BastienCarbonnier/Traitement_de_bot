/*jshint esversion: 6 */
var http = require('http'),
    tools = require('./tools.js'),
    bot = require('../server.js'),
    windows1252 = require('windows-1252');

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
        "est"//,"peut-être"
    ];

    var numRandom = Math.floor(Math.random()*listVerbeCarac.length);

    return listVerbeCarac[numRandom];
}

function getVerbeIsaAleatoire(){
    var listVerbeIsa = [
        "est",//"peut-avoir","est-constitué"
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
        "J'aime le bruit blanc de l'eau."
    ];
    console.log("first word : "+first.word+" second word : "+second.word);
    if (first.word !== "ordinateur" || second.word === -1 || first.word === -1){

        var numRandom = Math.floor(Math.random()*listPhraseErreur.length);

        bot.sendMessage(listPhraseErreur[numRandom]);
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

    bot.sendMessage(capitalizeFirstLetter(res) + ".");

    /*
        tools.getDataFromWebsite(function(err,data){
                if (err) {
                    // error handling code goes here
                    console.log("ERROR : ",err);
                    bot.sendMessage(err);
                } else {
                    // code to execute on data retrieval
                    console.log("result from requete is : ",data);
                    bot.sendMessage(data);
                }
        });
    */


    //+ "  article : "+ getArticleBeforeWord(second.word,words_tab);
};
