exports.process = function(message)
{

    var fs = require("fs");
    var content = fs.readFileSync("./Traitement_de_bot/heber_19409044_skypebot_ordi.json","utf8");
    var contentTraite = content.replace(/'/g,'"');
    const obj = JSON.parse(contentTraite);


    var analyzed = getWordsFromMessage(message);
    console.log(analyzed);
    var words = giveWord(analyzed);
    words = allRoleWord(words,obj);

    console.log(words);


    var finalMessage = "";

    finalMessage += printSentence(words,question,obj);

    return finalMessage;
}
