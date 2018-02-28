exports.getTheAnswerToSendBack = function(first,second,result_isRelationTrue,words)
{
    var res = "";
    console.log("deuxièmemot:"+second.word);
    console.log("coderelation:"+result_isRelationTrue.code);
    switch (result_isRelationTrue.code) {
        case -1:
        res += "Les mots " + first + " et " + second.word + " n'ont aucun lien. ";
        break;
        case 0:
        res += "Relation " + result_isRelationTrue.relation + " négative entre les mots " + first + " et " + second.word;
        break;
        case 1:
        res += "Les deux mots " + first + " et " + second.word + " ont bien le lien " + result_isRelationTrue.relation + ". ";
        console.log(result_isRelationTrue.relation);
        break;
        default:
        res += "Erreur de sortie isRelationTrue";
    }

    return res;
};
