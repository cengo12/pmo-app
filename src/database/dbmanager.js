const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('./src/database/sampledata.db');

exports.insertProject = (newProject) => {
    db.prepare(`INSERT INTO Projects (ProjectName, ProjectManager, StartDate, FinishDate) VALUES (?,?,?,?);`)
        .run(
            newProject.projectName,
            newProject.projectManager,
            newProject.projectStartDate,
            newProject.projectEndDate
            );

    db.close();
}

exports.insertMembers = (newProject) => {

}

