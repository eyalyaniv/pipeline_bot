var log = require('osg-logger').of('dal/slack'),
    Slack = require('slack-node'),
    Botkit = require('botkit'),
    SlackBot = require('slackbots')
    ;

module.exports = function (config, ready) {

    var api = {
        generateEvents: generateEvents,
        generateHearsEvents: generateHearsEvents,
        sendMessage: sendMessage,
        getSlackbots_bot_obj: getSlackbots_bot_obj,
        getUserById: getUserById,
        getChannelById: getChannelById
    };

    //Slack on/off
    var slackInt = config.pmbot.slack.slackInt;
    var isTestMode = config.pmbot.slack.isTestMode;
    //Slack incoming webhook URL
    //var webhookUri = config.pmbot.slack.webhookUri;
    //Slack Bot API token (secret!)
    var slackApiToken = null;
    if(isTestMode)
        slackApiToken = config.pmbot.slack.slackTestApiToken;
    else
        slackApiToken = config.pmbot.slack.slackApiToken;
    //var slack = new Slack();
    //slack.setWebhook(webhookUri);

    // <<<<<<<<<<<   Initiation of "botkit" framework >>>>>>>>>>>>>>>> //
    var controller = Botkit.slackbot();
    var botkit_bot = controller.spawn({
        token: slackApiToken
    });

    // <<<<<<<<<<<   Initiation of "slackbots" framework >>>>>>>>>>>>>>>> //
    var slackbots_bot = new SlackBot({
        token: slackApiToken,
        name: 'pmbot'
    });

    botkit_bot.startRTM(function (err, bot, payload) {
        if (err) {
            return ready('botkit framework Could not connect to Slack');
        }
        ready(null, api);
    });

    function generateEvents(eventList) {
        for (var e in eventList) {
            controller.on(e, eventList[e]);
        }
    }

    function generateHearsEvents(eventList){
        //for (var e in eventList) {
            controller.hears(eventList[0], eventList[1], eventList[2]);
        //}
    }

    function getSlackbots_bot_obj(){
        return slackbots_bot;
    }

    function getUserById(id){
        return slackbots_bot.getUserById(id);
    }


    function getChannelById(id){
        return slackbots_bot.getChannelById(id);
    }


    function sendMessage(sender, target, msg, msgType) {
        if (slackInt) {
            switch (msgType) {
                case "private":
                    slackbots_bot.getUserId(target.substring(1)).then(function (userId) {
                        botkit_bot.say(
                            {
                                text: msg,
                                channel: userId, // a valid slack channel, group, mpim, or im ID
                                parse: "full",
                                link_names: 1,
                                attachments: [] //This is a workaround to force sending the msg via slack postMessage and not through RTM service. In order for names and channels to be linked.
                            }
                        );
                    })
                    .catch(function(err){
                             log.error("Error in getting user id in function  - getUserId error: " + err);   
                             next();
                            }); 
                    break;

                case "channelByName":
                    slackbots_bot.getChannelId(target).then(function (channelId) {
                        botkit_bot.say(
                            {
                                text: msg,
                                channel: channelId, // a valid slack channel, group, mpim, or im ID
                                parse: "full",
                                link_names: 1,
                                attachments: [] //This is a workaround to force sending the msg via slack postMessage and not through RTM service. In order for names and channels to be linked.
                            }
                        );
                    })
                    .catch(function(err){
                             log.error("Error in case channelByName while getting channel id in function  - getChannelId error: " + err);   
                             next();
                            }); 
                    break;
                case "channelById":
                        botkit_bot.say(
                            {
                                text: msg,
                                channel: target, // a valid slack channel, group, mpim, or im ID
                                parse: "full",
                                link_names: 1,
                                attachments: [] //This is a workaround to force sending the msg via slack postMessage and not through RTM service. In order for names and channels to be linked.
                            }
                        );
                    break;
            }
        }
        //Send msg to bot owner defined in the config
        if(msgType === "channelById"){
            getChannelById(target).then(function(res){
                botkit_bot.say(
                    {
                        text: "*Sent to: " + res.name + "*\n" + msg,
                        channel: config.pmbot.slack.pmbotOwner, // The owner of the pmbot 
                        parse: "full",
                        link_names: 1,
                        attachments: [] //This is a workaround to force sending the msg via slack postMessage and not through RTM service. In order for names and channels to be linked.
                    }
                );
            })
            .catch(function(err){
                             log.error("Error in case getting channel id in function  - getChannelById error: " + err);   
                             next();
                            }); 
        }
        else{
            botkit_bot.say(
                {
                    text: "*Sent to: " + target + "*\n" + msg,
                    channel: config.pmbot.slack.pmbotOwner, // The owner of the pmbot 
                    parse: "full",
                    link_names: 1,
                    attachments: [] //This is a workaround to force sending the msg via slack postMessage and not through RTM service. In order for names and channels to be linked.
                }
            );
        }
    }

};


log.info('module loaded');