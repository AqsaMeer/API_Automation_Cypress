// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
// }

const mysql = require('mysql')
const { MongoClient } = require('mongodb');
// increase the limit
function queryDb(query, config) {
  // creates a new mysql connection using credentials from cypress.json env's
  const connection = mysql.createConnection(config.env)
  // start connection to db
  connection.connect()
  // exec query + disconnect to db as a Promise
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error)
      else {
        connection.end()
        return resolve(results)
      }
    })
  })
}




function deleteData({ URL, document, collection, filter }) {
  let filterObj = JSON.parse(JSON.stringify(filter))
  return new Promise((resolve, reject) => {
    MongoClient.connect(URL, { useUnifiedTopology: true }, (err, client) => {
      client.db(document).collection(collection).deleteMany(filterObj, (error, result) => {
        console.log(`${result.deletedCount} document(s) was/were deleted.`);
        if (error) reject(error)
        else {
          client.close()
        }
      })
    })
  })

}



module.exports = (on, config) => {
  require('cypress-mochawesome-reporter/plugin')(on);
  on('task', {
    queryDb: query => {
      return queryDb(query, config)
    },
    deleteDataMongo({ URL, document, collection, filter }, timeout = 2000) {
      return new Promise((resolve) => {
        deleteData({ URL, document, collection, filter })
        setTimeout(() => resolve(null), timeout)
      })
    }
  })
}




