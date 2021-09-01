const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const { SqlConfig } = require('./sqlconfig');

class Conversations {
    constructor() {
        this.references = {};
    
        const connection = new Connection(SqlConfig.getConfig());        
        connection.on('connect', err => {
            err ? console.log(err) : executeStatement();
        });

        const query = 'SELECT * from ConversationReferences';
        const executeStatement = () => {
            const request = new Request(query, (err, rowCount) => {
              err ? console.log(err) : console.log(rowCount);
            });
          
            request.on('row', columns => {
                console.log(columns[0].value);
                this.references[columns[0].value] = JSON.parse(columns[1].value);
            });
          
            connection.execSql(request);
        };
    }
}

module.exports.Conversations = Conversations;
