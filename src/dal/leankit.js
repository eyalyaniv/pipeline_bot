var log = require('osg-logger').of('dal/leankit'),
    LeanKitClient = require("leankit-client"),
    LeanKitEvents = require("leankit-client/events"),
    striptags = require('striptags')
    ;

module.exports = function (config, ready) {

    var leankitConfig = config.pmbot.leankit;
    var client = new LeanKitClient(leankitConfig.accountName, leankitConfig.email, leankitConfig.password);

    var boards = {};

    var api = {
        generateEvents: generateEvents,
        getCard: getCard,
        moveCardToBoard: moveCardToBoard,
        getLanes: getLanes,
        getLaneNameById: getLaneNameById,
        getLaneObjById:getLaneObjById,
        updateCardByName: updateCardByName,
        getCardHistory: getCardHistory,
        constructLeankitCardUrl: constructLeankitCardUrl,
        stripHtmlFromText: stripHtmlFromText
    };

    getBoard(leankitConfig.boardId_execution, function (err, board) {
        boards.execution = board;
        ready(null, api);
    });

    function generateEvents(eventList, boardId) {
        var events = new LeanKitEvents(client, boardId, 0, 15, true);
        for (var e in eventList) {
            events.on(e, eventList[e]);
        }
        //For listening to leankit-client/events debug logs 
        events.on("debug", function(e){
            log.info("leankit-client debug log: ", e);
        });
        events.on("error", function(e){
            log.info("leankit-client error log: ", e);
        });
        events.on("polling", function(e){
            log.info("leankit-client polling log: ", e);
        });
        //--------------------------------------------------
        events.start();
    }

    function moveCardToBoard(cardId, boardId, callback) {
        client.moveCardToBoard(cardId, boardId, callback);
    }

    function getBoards(callback) {
        client.getBoards(function (err, boards) {
            if (err) {
                log.error("Error getting boards:", err);
                return callback(err); 
            }
            callback(null, boards);
        });
    }

    function getBoard(boardId, cb) {
        client.getBoard(boardId, function (err, board) {
            if (err) {
                log.error("Error getting boards:", err);
                return cb(err);
            }
            cb(null, board);
        });
    }

    function getCard(boardId, cardId, event, cb) {
        client.getCard(boardId, cardId, function (err, card) {
            if (err) {
                return cb(err);
            }
            cb(null, card, event);
        });
    }

    function getLanes() {
        return boards.execution.Lanes;
    }

    function getLaneNameById(lanes, laneId) {
        if(laneId === 156145202)
            return "DROP LANE";
        for (var i = 0; i < lanes.length; i++) {
            if (lanes[i].Id === laneId) {
                return lanes[i].Title;
            }
        }
        return null;
    }

    function getLaneObjById(lanes, laneId) {
        if(laneId === 156145202)
            return "DROP LANE";
        for (var i = 0; i < lanes.length; i++) {
            if (lanes[i].Id === laneId) {
                return lanes[i];
            }
        }
        return null;
    }

    function updateCardByName(boardName, card, event, cb) {
        client.updateCard(config.pmbot.leankit.boardNameToId[boardName], card, function (err, card) {
            if (err) {
                return cb(err);
            }
            cb(null, card, event);
        });
    }

    function getCardHistory(boardId, cardId, cb){
        client.getCardHistory(boardId, cardId, function (err, history) {
            if (err) {
                return cb(err);
            }
            cb(null, history);
        }); 
    }

    function constructLeankitCardUrl(boardId, cardId) {
        var cardUrl = "https://core3.leankit.com/Boards/View/" + boardId + "/" + cardId;
        return cardUrl;
    }

    function stripHtmlFromText(html, allowedTags){
        return striptags(html, allowedTags);
    }

};


log.info('module loaded');