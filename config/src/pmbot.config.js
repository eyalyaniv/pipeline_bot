module.exports = {
  app: {
    name: "pmbot",
    port: 3000
  },
  pmbot: {
    leankit: {
      accountName: "https://core3.leankit.com/",
      email: "pipelinebot@gmail.com",
      password: "pipelinebot2leankit",
      pollInterval: 10, //Seconds
      pmbot_leankit_id: 530521792,
      boardNameToId: {
        "Autoviews - Kiev": "578564059",
        "Components Factory": "579725598",
        "Dev Server": "609467370",
        "Dev Velocity": "588655295",
        "Stylable": "580802753",
        "game engine": "195208668",
        "Style-Panel": "580802756"
      }
    },
    slack:{
            pmbotOwner: "U69B1LVV1",
            pmbotOwnerSlackNick: "@eyalyaniv",
            slackInt: true, 
            isTestMode: false,
            webhookUri:"https://hooks.slack.com/services/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",
            slackApiToken: "xoxb-229557440388-vtF4Pgcwt2nzytFoOe3yrLQU",
            slackTestApiToken: "",
            pmbot_leankit_id: 530521792
    },
    gsheets:{
            gsheetsInt: true,
            gms_pdr_script_url: "https://script.google.com/macros/s/AKfycbzcvQTbcG4G5ndDydB2y9_wAAi-Cnpov4Iif44eg_tLrnqXqRT-/exec",
            ge_pdr_script_url: "https://script.google.com/a/macros/7elementsstudios.com/s/AKfycbyY_USM0MnDkF-CZzcPj7UMWR05o-l5WKY806AvviT_PHJL8eB-/exec",
            client_pdr_script_url: "https://script.google.com/macros/s/AKfycbzhwfvUC-zCq4iLXuNjUCSDxmwzG_FmF12aKOYIuV7AmEV6Ogg/exec",
            devops_pdr_script_url: "https://script.google.com/a/macros/7elementsstudios.com/s/AKfycbzf2cLNWSHOlWJALue-HF9_l7rdaL7byGmA72y7JUZ0e51owZs/exec"
    },
    validations:{
      card_owner_tag_RegEx: "owner:",
      unity_codeReviewTagRegEx: "cr:",
      unity_demoedTagRegEx: "demo-pass:",
      unity_demoFailTagRegEx: "demo-fail:",
      unity_notTestedByOwnerTagRegEx: "Build #",
      game_managment_codeReviewTagRegEx: "cr:",
      game_managment_demoedTagRegEx: "demo-pass:",
      game_managment_demoFailTagRegEx: "demo-fail:",
      game_engine_codeReviewTagRegEx: "cr:",
      game_engine_demoedTagRegEx: "demo-pass:",
      game_engine_demoFailTagRegEx: "demo-fail:",
      devops_codeReviewTagRegEx: "cr:",
      devops_demoedTagRegEx: "demo-pass:",
      devops_demoFailTagRegEx: "demo-fail:",
      post_pmbot_demo_reportRegEx: "pmbot-gsheets"
    }
  },
  cloudWatch: {
    enable: false,
    interval: 60000,
    region: "us-east-1",
    accessKeyId: "AKIAI7AHABGLCKI44RAA",
    secretAccessKey: "bvuXnqlWaX2n7XHnUJL0ivj8O2jdSb8X6zUH8vId"
  },
  loggers: {
    replaceConsole: true,
    levels: {
      "[all]": "INFO"
    },
    appenders: [
      {
        type: "console",
        layout: {
          type: "pattern",
          pattern: "[%d{ISO8601}] [%p] %c [%m]"
        }
      },
      {
        type: "file",
        layout: {
          type: "pattern",
          pattern: "[%d{ISO8601}] [%p] %c [%m]"
        },
        absolute: true,
        filename: "/var/log/7es/7es-pmb.log",
        maxLogSize: 10240000,
        backups: 1
      }
    ]
  }
};
