const betterSqlite3 = require('better-sqlite3');

exports.insertProject = (newProject) => {
    const db = betterSqlite3('./src/database/sampledata.db');

    db.prepare(`INSERT INTO Projects (ProjectName, ProjectManager, StartDate, FinishDate) VALUES (?,?,?,?);`)
        .run(
            newProject.projectName,
            newProject.projectManager,
            newProject.projectStartDate,
            newProject.projectEndDate
            );

    for (const member of newProject.projectMembers) {
        db.prepare(`INSERT INTO Employees (RegistrationNumber, FullName) VALUES (?,?);`)
            .run(
                member.memberId,
                member.memberName,
            )
    }


    db.close();
}

exports.insertMembers = (newProject) => {
    const db = betterSqlite3('./src/database/sampledata.db');

    db.close();
}

exports.getMembers = () => {
    return Promise.resolve(()=>{
        const db = betterSqlite3('./src/database/sampledata.db');
        stmt = db.prepare('SELECT * FROM Employees');
        console.log(stmt.all());
        return(stmt.all());
    });
}
