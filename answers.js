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
exports.getTheAnswerToSendBack = function(first,second,result_isRelationTrue,words_tab)
{
    var res = "";
    var verbe = "";
    var firstArticle = getArticleBeforeWord(first,words_tab);
    var secondArticle = getArticleBeforeWord(second.word,words_tab);

    firstArticle = (firstArticle==-1 ? "" : firstArticle);
    secondArticle = (secondArticle==-1 ? "" : secondArticle);
    console.log("relation = "+result_isRelationTrue.relation);
    switch (result_isRelationTrue.code) {
        case -1:


            res += firstArticle + " " +first+ " et " +
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

            res += firstArticle + " " +first+ " " +
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

            res += firstArticle + " " +first+ " " +
                   verbe + " " + getAdverbeAffAleatoire()+ " " +
                   secondArticle + " " + second.word ;

        break;
        default:
        res += "Erreur de sortie isRelationTrue";
    }
    //var res = "second word : "+second.word;
    return capitalizeFirstLetter(res) + ".";//+ "  article : "+ getArticleBeforeWord(second.word,words_tab);
};
