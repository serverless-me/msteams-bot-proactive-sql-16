// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, TurnContext, TeamsInfo } = require('botbuilder');

const { SqlConfig } = require('./sqlconfig');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;

class ProactiveBot extends ActivityHandler {
    constructor(conversationReferences) {
        super();

        // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
        this.conversationReferences = conversationReferences;

        this.onConversationUpdate(async (context, next) => {
            //this.addConversationReference(context.activity);

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeMessage = 'Welcome to the Proactive Bot sample.  Navigate to http://localhost:3978/api/notify to proactively message everyone who has previously messaged this bot.';
                    await context.sendActivity(welcomeMessage);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMessage(async (context, next) => {
            const conversationReference = TurnContext.getConversationReference(context.activity);
            this.addConversationReference(conversationReference);
            TeamsInfo.getMember(context, context.activity.from.aadObjectId).then((member) => {
                this.addCustomerInfoSql(member, conversationReference);
            });

            // Echo back what the user said
            // TODO: Save the text as a configuration in SQL CustomerInfo
            await context.sendActivity(`You sent '${ context.activity.text }'. You will receive notifications now.`);
            await next();
        });
    }

    addConversationReference(conversationReference) {
        this.conversationReferences[conversationReference.conversation.id] = conversationReference;
        this.addConversationReferenceSql(conversationReference);
    }

    addConversationReferenceSql(conversationReference) {
        this.conversationReferences[conversationReference.conversation.id] = conversationReference;

        const connection = new Connection(SqlConfig.getConfig());        
        connection.on('connect', err => {
            err ? console.log(err) : executeStatement();
        });

        const query = 'INSERT INTO DBO.ConversationReferences VALUES (\'' + conversationReference.conversation.id + '\', \'' + JSON.stringify(conversationReference) + '\')';
        const executeStatement = () => {
            const request = new Request(query, (err, rowCount) => {
              err ? console.log(err) : console.log(rowCount);
            });
          
            request.on('row', columns => {
                console.log("done");
            });
          
            connection.execSql(request);
        };
    }

    addCustomerInfoSql(member, conversationReference) {
        const connection = new Connection(SqlConfig.getConfig());

        connection.on('connect', err => {
            err ? console.log(err) : executeStatement();
        });

        const query = 'INSERT INTO DBO.CustomerInfo VALUES (\'' + conversationReference.conversation.id + '\', \'' + member.name + '\', \'' + member.email + '\', \'' + member.tenantId + '\')';
        const executeStatement = () => {
            const request = new Request(query, (err, rowCount) => {
              err ? console.log(err) : console.log(rowCount);
            });
          
            request.on('row', columns => {
                console.log("done");
            });
          
            connection.execSql(request);
        };
    }
}

module.exports.ProactiveBot = ProactiveBot;
