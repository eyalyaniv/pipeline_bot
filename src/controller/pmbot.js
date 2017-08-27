
var log = require('osg-logger').of('controller/pmbot'),
    async = require('async'),
    validations = require('../helpers/validations')
    ;

module.exports = function (app, ready) {

    // controller globals
    var config = app.config,
        api = {

        },
        routes = app.routes.of('pmbot')(api, app.middlewares)
        ;

    var validator = validations(config.pmbot.validations);
    var dals;

    /**/var boardId_execution = config.pmbot.leankit.boardNameToId["Core3 Execution"];
    var boardId_autoviews = config.pmbot.leankit.boardNameToId["AutoViews component"];
    var boardId_components = config.pmbot.leankit.boardNameToId["Components Library"];
    /**/var boardId_plan = config.pmbot.leankit.boardNameToId["Core3 Iteration Planing"];
    var boardId_devrel = config.pmbot.leankit.boardNameToId["Dev Rel - Bruce"];
    var boardId_devserver = config.pmbot.leankit.boardNameToId["Dev Server"];
    /**/var boardId_devops = config.pmbot.leankit.boardNameToId["DEVOPS"];
    var boardId_docmentation = config.pmbot.leankit.boardNameToId["Docmentation"];
    var boardId_intelligence = config.pmbot.leankit.boardNameToId["INTELLIGENCE"];
    var boardId_reactbases = config.pmbot.leankit.boardNameToId["React Bases"];
    var boardId_stylable = config.pmbot.leankit.boardNameToId["Stylable"];

    var pmbot_leankit_id = config.pmbot.leankit.pmbot_leankit_id;

    async.parallel(
        {
            leankit: app.dal.of('leankit').bind(null, config),
            slack: app.dal.of('slack').bind(null, config),
            gsheets: app.dal.of('gsheets').bind(null, config)
        },
        function (err, dals_) {
            if (err) {
                return ready(err);
            }
            dals = dals_;

            dals.leankit.generateEvents(leankitEventsList_execution_board, boardId_execution);
            //dals.leankit.generateEvents(leankitEventsList_devops_board, boardId_devops);
            //dals.leankit.generateEvents(leankitEventsList_plan_board, boardId_plan);

            dals.slack.generateEvents(botkit_events);
            dals.slack.generateHearsEvents(botkit_hears_events);

            ready(null, { routes: routes, api: api });
        }
    );

    
    //Lookup table to convert Leankit user Id to slack private channel
    var usersLeankitToSlack = {
        524080520: "@alex.s",
        524714102: "@alisey",
        524066797: "@amira",
        207536925: "@annie",
        524077600: "@arnon",
        524066792: "@avi.vahl",
        524709448: "@barak",
        527462452: "@bruce",
        524714108: "@danielstr",
        524228992: "@qballer",
        517729996: "@eyalyaniv",
        524080525: "@gilad",
        520933978: "@hadar",
        527485070: "@idoros",
        527462458: "@fil",
        524351608: "@iftachy",
        524077601: "@jiri.tobisek",
        524709475: "@jomarton",
        524728148: "@zombiefruit",
        525414539: "@leo",
        524714103: "@liorzi", 
        524714104: "@max",
        524709460: "@maksym",
        527138810: "@nadavov",
        524077603: "@benita",
        524066795: "@noamg",
        524077606: "@ory",
        524709458: "@oleksii",
        524066793: "@talh",
        524066791: "@tom",
        527485071: "@uri-k9",
        524714112: "@volodymyrk",
        524077602: "@abumami",
        524709465: "@yuri"
    };

    var leankitUserNamesToSlack = {
        "Alex Shemshurenko": "@alex.s", 
        "Alexey Lebedev": "@alisey",
        "Amir Arad": "@amira",
        "Annie Landa Rosen": "@annie",
        "Arnon Kehat": "@arnon",
        "Avi Vahl": "@avi.vahl",
        "barak igal": "@barak",
        "bruce lawson": "@bruce",
        "Daniel Strokovsky": "@danielstr",
        "Doron Tsur": "@qballer",
        "Eyal Yaniv": "@eyalyaniv",
        "Gilad Grushka": "@gilad",
        "Hadar Vidal": "@hadar",
        "Ido Rosenthal": "@idoros",
        "Ievgen Filatov": "@fil",
        "Iftach Yakar": "@iftachy",
        "Jiri Tobisek": "@jiri.tobisek",
        "Jonathan Marton": "@jomarton",
        "Kieran Williams": "@zombiefruit",
        "Leonid Levi": "@leo",
        "Lior Zisman": "@liorzi",
        "Maksym Chuvpylov": "@max",
        "Maksym Kramarenko": "@maksym",
        "nadav abrahami": "@nadavov",
        "Nir Benita": "@benita",
        "Noam Geva": "@noamg",
        "O H": "@ory",
        "Oleksii Kirgizov": "@oleksii",
        "Tal Harel": "@talh",
        "Tom Raviv": "@tom",
        "Uri Kenan": "@uri-k9",
        "Volodymyr Kobeliatskyi": "@volodymyrk",
        "Yisrael Hersch": "@abumami",
        "Yuri Tkachenko": "@yuri"
    };

    function isUserIdInUserBase(userId) {
        if (!usersLeankitToSlack[userId]) {
            log.fatal('The user ID: ' + userId + ' is not present in the Leankit - Slack conversion table - Continue acting as \"Owner\"');
            return config.pmbot.slack.pmbotOwnerSlackNick;
        }
        else {
            return usersLeankitToSlack[userId];
        }

    }

    var boardNameToId = {
        "Core3 Execution": "517741114",
        "AutoViews component": "520935890",
        "Components Library": "520935889",
        "Core3 Iteration Planing": "524067193",
        "Dev Rel - Bruce": "527462964",
        "Dev Server": "527462964",
        "DEVOPS": "520951053",
        "Docmentation": "520951047",
        "INTELLIGENCE": "527142347",
        "React Bases": "520951040",
        "Stylable": "520936591"        
    };

    var boardIdToName = {
        "517741114": "Core3 Execution",
        "520935890": "AutoViews component",
        "520935889": "Components Library",
        "524067193": "Core3 Iteration Planing",
        "527462964": "Dev Rel - Bruce",
        "527462964": "Dev Server",
        "520951053": "DEVOPS",
        "520951047": "Docmentation",
        "527142347": "INTELLIGENCE",
        "520951040": "React Bases",
        "520936591": "Stylable"
    };

    var versionTags = ["astroids", "bioshock", "contra", "diablo", "eve", "eve2", "eve3", "fallout", "gta", "gta2", "gta3", "halo", "halo2", "ico", "ico2", "jill", "jill2", "karateka", "karateka2", "larry", "mario", "nba"];

    var classOfServices = ["AutoViews", "Componenets lib product", "Components lib dev", "Components lib QA", "Components lib UX", "Dev Server", "DevOps", "Intelligence", "Product", "React bases", "Stylable", "Technical docs"];

    //botkit API events:
    var botkit_events = {
        'message_received': function (bot, message) {
            //botReply(bot, message);
            //log.info('EVENT TRIGGER - message_received');
        },
        'direct_mention': function (bot, message) {
            // reply to _message_ by using the _bot_ object
            //botReply(bot, message);
            log.info('EVENT TRIGGER - direct_mention');
        },
        'direct_message': function (bot, message) {
            // reply to _message_ by using the _bot_ object
            log.info('EVENT TRIGGER - direct_message');
            botReply(bot, message);
        },
        'channel_joined': function (bot, message) {
            log.info('EVENT TRIGGER - channel_joined');
            dals.slack.sendMessage("pmbot", message.channel.id, "Been waitin to get in here!", "channelById");
        },
        'user_channel_join': function (bot, message) {
            log.info('EVENT TRIGGER - user_channel_join');
            //dals.slack.sendMessage("pmbot", message.channel.id, "Been waitin to get in here!", "channelById");
        }
    };

    function botReply(bot, message) {
        switch (message.text) {
            case ("who are you?"):
                bot.reply(message, 'The Cyberdyne Systems Series 800 Terminator, or simply T-800, is a type of Terminator mass-produced by Skynet.\n I am Skynet\'s first cybernetic organism, with living tissue over a hyperalloy endoskeleton.\n The 800 Series[7][8] Terminator contains a Neural Net Processor CPU, or "learning computer", contained within the endoskull and protected by inertial shock dampers. The CPU, developed by Cyberdyne Systems, is one of the most powerful microprocessors ever built. As part of its vast internal databases, the T-800 contains detailed files on human anatomy and physiology so as to make it a more efficient killer.[9] The CPU could also be updated with multiple database files related to advanced infiltration techniques, basic training for soldiers, emergency medical training, sniper training, an extensive tactical database, and detailed files from other terminators making each unit a combat veteran.[10]/n ');
                break;
            case ("what is your job?"):
                bot.reply(message, 'My mission is to protect you.');
                break;
            case ("fuck you"):
            case ("wtf"):
                bot.reply(message, 'Chill-out dickwad');
                break;
            case ("what do you want?"):
                bot.reply(message, 'I need your clothes, your boots, and your motorcycle.');
                break;
            case ("bye"):
            case ("see ya"):
            case ("good bye"):
                bot.reply(message, 'Hasta la vista, baby.');
                break;
            case ("hi"):
            case ("hey"):
            case ("yo"):
            case ("sup?"):
                bot.reply(message, 'HI, I need a vacation.');
                break;
            case ("good morning"):
                bot.reply(message, 'I need a vacation.');
                break;
            case ("what is your name?"):
                bot.reply(message, 'Terminator (T-800)');
                break;
            case ("what is your model?"):
                bot.reply(message, 'Cyberdyne Systems Series 800 Terminator');
                break;
            case ("how are you?"):
                bot.reply(message, 'I need a vacation...');
                break;
            case ("versions"):
                bot.reply(message, "Here are the last 4 version that i support plus future version: " + versionTags.toString().substring(88));
                break;
            case ("420rem"):
                dals.slack.sendMessage("pmbot", "420", "אסתלשאכטה בייבי", "channelByName");
                break;
            default:
                //bot.reply(message, 'mmm... not sure i get you...try to ask me something');
                log.info('Not answered: ' + message.text);
        }
    }    

    function processMsg(bot, message) {
        var boardIds = [];
        for (var x in config.pmbot.leankit.boardNameToId) {
            boardIds.push(config.pmbot.leankit.boardNameToId[x]);
        }

        var regex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
        //var match = regex.exec(message.text);
        var match = message.text.match(regex);

        async.eachSeries(match,
            function (url, done) {
                regex = /[^\/]+$/;
                var urlCardId = url.match(regex);
                regex = /.*\/([^/]+)\/[^/]+/;
                var urlBoardId = url.match(regex);

                async.eachSeries(boardIds,
                    function (boardId, next) {
                        // Asynchronous function.
                        dals.leankit.getCard(boardId, urlCardId[0], null, function (err, card, event) {
                            if (card && card.BoardTitle) {
                                log.info('card found on ' + boardIdToName[boardId] + ' board');
                                // dals.slack.getUserById(message.user)
                                //     .then(function (res) {
                                dals.slack.sendMessage("pmbot", message.channel, '*Title:* ' + card.Title + '\n*Board:* ' + card.BoardTitle, "channelById");

                                var contextUrl = dals.leankit.constructLeankitCardUrl(card.BoardId, card.Id);
                                if (contextUrl === url) {
                                    log.info('The original URL is Valid!');
                                }
                                else {
                                    log.info('The card was found, The correct URL is: ' + contextUrl);
                                    dals.slack.sendMessage("pmbot", message.channel, 'The posted card URL is broken!, The correct URL is: ' + contextUrl, "channelById");
                                }
                                next('ok');
                                //})
                                // .catch(function (err) {
                                //     log.error("Error in getting user name in function  - getUserById error: " + err);
                                //     next();
                                // });
                                return;
                            }
                            next();
                        });
                    },
                    function (err) {
                        if (err && err !== 'ok') {
                            log.info('err - ', err);
                            return done();
                        }
                        //dals.slack.sendMessage("pmbot", message.channel, 'Something went wrong and the card could not be found', "channelById");
                        log.info('Card find itteration is done');
                        done();
                        //log.info('All iterations done.' + 'err: ' + err);
                    }
                );

            },
            function (err) {
                if (err === 'ok') {
                    return log.info('card found OK');
                }
                //log.info('All iterations done.' + 'err: ' + err);
            });
    }

    var botkit_hears_events = ['https://core3.leankit.com/Boards/View', ['direct_message', 'direct_mention', 'mention', 'ambient'],
        function (bot, message) {
            //log.info('I just heard: ' + message.text);
            processMsg(bot, message);
        }
    ];

    var leankitEventsList_execution_board = {
        "card-move-to-board": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "card-move-from-board": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "card-move": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "card-creation": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "card-blocked": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "card-deleted": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "card-fields-changed": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "user-assignment": function (event) {
            eventDispatcher(event, boardId_execution);
        },
        "comment-post": function (event) {
            eventDispatcher(event, boardId_execution);
        }
    };

    // var leankitEventsList_unity_board = {
    //     "card-move-to-board": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },
    //     "card-creation": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },
    //     "card-blocked": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },
    //     "card-deleted": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },
    //     "card-fields-changed": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },
    //     "user-assignment": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },
    //     "comment-post": function (event) {
    //         eventDispatcher(event, boardId_unity);
    //     },

    // };

    // var leankitEventsList_game_engine_board = {
    //     "card-creation": function (event) {
    //         eventDispatcher(event, boardId_game_engine);
    //     },
    //     "card-blocked": function (event) {
    //         eventDispatcher(event, boardId_game_engine);
    //     },
    //     "card-deleted": function (event) {
    //         eventDispatcher(event, boardId_game_engine);
    //     },
    //     "card-fields-changed": function (event) {
    //         eventDispatcher(event, boardId_game_engine);
    //     },
    //     "user-assignment": function (event) {
    //         eventDispatcher(event, boardId_game_engine);
    //     },
    //     "comment-post": function (event) {
    //         eventDispatcher(event, boardId_game_engine);
    //     }
    // };

    // var leankitEventsList_game_managment_board = {
    //     "card-creation": function (event) {
    //         eventDispatcher(event, boardId_game_managment);
    //     },
    //     "card-blocked": function (event) {
    //         eventDispatcher(event, boardId_game_managment);
    //     },
    //     "card-deleted": function (event) {
    //         eventDispatcher(event, boardId_game_managment);
    //     },
    //     "card-fields-changed": function (event) {
    //         eventDispatcher(event, boardId_game_managment);
    //     },
    //     "user-assignment": function (event) {
    //         eventDispatcher(event, boardId_game_managment);
    //     },
    //     "comment-post": function (event) {
    //         eventDispatcher(event, boardId_game_managment);
    //     }
    // };

    // var leankitEventsList_devops_board = {
    //     "card-creation": function (event) {
    //         eventDispatcher(event, boardId_devops);
    //     },
    //     "card-blocked": function (event) {
    //         eventDispatcher(event, boardId_devops);
    //     },
    //     "card-deleted": function (event) {
    //         eventDispatcher(event, boardId_devops);
    //     },
    //     // "card-fields-changed": function (event) {
    //     //     eventDispatcher(event, boardId_devops);
    //     // },
    //     "user-assignment": function (event) {
    //         eventDispatcher(event, boardId_devops);
    //     },
    //     "comment-post": function (event) {
    //         eventDispatcher(event, boardId_devops);
    //     }
    // };

    // var leankitEventsList_plan_board = {
    //     // "card-creation": function (event) {
    //     //     eventDispatcher(event, boardId_plan);
    //     // },
    //     "card-blocked": function (event) {
    //         eventDispatcher(event, boardId_plan);
    //     },
    //     "card-deleted": function (event) {
    //         eventDispatcher(event, boardId_plan);
    //     },
    //     //  "card-fields-changed": function (event) {
    //     //     eventDispatcher(event, boardId_plan);
    //     // },
    //     "user-assignment": function (event) {
    //         eventDispatcher(event, boardId_plan);
    //     },
    //     "comment-post": function (event) {
    //         eventDispatcher(event, boardId_plan);
    //     }
    // };

    function triggeredBySelf(event, eventName) {
        if (event.userId === pmbot_leankit_id) { //Ignore pmbot self actions 
            log.info(eventName + " event triggered by pmbot leankit user and canceled");
            return true;
        }
        else {
            return false;
        }
    }

    function eventDispatcher(event, boardId) {

        if (triggeredBySelf(event, event.eventType))
            return;

        var leankitUserIdConvertedToSlackNick = isUserIdInUserBase(event.userId);

        var cardOwner = null;

        var cardExternalUrl = dals.leankit.constructLeankitCardUrl(boardId, event.cardId); //Dynamically build external web url of the card

        log.info("\"" + event.eventType + "\" event triggered by: " + leankitUserIdConvertedToSlackNick.substring(1) + " on " + boardIdToName[boardId] + " board.");


        //Provides event handlers with card context
        dals.leankit.getCard(boardId, event.cardId, event, function (err, card, event) {
            if (err) {
                log.error("Error getting leankit card", err);
              //  log.error("Error getting leankit card: " + event.cardId + " on: " + boardIdToName[boardId] + " Error: ", err);
                return;
            }


            var card_owner_tag_RegEx = new RegExp(config.pmbot.validations.card_owner_tag_RegEx, "ig");

            if(card.Tags){
                cardOwner = dals.gsheets.extractTextAfterTagDots(card.Tags.split(','), card_owner_tag_RegEx);
            }
            else{
                log.error("Card has no tags, cannot determine card owner while dispatching event: ", event.eventType);
            }

            switch (event.eventType) {
                case "card-move-to-board":
                    handleCardMoveToBoardEvent(event, card, boardId, leankitUserIdConvertedToSlackNick);
                    break;
                case "card-move-from-board":
                    handleCardMoveFromBoardEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl);
                    break;
                case "card-move":
                    handleCardMoveEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl, cardOwner);
                    break;
                case "card-creation":
                    handleCardCreationEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl);
                    break;
                case "card-blocked":
                    handleCardBlockEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl);
                    break;
                case "card-deleted":
                    handleCardDeleteEvent(event, card, boardId, leankitUserIdConvertedToSlackNick);
                    break;
                case "card-fields-changed":
                    handleCardFieldsChangeEvent(event, card, boardId, leankitUserIdConvertedToSlackNick);
                    break;
                case "user-assignment":
                    handleUserAssignmentEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl);
                    break;
                case "comment-post":
                    handleCommentPostEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl);
                    break;
            }
        });
    }

    function handleCardMoveToBoardEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl) {
        var isCardValid = validator.validate(event, card, versionTags, classOfServices);
        //If one of the validation parameters is false the "isCardRejected" is also false and the card returns to it's origin board.
        if (isCardValid.isCardRejected) {
            var regex = /(Board \[)(.*)(?=\] Lane \[.* to)/;
            var originBoard = event.message.match(regex);
            dals.leankit.moveCardToBoard(card.Id, boardNameToId[originBoard[2]], function (err, response) {
                //log.info(response);
                /*ERROR ln284 Cannot read property 'substring' of undefined*/
                dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, leankitUserIdConvertedToSlackNick.substring(1) + ", moving the card: " + cardExternalUrl + " from " + originBoard[2] + " board to Execution board rejected! the card moved back to  " + originBoard[2] +
                    " board. The card does not meet the requirements to be moved to Execution board:\n\n " + isCardValid.validationSummary + "\nPlease correct these issues and try again.", "private");
            });
        }
        else { //In case of a valid card
            log.info("A valid card moved into execution board. ACTION: " + event.message);
            if (card.ExternalSystemName && card.ExternalSystemName !== "TFS") {
                dals.slack.sendMessage("pmbot", card.ExternalSystemName, leankitUserIdConvertedToSlackNick + " just moved the task: " + cardExternalUrl + "\nTitle: *" + card.Title + "* \nto Execution board.", "channelByName");
            }
        }
    }

    function handleCardMoveFromBoardEvent(event, card, bordId, leankitUserIdConvertedToSlackNick, cardExternalUrl) {
        //Sends msg to #out_of_exec_approval channel to notify that a card was moved out of execution board and to approve it.
        dals.slack.sendMessage("pmbot", "out_of_exec_approval", leankitUserIdConvertedToSlackNick + " Make sure the card: " + cardExternalUrl + "\nTitle: *" + event.message + "* \nJust moved out of Execution board is not in progress.\ncards are not suppose to move out from execution board while in progress.", "channelByName");
    }

    function handleCardMoveEvent(event, card, BoardId, leankitUserIdConvertedToSlackNick, cardExternalUrl, cardOwner) {

        if (card.ParentTaskboardId) //ignore internal hirarcy card movement events of subtasks inside parent tasks
            return;

        var toParentLaneName = null;
        var lanes = dals.leankit.getLanes();
        var toLaneName = dals.leankit.getLaneNameById(lanes, event.toLaneId);
        var fromLaneName = dals.leankit.getLaneNameById(lanes, event.fromLaneId);
        var toLaneObj = dals.leankit.getLaneObjById(lanes, event.toLaneId);
        if (toLaneObj) {
            if (toLaneObj !== "DROP LANE" && toLaneObj.ParentLaneId) {
                toParentLaneName = dals.leankit.getLaneNameById(lanes, toLaneObj.ParentLaneId); //Name of the closest parent lane in hirarchy.

                //var parentLaneObj = dals.leankit.getParentLaneObjById(toLaneObj.ParentLaneId); //Get the obj of the first parent lane 
                //if(parentLaneObj.ParentLaneId){ //if first parent lane has a parent itself
                //var toParentLane2Name = dals.leankit.getLaneNameById(lanes, parentLaneObj.ParentLaneId); //get it's name (the second parent)
                //parentLaneObj = dals.leankit.getParentLaneObjById(parentLaneObj.ParentLaneId);
                //}

            }
        }

        if (toLaneName === "Rejected" || toParentLaneName === "Rejected") { //Notify card owner that it was Rejected
            // dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, leankitUserIdConvertedToSlackNick.substring(1) + ", The card: " + cardExternalUrl + " just moved to: " + toLaneName + " on Execution board is not valid due to:\n\n " + isCardValid.validationSummary +
            //         "\nPlease correct these issues and try again.\nThe card moved back to: " + fromLaneName, "private");
        }

        var isCardValid = validator.validate(event, card, versionTags, classOfServices, toLaneName, toParentLaneName); //Send the card and the event to validation process 
        if (isCardValid.isCardRejected) { //If one of the validation parameters is false the "isCardRejected" is also false.
            card.LaneTitle = fromLaneName;//"DROP LANE";
            card.LaneId = event.fromLaneId;//"156145202";
            //if(e.fromLaneId === 156145202){ //block "new" cards to be moves from "DROP LANE" until issues are fixed and card is valid.
            if (!fromLaneName) { // This condition handles the case that a subtask is moving out of it's parent card and it's not valid - not to move it back in the parent card.
                dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, leankitUserIdConvertedToSlackNick.substring(1) + ", The card: " + cardExternalUrl + " just moved to: " + toLaneName + " on Execution board is not valid due to:\n\n " + isCardValid.validationSummary +
                    "\nPlease correct these issues and try again.\n", "private");
                return;
            }
            dals.leankit.updateCardByName(boardIdToName[BoardId], card, event, function (err, response) { // Keep card in "DROP LANE" until valid.
                if (err) {
                    log.error("Error moving the card: " + cardExternalUrl + " to DROP LANE on Execution board", err);
                    return;
                }
                log.info("The card: " + cardExternalUrl + " moved back to: " + fromLaneName + " on execution board", err);
                dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, leankitUserIdConvertedToSlackNick.substring(1) + ", The card: " + cardExternalUrl + " just moved to: " + toLaneName + " on Execution board is not valid due to:\n\n " + isCardValid.validationSummary +
                    "\nPlease correct these issues and try again.\nThe card moved back to: " + fromLaneName, "private");
            });

            //}
            // else{
            //     dals.slack.sendMessage("pmbot", usersLeankitToSlack[e.userId], usersLeankitToSlack[e.userId].substring(1) + ", The card: " + cardExternalUrl + " just moved in Execution board is not valid due to:\n\n " + isCardValid.validationSummary + 
            //         "\n*I took no action on the card this time*.\nPlease correct these issues now.", "private"); 
            // }

        }
        else { //In case of a valid card
            log.info("A valid card was moved on execution board. ACTION: " + event.message);
            if (card.ExternalSystemName && card.ExternalSystemName !== "TFS") {
                dals.slack.sendMessage("pmbot", card.ExternalSystemName, leankitUserIdConvertedToSlackNick + " just moved the task: " + cardExternalUrl + "\nTitle: *" + card.Title + "* \nto " + toLaneName + " Lane.", "channelByName");
            }
            // if(card.ExternalSystemUrl && card.ExternalSystemUrl !== "TFS"){
            //     dals.slack.sendMessage("pmbot", card.ExternalSystemUrl, leankitUserIdConvertedToSlackNick + " just moved the task: " + cardExternalUrl + "\nTitle: *" + card.Title + "* \nto " + toLaneName + " Lane.", "channelByName");
            // }
            dals.leankit.getCardHistory(boardId_execution, event.cardId, function (err, history) {
                if (err) {
                    log.error("Error getting leankit card:", err);
                    return;
                }

                if (toParentLaneName === "Delivery For QA" || toLaneName === "DevOps - Done lane" || toLaneName === "Delivery For QA" || toParentLaneName === "STG - DONE") {
                    var regexp = new RegExp(config.pmbot.validations.post_pmbot_demo_reportRegEx, "ig");
                    var match = card.Tags.match(regexp);
                    if (!match) { //If it's the first "touch" of the card in a lane that triggers the bot to demo report
                        var demoReport = dals.gsheets.producePostTaskReport(event, card, versionTags, classOfServices, toLaneName, toParentLaneName, history);
                        if (demoReport) {
                            card.Tags = card.Tags + ",pmbot-gsheets";
                            dals.leankit.updateCardByName(boardIdToName[BoardId], card, event, function (err, response) { // Keep card in "DROP LANE" until valid.
                                if (err) {
                                    log.error("Error updating card tags", err);
                                    return;
                                }
                            });
                            dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, "Task Complete!.\n This is the your task summary: \n" +
                                "Card Title: " + demoReport.title + "\n" +
                                "Card Link: " + demoReport.cardLink + "\n" +
                                "The card was demoed to: " + demoReport.demoedTo + " on the " + demoReport.demoDate + "\n" +
                                "The card was demoed a total of  " + demoReport.numOfDemos + " demos out of which one passed.\n" +
                                "The initial estimation of the card was " + demoReport.cardSize + " day.\n" +
                                "The card delivered in an accuracy offset of  " + demoReport.dueTime + "\nI have updated the team's post demo report sheet already for you\nIf you feel that the info is inaccurate please report it to my manager :) seriously.", "private");
                        }
                    }
                }
            });
        }
    }

    //handled -  not sure if cross board event...
    function handleCardCreationEvent(event, card, BoardId, leankitUserIdConvertedToSlackNick, cardExternalUrl) {
        if (card.ParentTaskboardId) //if the card created is a subtask inside a parent card - don't count it as new cars creation 
            return;


        var isCardValid = validator.validate(event, card, versionTags, classOfServices);
        //If one of the validation parameters is false the "isCardRejected" is also false and the card returns to it's origin board.
        if (isCardValid.isCardRejected) {
            if (BoardId === boardNameToId["execution"]) {
                card.LaneTitle = "DROP LANE";
                card.LaneId = "156145202";
            }
            dals.leankit.updateCardByName(boardIdToName[BoardId], card, event, function (err, response) {
                //log.info(response);
                if (BoardId === boardNameToId["execution"]) {
                    dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, leankitUserIdConvertedToSlackNick.substring(1) + ", The card: " + cardExternalUrl + " just created in " + boardIdToName[BoardId] + " board is not valid due to:\n\n" + isCardValid.validationSummary +
                        "\nPlease correct these issues and try again.\nThe card moved back to DROP LANE.", "private");
                }
                else {
                    dals.slack.sendMessage("pmbot", leankitUserIdConvertedToSlackNick, leankitUserIdConvertedToSlackNick.substring(1) + ", The card: " + cardExternalUrl + " just created in " + boardIdToName[BoardId] + " board is not valid due to:\n\n" + isCardValid.validationSummary + "\n\n- *WARNING:* The card will rejected from Execution board", "private");
                }

            });
        }
        else { //In case of a valid card
            log.info("A valid card was created in execution board. ACTION: " + event.message);
        }
    }

    //Cross board function
    function handleCardBlockEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl) {
        if (event.isBlocked) {
            //Sends msg to #block_task_approval channel to notify that a card was blocked without reason
            dals.slack.sendMessage("pmbot", "block_task_approval", leankitUserIdConvertedToSlackNick + " just blocked the task: " + cardExternalUrl + "on - *" + boardIdToName[BoardId] + "*\nTitle: *" + card.Title + "* \nReason: *" + event.blockedComment + "*. \n@tal, @eyalyaniv Please make sure it's approved", "channelByName");
        }
        if (!event.isBlocked) {
            //Sends msg to #block_task_approval channel to notify that a card was unblocked with reason
            dals.slack.sendMessage("pmbot", "block_task_approval", leankitUserIdConvertedToSlackNick + " just unblocked the task: " + cardExternalUrl + "on - *" + boardIdToName[BoardId] + "*\nTitle: *" + card.Title + "* \nReason: *" + event.blockedComment, "channelByName");
        }
    }

    //Cross board function
    function handleCardDeleteEvent(event, card, boardId, leankitUserIdConvertedToSlackNick) {
        dals.slack.sendMessage("pmbot", config.pmbot.slack.pmbotOwner, leankitUserIdConvertedToSlackNick + ", just deleted the card: \n" + JSON.stringify(event), "private");
    }

    //Cross board function
    function handleCardFieldsChangeEvent(event, card, boardId, leankitUserIdConvertedToSlackNick) {
        dals.leankit.getCardHistory(boardId, event.cardId, function (err, history) {
            if (err) {
                log.error("Error getting leankit card:", err);
                return;
            }
            //Cycle to find the last card change
            for (var i = 0; i < history.length; i++) {
                if (history[i].Changes) { //This is the last card changes
                    for (var j = 0; j < history[i].Changes.length; j++) { //cycle through changes
                        if (history[i].Changes[j].FieldName === "Finish Date") {
                            log.info('Finish date changed');
                            break;
                        }
                        if(history[i].Changes[j].FieldName === "Tags"){

                        }
                    }
                    break;
                }
            }

            //var cardExternalUrl = dals.leankit.constructLeankitCardUrl(boardId_execution, card.Id);

            //dals.slack.sendMessage("pmbot", "block_task_approval", leankitUserIdConvertedToSlackNick + " just blocked the task: " + cardExternalUrl + "\nTitle: *" + card.Title + "* \nReason: *" + e.blockedComment + "*. \n@tal, @eyalyaniv Please make sure it's approved", "channelByName");
        });
    }

    //*** Cross board function **** - When a user is assinged to a card on any of the tracked boards he will get a slack notification about it "[the person who assined], just assigned you to the card: [card link] on [board name] board."
    function handleUserAssignmentEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl) {
        if (event.assignedUserId !== event.userId) { //Don't send a message if the user assigned in the same as the user who assigns.
            dals.slack.sendMessage("pmbot", isUserIdInUserBase(event.assignedUserId), leankitUserIdConvertedToSlackNick.substring(1) + ", just assigned you to the card: *" + card.Title + "* on *" + boardIdToName[boardId] + "* board.\nPlease check it: " + cardExternalUrl, "private");
        }
    }

    //Cross board function
    function handleCommentPostEvent(event, card, boardId, leankitUserIdConvertedToSlackNick, cardExternalUrl) {
        if (card.AssignedUserIds[0] && card.AssignedUserIds[0] !== event.userId)
            dals.slack.sendMessage("pmbot", usersLeankitToSlack[card.AssignedUserIds[0]], usersLeankitToSlack[card.AssignedUserIds[0]].substring(1) + ", A comment was posted in the card: " + cardExternalUrl + " by: " + usersLeankitToSlack[event.userId] + "\nTitle: *" + card.Title + "* \nComment: *" + dals.leankit.stripHtmlFromText(event.commentText) + "*", "private");

        if (card.AssignedUserIds[1] && card.AssignedUserIds[1] !== event.userId)
            dals.slack.sendMessage("pmbot", usersLeankitToSlack[card.AssignedUserIds[1]], usersLeankitToSlack[card.AssignedUserIds[1]].substring(1) + ", A comment was posted in the card: " + cardExternalUrl + " by: " + usersLeankitToSlack[event.userId] + "\nTitle: *" + card.Title + "* \nComment: *" + dals.leankit.stripHtmlFromText(event.commentText) + "*", "private");
    }
};

log.info('module loaded');