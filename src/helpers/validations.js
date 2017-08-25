var log = require('osg-logger').of('helpers/validations')
    ;

//TODO: Need to handle the case that the card has only warnings - currently no msg is sent to the user.
module.exports = function (validationsConfig) {

    return {
        validate: validate
    };


    function validate(event, card, versionTags, classOfServices, toLaneName, toParentLaneName) {

        var validationObj = {
            isCardRejected: false,
            cardSize: true,
            cardUsers: true,
            cardDueDate: true,
            cardDescription: true,
            cardOwnerTag: true,
            cardVersionTag: true,
            cardWIPClassOfService: true,
            isCardPassCodeReview: true,
            isCardPassDemo: true,
            isCardMovedAfterSuccesfullBuild: true,
            isCardTestedByOwner: true,
            validationSummary: ""
        };
        switch (event.eventType) {
            //These validations are a must have to move a card to Execution board.
            case "card-move-to-board":
            case "card-creation":
            case "card-move":
                // ********************************* General Execution card validations *****************************************
                if (card.Size > 1) {
                    validationObj.cardSize = true;
                    validationObj.isCardRejected = false;
                    validationObj.validationSummary += " - WARNING: Card size is more than 1 point, Unless it's a \"Parent Card\" please recheck.\n";
                }
                if (card.Size === 0) {
                    validationObj.cardSize = true;
                    validationObj.isCardRejected = false;
                    validationObj.validationSummary += " - WARNING: Card is missing size\n";
                }
                if (card.AssignedUsers && card.AssignedUsers.length < 2) {
                    validationObj.cardUsers = true;
                    validationObj.isCardRejected = false;
                    validationObj.validationSummary += " - WARNING: Card has only one user assigned, card needs a \"requestor\" and an \"owner\"\n";

                    if (card.AssignedUsers.length === 0) { //Meaning there are no users attached to the card at all!
                        validationObj.cardUsers = false;
                        validationObj.isCardRejected = true;
                        validationObj.validationSummary += " - MUST FIX: Card has NO user assigned!, card needs at least an \"owner\"\n";
                    }
                }
                if (!card.DueDate) {
                    validationObj.cardDueDate = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - MUST FIX: Card is missing a due date.\n";
                }
                if (!card.Description) {
                    validationObj.cardDescription = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - MUST FIX: Card is missing a description.\n";
                }
                if (card.Tags) {
                    var cardTags = card.Tags.split(',');
                    var card_owner_tag_RegEx = new RegExp(validationsConfig.card_owner_tag_RegEx, "ig");
                    if (!hasVersionTag(cardTags, versionTags)) { //Make sure the card has a version tag.
                        validationObj.cardVersionTag = false;
                        validationObj.isCardRejected = true;
                        validationObj.validationSummary += " - MUST FIX: Card is missing version tag.\n" + versionTags.toString().substring(88) + " \n";
                    }
                    if (!card.Tags.match(card_owner_tag_RegEx)) {
                        validationObj.cardOwnerTag = false;
                        validationObj.isCardRejected = true;
                        validationObj.validationSummary += " - MUST FIX: Card is missing owner tag in the form of: *" + validationsConfig.card_owner_tag_RegEx + " <the task owner>* to the card\ni.e. \"" + validationsConfig.card_owner_tag_RegEx + "pmbot\"\n";;
                    }
                }
                else { //In case the card does not have cards at all.
                    validationObj.cardVersionTag = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - MUST FIX: Card is missing one of these version tags: \n" + versionTags.toString().substring(88) + " \n";
                }


                // ******************************** Specific "card-move" validations ****************************************
                if (event.eventType === "card-move") { //Lane id of "DROP LANE" - meaning first execution move 
                    var valid = null;
                    for (var i = 0; i < classOfServices.length; i++) {
                        valid = true;
                        if (classOfServices[i] === card.ClassOfServiceTitle)
                            break;
                        else
                            valid = false;

                    }
                    if (!valid) {
                        validationObj.cardWIPClassOfService = false;
                        validationObj.isCardRejected = true;
                        validationObj.validationSummary += " - MUST FIX: Card is missing one of these class of service indicators:\n" + classOfServices.toString() + "\n";
                    }
                    //<<<<<<<<<<<<<<<<<<<<<< Ready for demo [UNITY, GAME MANAGMENT, GAME ENGINE] <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                    //< <           Card must include the code review tag in order to be moved to "ready for demo" lane              <<
                    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                    if (toLaneName === "Ready for Demo") {
                        validationObj = validateMoveIntoLane([toLaneName], card.ClassOfServiceTitle, validationObj, validationsConfig, card);
                    }
                    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Demoed [UNITY, GAME MANAGMENT, GAME ENGINE, DEVOPS]<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                    //< <         Card must include the demo pass/internal review tag in order to be moved to "demoed" lane          <<
                    //< <         Also validation to the previous "ready for demo lane"                                              <<
                    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                    if (toLaneName === "Demoed") {
                        validationObj = validateMoveIntoLane(["Ready for Demo", toLaneName], card.ClassOfServiceTitle, validationObj, validationsConfig, card);
                    }
                    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< STG LANES move validations <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                    if (toLaneName === "Balancing and Configuration" || toLaneName === "Delivery For QA" || toLaneName === "DevOps - Done lane") {
                        validationObj = validateMoveIntoLane(["Ready for Demo", "Demoed", toLaneName], card.ClassOfServiceTitle, validationObj, validationsConfig, card);
                    }
                    if (toParentLaneName === "Delivery For QA" || toParentLaneName === "STG - DONE") {
                        validationObj = validateMoveIntoLane(["Ready for Demo", "Demoed", toParentLaneName], card.ClassOfServiceTitle, validationObj, validationsConfig, card);
                    }
                }
                return validationObj;
        }
    }

};

function hasVersionTag(cTags, vTags) {
    return vTags.some(function (versionTag) {
        return cTags.indexOf(versionTag) >= 0;
    });
}

function validateMoveIntoLane(lanes, wip, validationObj, validationsConfig, card) {

    var unity_codeReviewTagRegEx = new RegExp(validationsConfig.unity_codeReviewTagRegEx, "i");
    var unity_demoedTagRegEx = new RegExp(validationsConfig.unity_demoedTagRegEx, "i");
    var unity_notTestedByOwnerTagRegEx = new RegExp(validationsConfig.unity_notTestedByOwnerTagRegEx, "i");
    var game_managment_codeReviewTagRegEx = new RegExp(validationsConfig.game_managment_codeReviewTagRegEx, "i");
    var game_managment_demoedTagRegEx = new RegExp(validationsConfig.game_managment_demoedTagRegEx, "i");
    var game_engine_codeReviewTagRegEx = new RegExp(validationsConfig.game_engine_codeReviewTagRegEx, "i");
    var game_engine_demoedTagRegEx = new RegExp(validationsConfig.game_engine_demoedTagRegEx, "i");
    var devops_demoedTagRegEx = new RegExp(validationsConfig.devops_demoedTagRegEx, "i");
    var devops_codeReviewTagRegEx = new RegExp(validationsConfig.devops_codeReviewTagRegEx, "i");

    for (var m = 0; m < lanes.length; m++) {
        if (lanes[m] === "Ready for Demo") {
            if (card.ClassOfServiceTitle === "WIP Unity") {
                if (!card.Tags.match(unity_codeReviewTagRegEx)) { 
                    validationObj.isCardPassCodeReview = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Code Review*\nPlease add a Tag in the form of: *" + validationsConfig.unity_codeReviewTagRegEx + " <the person who approved the CR>* to the card>\ni.e. \"" + validationsConfig.unity_codeReviewTagRegEx + "pmbot\"\n";
                }
            }
            if (card.ClassOfServiceTitle === "WIP Game Managment") {
                if (!card.Tags.match(game_managment_codeReviewTagRegEx)) { 
                    validationObj.isCardPassCodeReview = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Code Review*\nPlease add a Tag in the form of: *" + validationsConfig.game_managment_codeReviewTagRegEx + " <the person who approved the CR>* to the card>\ni.e. \"" + validationsConfig.game_managment_codeReviewTagRegEx + "pmbot\"\n";
                }
            }
            if (card.ClassOfServiceTitle === "WIP Game Engine") {
                if (!card.Tags.match(game_engine_codeReviewTagRegEx)) { 
                    validationObj.isCardPassCodeReview = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Code Review*\nPlease add a Tag in the form of: *" + validationsConfig.game_engine_codeReviewTagRegEx + " <the person who approved the CR>* to the card\ni.e. \"" + validationsConfig.game_engine_codeReviewTagRegEx + "pmbot\"\n";
                }
            }
            if (card.ClassOfServiceTitle === "WIP Dev Ops") {
                if (!card.Tags.match(devops_codeReviewTagRegEx)) { 
                    validationObj.isCardPassCodeReview = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Code Review*\nPlease add a Tag in the form of: *" + validationsConfig.devops_codeReviewTagRegEx + " <the person who approved the CR>* to the card\ni.e. \"" + validationsConfig.devops_codeReviewTagRegEx + "pmbot\"\n";
                }
            }
        }
        if (lanes[m] === "Demoed") {
            if (card.ClassOfServiceTitle === "WIP Unity") {
                if (!card.Tags.match(unity_demoedTagRegEx)) {
                    validationObj.isCardPassDemo = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Demo or Review*\nPlease add a Tag in the form of: *" + validationsConfig.unity_demoedTagRegEx + " <the person who approved the demo>* to the card\ni.e. \"" + validationsConfig.game_engine_codeReviewTagRegEx + "pmbot\"\n";
                }
            }
            if (card.ClassOfServiceTitle === "WIP Game Managment") {
                if (!card.Tags.match(game_managment_demoedTagRegEx)) {
                    validationObj.isCardPassDemo = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Demo or Review*\nPlease add a Tag in the form of: *" + validationsConfig.game_managment_demoedTagRegEx + " <the person who approved the demo>* to the card\ni.e. \"" + validationsConfig.game_managment_demoedTagRegEx + "pmbot\"\n";
                }
            }
            if (card.ClassOfServiceTitle === "WIP Game Engine") {
                if (!card.Tags.match(game_engine_demoedTagRegEx) && !card.Tags.match(game_engine_codeReviewTagRegEx)) { 
                    validationObj.isCardPassDemo = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Demo or Review*\nPlease add a Tag in the form of: *" + validationsConfig.game_engine_demoedTagRegEx + " <the person who approved the demo>* to the card\ni.e. \"" + validationsConfig.game_engine_demoedTagRegEx + "pmbot\"\n";
                }
            }
            if (card.ClassOfServiceTitle === "WIP Dev Ops") {
                if (!card.Tags.match(devops_demoedTagRegEx)) { 
                    validationObj.isCardPassDemo = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before passing *Internal Review*\nPlease add a Tag in the form of: *" + validationsConfig.devops_demoedTagRegEx + " <the person who approved the internal review>* to the card\ni.e. \"" + validationsConfig.devops_demoedTagRegEx + "pmbot\"\n";
                }
            }
        }
        if (lanes[m] === "Balancing and Configuration" || lanes[m] === "Delivery For QA" || lanes[m] === "STG - DONE") {
            if (card.ClassOfServiceTitle === "WIP Unity") {
                if (!card.Tags.match(unity_notTestedByOwnerTagRegEx)) {
                    validationObj.isCardMovedAfterSuccesfullBuild = false;
                    validationObj.isCardRejected = true;
                    validationObj.validationSummary += " - *MUST FIX:* Card cannot be moved to " + lanes[m] + " before a *succesful build has completed*.\nPlease add a Tag in the form of: *" + validationsConfig.unity_notTestedByOwnerTagRegEx + " <the succesful build number from jenkins>\ni.e. \"" + validationsConfig.unity_notTestedByOwnerTagRegEx + "1.4.5.99\"";
                }
            }
        }
    }
    return validationObj;
}

log.info('module loaded');