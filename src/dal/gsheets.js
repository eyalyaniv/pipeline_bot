var log = require('osg-logger').of('dal/gsheets'),
    request = require("request");

module.exports = function (config, ready) {

    var gsheetsConfig = config.pmbot.gsheets;

    var api = {
        insertPostDemoReport: insertPostDemoReport,
        producePostTaskReport: producePostTaskReport,
        extractTextAfterTagDots: extractTextAfterTagDots
    };

    process.nextTick(function(){
        ready(null,api);
    });

    function extractTextAfterTagDots(tagsArray, tagMatchPattern){
        var postDotsTagValues = [];
        for(var i = 0; i < tagsArray.length; i++){
            if(tagsArray[i].match(tagMatchPattern)){
                postDotsTagValues.push(tagsArray[i].match(/:(.*)/)[1]); 
            }
        }
        return postDotsTagValues;
    }

    function createSubArrayFromMatches(tagsArray, tagMatchPattern){
        var reducedMatchesArray = [];
        for(var i = 0; i < tagsArray.length; i++){
            if(tagsArray[i].match(tagMatchPattern)){
                reducedMatchesArray.push(tagsArray[i]); 
            }
        }
        return reducedMatchesArray;
    }

    function findCardDemoDate(card, history, demos_MatchRegEx){
        //Cycle to find demo date
        for (var i = history.length - 1; i >= 0; i--) {
            if (history[i].Changes) { //Find if the card had changes to it's values which "tags" are among
                for (var j = 0; j < history[i].Changes.length; j++) { //cycle through changes
                    if (history[i].Changes[j].FieldName === "Tags" && history[i].Changes[j].NewValue && history[i].Changes[j].NewValue.match(demos_MatchRegEx)) { //If the change is "tags" and the new value consists of "demo to:" 

                        var reducedMatchArray = createSubArrayFromMatches(history[i].Changes[j].NewValue.split(','), demos_MatchRegEx); //Will result with reduced array holding only the matched items from all the tags.

                        var didDemoPass = extractTextAfterTagDots(reducedMatchArray, demos_MatchRegEx); 

                        for (var k = 0; k < didDemoPass.length; k++){
                            if(didDemoPass[k] !== "fail"){
                             return history[i].DateTime;
                            }
                        }
                    }
                }
            }
        }
    }

    function daysBetween( date1, date2 ) {
        //Get 1 day in milliseconds
        var one_day=1000*60*60*24;

        // Convert both dates to milliseconds
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();

        // Calculate the difference in milliseconds
        var difference_ms = date2_ms - date1_ms;
    
        // Convert back to days and return
        return Math.round(difference_ms/one_day); 
    }

    //The time in DAYS between moving INTO execution board and "Waiting for QA" Lane.
    function calculateCardDueTime(eventDateTime, history){
        for (var i = 0; i < history.length; i++) {
            if (history[i].Type === "CardMoveToBoardEventDTO" && history[i].BoardTitle === "Execution") {
                //format the dates to mm/dd/yyy
                var startDate =  history[i].DateTime.match(/.+?(?= at)/)[0].split('/');
                var endDate = eventDateTime.match(/.+?(?= )/)[0].split('/');

                return daysBetween(new Date(startDate[2],startDate[1],startDate[0]), new Date(endDate[2],endDate[1],endDate[0]));
            }
        }
    }

    //Creates an object consists all the nessesary parameters of a done card to be injected to google sheet report.
    function producePostTaskReport( event,              /*card move event obj*/ 
                                    card,               /*card obj*/
                                    versionTags,        /*An array with all supported version tags*/ 
                                    classOfServices,    /*An array with all supported version tags*/ 
                                    toLaneName,         /*The name of the lane the card moved to*/
                                    toParentLaneName,   /*The name of the parent lane of toLaneName*/
                                    history             /*All card history up until the last move event*/
                                    ){

        //var demoTo_MatchRegEx = null;
        var demos_MatchRegEx = null; // A regex which will be used to matche passed demoes from the "tags" string.
        var demos_fail_MatchRegEx = null; // A regex which will be used to matche failed demoes from the "tags" string.
        var teamSheetUrl = null;
        var numOfDemos = null;
        var splitTagsArray = card.Tags.split(',');

        if(card.ClassOfServiceTitle === "WIP Unity"){
            demos_MatchRegEx = new RegExp(config.pmbot.validations.unity_demoedTagRegEx, "ig"); 
            demos_fail_MatchRegEx = new RegExp(config.pmbot.validations.unity_demoFailTagRegEx, "ig"); 
            teamSheetUrl = gsheetsConfig.client_pdr_script_url;
        }
        if(card.ClassOfServiceTitle === "WIP Game Managment"){
            demos_MatchRegEx = new RegExp(config.pmbot.validations.game_managment_demoedTagRegEx, "ig");
            demos_fail_MatchRegEx = new RegExp(config.pmbot.validations.game_managment_demoFailTagRegEx, "ig"); 
            teamSheetUrl = gsheetsConfig.gms_pdr_script_url;
        }
        if(card.ClassOfServiceTitle === "WIP Game Engine"){
            demos_MatchRegEx = new RegExp(config.pmbot.validations.game_engine_demoedTagRegEx, "ig");
            demos_fail_MatchRegEx = new RegExp(config.pmbot.validations.game_engine_demoFailTagRegEx, "ig"); 
            teamSheetUrl = gsheetsConfig.ge_pdr_script_url;
        }
        if(card.ClassOfServiceTitle === "WIP Dev Ops"){
            demos_MatchRegEx = new RegExp(config.pmbot.validations.devops_demoedTagRegEx, "ig");
            demos_fail_MatchRegEx = new RegExp(config.pmbot.validations.devops_demoFailTagRegEx, "ig"); 
            teamSheetUrl = gsheetsConfig.devops_pdr_script_url;
        }

        var card_owner_tag_RegEx = new RegExp(config.pmbot.validations.card_owner_tag_RegEx, "ig");

        if(card.Tags.match(demos_MatchRegEx)){
            numOfDemos = card.Tags.match(demos_MatchRegEx).length; //Adds the number of successfull demos. 
            if(card.Tags.match(demos_fail_MatchRegEx)){
                numOfDemos += card.Tags.match(demos_fail_MatchRegEx).length; //Adds the number of failed demos.
            }
        } 

        var cardOwner = extractTextAfterTagDots(splitTagsArray, card_owner_tag_RegEx); //Will result with an array holding the names after the : of each demo tag on the card.
       
        var demoedTo = extractTextAfterTagDots(splitTagsArray, demos_MatchRegEx); //Will result with an array holding the names after the : of each demo tag on the card.

        var demoDate = findCardDemoDate(card, history, demos_MatchRegEx); //The date in which the "pass" demo took place.

        var dueTime = calculateCardDueTime(event.eventDateTime, history); //The time in DAYS between moving INTO execution board and "Waiting for QA" Lane.


        var postTaskReportObj = {
            owner: cardOwner, 
            title: card.Title, 
            demoedTo: demoedTo[0],
            demoDate: demoDate,
            cardLink: "https://core3.leankit.com//Boards/View/156116725" + "/" + card.Id,
            cardSize: card.Size,
            numOfDemos: numOfDemos,
            dueTime: dueTime,
            comment: "none",
            isTestBot: "true"
        };

        
        if(teamSheetUrl){ 
            log.info("demo report: %j" , postTaskReportObj);
            insertPostDemoReport(postTaskReportObj, teamSheetUrl);
            return postTaskReportObj;
        }

    }

    function insertPostDemoReport(dataJson, teamSheetUrl){
        var gSheetsRequest = new Promise(function(resolve, reject) {
            if(gsheetsConfig.gsheetsInt){
                request( { method: 'POST', url: teamSheetUrl, json: true, body: dataJson}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        log.info('Post demo report inserted sucessfully');
                        resolve(dataJson);
                    }
                    else{
                        log.fatal('Post demo report failed to inserted with the error: ' + error + ' and status code: ' + response.statusCode, teamSheetUrl);
                        reject(false);
                    }
                });
            }        
        });

        gSheetsRequest.then(function successHandler(result) {
                return result;
            }, function failureHandler(error) {
                return null;
            });
    }
};

log.info('module loaded');



            /*
            request( { method: 'POST', url: teamSheetUrl, headers: {'Content-Type': 'application/json'}, json: true, data: dataJson}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //log.info('Post demo report inserted sucessfully');
                }
            });*/

                   // request.post( gms_pdr_script_url, JSON.stringify(event), function (error, response, body) {
            //     if (!error && response.statusCode == 200) {
            //         console.log(body);
            //     }
            // });