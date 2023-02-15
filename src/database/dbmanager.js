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

    db.close();
}

exports.insertMembers = (newProject) => {
    const db = betterSqlite3('./src/database/sampledata.db');
    console.log(newProject.projectMembers);
    for (const member of newProject.projectMembers) {
        console.log(member.memberId);
        db.prepare(`INSERT INTO Employees (RegistrationNumber, FullName) VALUES (?,?);`)
            .run(
                member.memberId,
                member.memberName,
                )

    }
    db.close();
}

