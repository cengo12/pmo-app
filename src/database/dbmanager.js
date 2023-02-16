const betterSqlite3 = require('better-sqlite3');

exports.newProject = (newProject) => {
    const db = betterSqlite3('./src/database/sampledata.db');

    // Insert to projects table
    db.prepare(`INSERT INTO Projects (ProjectName, ProjectManager, StartDate, FinishDate) VALUES (?,?,?,?);`)
        .run(
            newProject.projectName,
            newProject.projectManager,
            newProject.projectStartDate,
            newProject.projectEndDate
        );

    let projectPk = db.prepare('SELECT Id FROM Projects WHERE id = last_insert_rowid();').all(); //projectPk for bridge table

    // Insert to employees table
    for (const member of newProject.projectMembers) {
        db.prepare('INSERT OR IGNORE INTO Employees (RegistrationNumber, FullName) VALUES (?,?);')
            .run(
                member.memberId,
                member.memberName,
            )

        let memberPk = db.prepare('SELECT Id FROM Employees WHERE RegistrationNumber = (?);').all(member.memberId);
        console.log(memberPk);

        // Insert to ProjectEmployeeBridge
        db.prepare('INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);')
            .run(
                projectPk[0].Id,
                memberPk[0].Id,
                member.memberTitle,
                'Başlangıç Formu',
                'Eksik',
            )
    }

    db.close();
}



exports.getMembers = () => {
    const db = betterSqlite3('./src/database/sampledata.db');

    return db.prepare('SELECT Employees.RegistrationNumber, Employees.FullName, ' +
        'Projects.ProjectName,ProjectEmployeeBridge.ProjectRole,' +
        'ProjectEmployeeBridge.PaperType, ProjectEmployeeBridge.Status ' +
        'FROM ProjectEmployeeBridge ' +
        'JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.Id ' +
        'JOIN Projects ON ProjectEmployeeBridge.ProjectFk = Projects.Id;').all()





}
