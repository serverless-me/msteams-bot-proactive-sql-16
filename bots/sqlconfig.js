class SqlConfig {

    static getConfig() {
        const config = {
            server: '<< YOUR DOMAIN >>.database.windows.net',
            authentication: {
                type: 'default',
                options:{                    
                    userName: '<< USERNAME >>',
                    password: '<< PASSWORD >>!'
                }
            },
            options: {
                database: '<< YOUR DATABASE NAME >>',
                encrypt: true
            }
        }; 

        return config;
    }
}  

module.exports.SqlConfig = SqlConfig;