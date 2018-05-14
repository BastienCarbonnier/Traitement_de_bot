/*jshint esversion: 6 */

var rp          = require('request-promise'),
cheerio     = require('cheerio'),
windows1252 = require('windows-1252'),
fs 			= require("fs"),
rezo_request= require("./rezo_request.js");

function isArticle(word){
    var tabArticles = [
        "le","la","l","les", //article definis
        "une","un","uns","unes","des","d", // article indefini
        "du","de la","de l",// article partatifs
        "au","aux" // article def contracté
    ];

    return (tabArticles.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isArticleContractable(art){
    var listArticleContr = [
        "une","un","uns","unes","au","aux"
    ];

    var numRandom = Math.floor(Math.random()*listArticleContr.length);

    return listArticleContr[numRandom];
}


function isVerbeIsaQuestion (word){
    var tabVerbeIsa = [
        "est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeIsa.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeCaracQuestion(word){
    var tabVerbeCarac = [
        "est-il","est-elle","sont-elles","sont-ils"
    ];
    return (tabVerbeCarac.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeHasPartQuestion(word){
    var tabVerbeHasPart = [
        "a-t-il","a-t-elle","possède-t-il","possède-t-elle"
    ];
    return (tabVerbeHasPart.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function isVerbeAgent_1Question(word){
    var tabVerbeAgent_1 = [
        "peut-il","peut-elle","peuvent-ils","peuvent-elles"
    ];
    return (tabVerbeAgent_1.indexOf(word.toLowerCase())!=-1);
}


function isAdjectif(word){
    var tabAdjectifs = [
        "ce","cet","cette","ces", //adjectifs demonst
        "mon","ton","son","notre","votre","leur","ma","ta","sa","mes","tes","ses","nos","vos","leurs", // adj possessifs
        "aucun", "aucune" , "aucuns", "aucunes",// Adj indéfinis
        "maint", "mainte" , "maints", "maintes",
        "quel que", "quelle que" , "quels que", "quelles que",
        "tel", "telle" , "tels", "telles",
        "tout", "toute" , "tous", "toutes",
        "chaque", "plusieurs", "divers",
        "autre", "autres" , "même", "mêmes" , "quelque", "quelques",
        "quelconque", "quelconques",
        "certain", "certaine" , "certains", "certaines",
        "divers", "diverse" , "divers", "diverses",
        "différent", "différente" , "différents", "différentes",
        "nul", "nulle" , "nuls", "nulles"
    ];
    return (tabAdjectifs.indexOf(word.toLowerCase())!=-1); //indexOf renvoie l'index du mot ou -1 s'il n'y est pas
}

function initialization (callback){
    var mc = fs.readFileSync("./Traitement_de_bot/mots_composes.txt","binary");
    var mc_tab = mc.split("\n");
    var hashmap_mc = new Map();

    for (var i in mc_tab){
        var t = mc_tab[i].split(";");
        hashmap_mc.set(t[1],t[0]);
    }

    callback(hashmap_mc);

}
function isQuestion (words,callback){
    if (words.indexOf("?") != -1 ){
        words.splice(words.length-1);
    }
    if(words[0]==="Est-ce"){
        if (words[2]==="que"){
            words.splice(0,2);
        }
        else{
            var w1_tab = words[1].split(/\'/);
            console.log(w1_tab);
            if (w1_tab.length>1){
                words.splice(0,1);
                words[0] = w1_tab[1];
            }
            else{
                words.splice(0,2);
            }
        }
        console.log(words);
        callback(true,words);
        return;
    }
    else if(words[0]==="Est"&&words[1]==="ce"){
        if (words[2]==="que"){
            words.splice(0,3);
        }
        else{
            var w2_tab = words[2].split(/\'/);
            console.log(w2_tab);
            if (w2_tab.length>1){
                words.splice(0,2);
                words[0] = w2_tab[1];
            }
            else{
                words.splice(0,3);
            }
        }

        callback(true,words);
        return;
    }
    else{
        for (var i in words){
            if (isVerbeIsaQuestion(words[i])||isVerbeCaracQuestion(words[i])||isVerbeHasPartQuestion(words[i])||isVerbeAgent_1Question(words[i])){
                callback(true,words);
                return;
            }

        }
    }
    callback(false,words);
}


 function checkComposedWord(words_tab,index_verbe,hashmap_mc,callback){

    for (var i=0;i<index_verbe;i++){
        let mot = "";
        i = Number(i);

        let k = 0;
        for (k=i;k<index_verbe;k++){
            mot += words_tab[k]+" ";
        }
        mot = mot.substring(0,mot.length-1);

        if(hashmap_mc.get(mot)!== undefined){
            words_tab.splice(i,k-2);
            words_tab[i]=mot;
            index_verbe = index_verbe - k+2;
            break;
        }
    }

    for (var j=index_verbe+1;j<words_tab.length;j++){
        let mot = "";
        j = Number(j);

        let k = 0;
        for (k=j;k<words_tab.length;k++){
            mot += words_tab[k]+" ";
        }
        mot = mot.substring(0,mot.length-1);

        if(hashmap_mc.get(mot)!== undefined){
            words_tab.splice(j,k-1);
            words_tab[j]=mot;
        }

    }
    callback(words_tab,index_verbe);
}

function isVerbe(word,callback){
    rezo_request.makeGetRequestRezoDump(word,4,"",function(err,data){
        if (!err){
            //r;2356179;253302;146885;4;30
            var regex = new RegExp("r;\\d*;\\d*;\\d*;4;\\d*","g");
            var res = data.match(regex);
            if (res == null){
                callback(true);
            }
            else{
                rezo_request.findMaxPoidsRelSortante(res,function(index_role){
                    var regex2 = new RegExp("e;"+index_role+";'.*';4;\\d*","g");
                    var res2 = data.match(regex2);
                    if (res2 == null){
                        callback(null,false);
                    }
                    else{
                        console.log(res2);
                        for (var i in res2){
                            var line = res2[i].split(";");
                            if(line[2].indexOf("Ver")!=-1){
                                callback(null,true);
                                return;
                            }
                        }
                        callback(null,false);
                    }
                });
            }
        }
        else {
            callback(true);
        }

    });
}

module.exports.isVerbeIsaQuestion = isVerbeIsaQuestion;
module.exports.isVerbeCaracQuestion = isVerbeCaracQuestion;
module.exports.isVerbeHasPartQuestion = isVerbeHasPartQuestion;
module.exports.isVerbeAgent_1Question = isVerbeAgent_1Question;

module.exports.isArticle = isArticle;
module.exports.isArticleContractable = isArticleContractable;
module.exports.isAdjectif = isAdjectif;
module.exports.checkComposedWord = checkComposedWord;
module.exports.isQuestion = isQuestion;
module.exports.isVerbe = isVerbe;
module.exports.initialization = initialization;
