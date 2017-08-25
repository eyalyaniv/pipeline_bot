module.exports = {
  app: {
    name: "pmbot",
    port: 3000
  },
  pmbot: {
    leankit: {
      accountName: "https://egames.leankit.com",
      email: "pmbot@7egames.com",
      password: "pmbot2leankit",
      pollInterval: 10, //Seconds
      boardId_execution: 156116725, //Execution board Id
      pmbot_leankit_id: 382665896,
      boardNameToId: {
                plan: "213572592",
                execution: "156116725",
                bi: "158334672",
                marketing: "162843235",
                devops: "195207449",
                "game engine": "195208668",
                unity: "195209674",
                qa: "260684238",
                rules: "295704070",
                community: "297531259",
                art: "333892671",
                "product planning": "339642420",
                "game managment": "344471340"
      }
    },
    slack:{
            pmbotOwner: "U03H0P5RC",
            pmbotOwnerSlackNick: "@eyalyaniv",
            slackInt: true, 
            isTestMode: false,
            webhookUri:"https://hooks.slack.com/services/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",
            slackApiToken: "xoxb-74755017729-LD8Y5277znGrHLhQfpyW0fx1",
            slackTestApiToken: "xoxb-79125359088-KjVeBAQ3WIuwPsA609B3ZJP9",
            pmbot_leankit_id: 382665896
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
