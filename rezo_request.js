/*jshint esversion: 6 */
var rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    fs 			= require("fs"),
    tools       = require("./tools.js");


    function getRelationPoids(data,fw,sw,fw_id,sw_id,rel_id,callback){
        var regex = new RegExp("r;\\d*;"+fw_id+";"+sw_id+";"+rel_id+";(-|)\\d*","g");
        var res = data.match(regex);

        if (res != null){
            var tab_res = res[0].split(";");
            callback(tab_res[5]);
        }
        else{
            callback(null);
        }

    }

    function getFirstWordID (data,fw,callback){
        var regex = new RegExp("e;\\d*;'"+fw+"';\\d*;\\d*","g");
        var res = data.match(regex);
        if (res != null){
            var tab_res = res[0].split(";");
            callback(tab_res[1]);
        }
        else{
            callback(-1);
        }

    }

    function getSecondWordID (data,sw,callback){
        var regex = new RegExp("e;\\d*;'"+sw+"';\\d*;\\d*","g");
        var res = data.match(regex);
        if (res != null){
            var tab_res = res[0].split(";");
            callback(tab_res[1]);
        }
        else{
            callback(-1);
        }
    }

    function getRelationsSortantes(fw,rel_id,callback){

        makeGetRequestRezoDump(fw,rel_id,"&relin=norelin",function(err, result){
            if (!err){

                var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
                var rs = result.match(regex_rs);
                //console.log(rs);
                var n3_tab = [];
                var w_tab = [];
                if (rs != null){
                    for (var i in rs){
                        var tab_rs = rs[i].split(";");
                        if (Number(tab_rs[5])>0){
                            n3_tab[n3_tab.length] = Number(tab_rs[3]);
                            w_tab[w_tab.length] = Number(tab_rs[5]);
                        }
                    }
                    callback(null,n3_tab,w_tab,result);
                }
                else{
                    callback(-1);
                }

            }
            else {
                callback(-1);
            }

        });
    }
    function getRelationsEntrantes(sw,rel_id,callback){

        makeGetRequestRezoDump(sw,rel_id,"&relout=norelout",function(err, result){
            if (!err){

                var regex_re = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
                var re = result.match(regex_re);
                //console.log(re);
                var n3_tab = [];
                var w_tab = [];
                if (re != null){
                    for (var i in re){
                        var tab_re = re[i].split(";");
                        n3_tab[n3_tab.length] = Number(tab_re[2]);
                        w_tab[w_tab.length] = Number(tab_re[5]);
                    }
                    callback(null,n3_tab,w_tab);
                }
                else{
                    callback(-1);
                }

            }
            else {
                callback(-1);
            }

        });
    }

    // e;150;'chat';1;5028

    function getWordByID (data,w_id,callback){
        var regex = new RegExp("e;"+w_id+";'.*';\\d*;\\d*","g");
        var res = data.match(regex);
        if (res != null){
            var tab_res = res[0].split(";");
            var ind_raf = tab_res[2].indexOf(">");
            if (ind_raf!=-1){
                callback(tab_res[2].substring(1,ind_raf));
            }
            else{
                callback(tab_res[2].substring(1,tab_res[2].length-1));
            }

        }
        else{
            callback(-1);
        }

    }

    function makeLiveInference (fw,sw,db_fw_id,db_sw_id,rel_id,callback){

        getRelationsSortantes(fw,6,function(err,rs,w_tab_rs,rs_data){

            console.log("Je suis dans makeLiveInference() : ");
            //console.log(rs);

            if (rs!= undefined){
                getRelationsEntrantes(sw,rel_id,function(err,re,w_tab_re){
                    if (re!=undefined){
                        findInference(rs,re,w_tab_rs,w_tab_re,function(err,id_n3,rs_positive,re_positive){
                            if (err){
                                callback(false);
                            }
                            else {
                                getWordByID(rs_data,id_n3,function(word_n3){
                                    callback(true,word_n3,rs_positive,re_positive);
                                });

                            }

                        });
                    }
                    else{
                        callback(true);
                    }



                });
            }
            else{
                callback(false);
            }


        });



    }
    function findInference (rs,re,w_tab_rs,w_tab_re,callback){
        var max_index_rs=-1;
        var max_poids_rs =-1;

        var min_index_rs=-1;
        var min_poids_rs=1;

        var re_positive = true;
        var rs_positive = true;

        var i;
        for(i in rs){
            var index = re.indexOf(rs[i]);
            if (index != -1){
                if (w_tab_rs[i]>0){
                    if(w_tab_rs[i]>max_poids_rs){
                        if(w_tab_re[index]>0){
                            re_positive = true;
                        }
                        else{
                            re_positive = false;
                        }
                        max_poids_rs = w_tab_rs[i];
                        max_index_rs = rs[i];
                        rs_positive = true;
                    }
                }
                else{
                    if(w_tab_rs[i]<min_poids_rs){
                        if(w_tab_re[index]>0){
                            re_positive = true;
                        }
                        else{
                            re_positive = false;
                        }
                        min_poids_rs = w_tab_rs[i];
                        min_index_rs = rs[i];
                        rs_positive = false;
                    }
                }

            }
        }

        console.log("*** Dans findInference() ***");

        console.log("max_index_rs = "+max_index_rs);
        console.log("max_poids_rs = "+max_poids_rs);

        console.log("min_index_rs = "+min_index_rs);
        console.log("min_poids_rs = "+min_poids_rs);

        console.log(" re_positive = "+re_positive);
        console.log(" rs_positive = "+rs_positive);

        if(i!=rs.length-1){
            callback(true);
        }
        else {
            if (max_index_rs ==-1 && min_index_rs==-1){
                callback(true);
            }
            else{
                if (Math.abs(max_poids_rs)>Math.abs(min_poids_rs)){
                    callback(false,max_index_rs,rs_positive,re_positive);
                }
                else{
                    callback(false,min_index_rs,rs_positive,re_positive);

                }

            }
        }

    }

    function makeGetRequestRezoDump (word,rel_id,param,callback){
        var url = windows1252.encode("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel="+word+"&rel="+rel_id+(param==null?"":param));
        console.log(url);
        const options = {
            uri: url,
            encoding: 'binary',
            transform: function (body) {
                return cheerio.load(body, {decodeEntities: false});
            }
        };

        rp(options)
        .then(($) => {

            var result = $('code').text();
            callback(null,result);


        })
        .catch((err) => {
            console.log(err);
            callback(err);
        });
    }

    // data doit être non vide
    function findMaxPoidsRelSortante(data,callback){
    	var max_poids =-1;
    	var max_index =-1;
    	for (var i in data){
    		var line = data[i].split(";");
    		if(line[5]>max_poids){
    			max_poids = line[5];
    			max_index = line[3];
    		}
    	}
    	callback(max_index);
    }

    function wordIsInDatabase (word,callback){

        makeGetRequestRezoDump(word,1,"",function(err,result){
            if (!err){
                var regex = new RegExp("e;\\d*;"+word+";1;\\d*","g");
                var res = result.match(regex);
                if (res == null){
                    callback(null,false);
                }
                else{
                    callback(null,true);
                }
            }
            else {
                callback(true);
            }

        });
    }


    /**
     * Make an http request to RezoDump and process the result
     * @param  {String}   fw       First Word
     * @param  {String}   sw       Second Word
     * @param  {String}   rel      Relation
     * @param  {Function} callback
     */
    function checkRelationFromRezoDump(fw,sw,rel,callback){
        var relations = {
            "r_isa" : 6,
            "r_has_part" : 9,
            "r_carac" : 17,
            "r_agent_1" : 24
        };
        console.log("relation : "+rel);
        var rel_id = relations[rel];

        makeGetRequestRezoDump(fw,rel_id,null,function(err, result){
            if (err) callback(-1);
            else{
                getFirstWordID(result,fw,function(db_fw_id){
                    getSecondWordID(result,sw,function(db_sw_id){
                        if (db_sw_id == -1){
                            console.log("Pas de relations entrantes");
                            console.log("Lancement Inferences Live : ");
                            makeLiveInference(fw,sw,db_fw_id,db_sw_id,rel_id,function(err,id_n3,rs_positive,re_positive){
                                if (rs_positive != null && re_positive != null){
                                    callback(-1,true,id_n3,rs_positive,re_positive);
                                }
                                else {
                                    console.log("Poids inconnu !");
                                    callback(-1);
                                }
                            });
                        }
                        else{
                            getRelationPoids(result,fw,sw,db_fw_id,db_sw_id,rel_id,function(rel_poids){

                                if (rel_poids != null){
                                    console.log("\nPoids relation : "+rel_poids);
                                    if (rel_poids>0){
                                        callback(1);
                                    }
                                    else{
                                        callback(0);
                                    }
                                }
                                else {
                                    console.log("Poids inconnu !");
                                    callback(-1);
                                }
                            });

                        }
                    });
                });
            }

        });
    }


    module.exports.makeGetRequestRezoDump = makeGetRequestRezoDump;
    module.exports.findMaxPoidsRelSortante = findMaxPoidsRelSortante;
    module.exports.checkRelationFromRezoDump = checkRelationFromRezoDump;
    module.exports.wordIsInDatabase = wordIsInDatabase;
