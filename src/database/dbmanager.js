const betterSqlite3 = require('better-sqlite3');


exports.putName = (name) => {
    const db = betterSqlite3('./src/database/sampledata.db');
    db.prepare(`INSERT INTO Projects (ProjectName) VALUES (?);`).run(name);
    console.log('finally');
    db.close();
}


