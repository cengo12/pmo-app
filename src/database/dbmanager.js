const betterSqlite3 = require('better-sqlite3');

exports.newProject = (newProject) => {
    const db = betterSqlite3('./src/database/sampledata.db');

    // Insert to projects table
    db.prepare(`INSERT INTO Projects (ProjectName, ProjectManager, StartDate, FinishDate) VALUES (?,?,?,?);`)
        .run(
            newProject.projectName,
            newProject.projectManager,
            newProject.projectStartDate.toISOString(),
            newProject.projectEndDate.toISOString()
        );
    //console.log(newProject.projectEndDate.toISOString());
    let projectPk = db.prepare('SELECT Id FROM Projects WHERE id = last_insert_rowid();').all(); //projectPk for bridge table

    // Insert to employees table
    for (const member of newProject.projectMembers) {
        db.prepare('INSERT OR IGNORE INTO Employees (RegistrationNumber, FullName) VALUES (?,?);')
            .run(
                member.memberId,
                member.memberName,
            )

        let memberPk = db.prepare('SELECT Id FROM Employees WHERE RegistrationNumber = (?);').all(member.memberId);

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
    const data = db.prepare(
        'SELECT Employees.Id, ' +
        'Employees.RegistrationNumber, Employees.FullName, ' +
        'Projects.ProjectName,ProjectEmployeeBridge.ProjectRole,' +
        'ProjectEmployeeBridge.PaperType, ProjectEmployeeBridge.Status,' +
        'Projects.StartDate, Projects.FinishDate ' +
        'FROM ProjectEmployeeBridge ' +
        'JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.Id ' +
        'JOIN Projects ON ProjectEmployeeBridge.ProjectFk = Projects.Id;'
    ).all();



    // Get a list of unique age values
    const idValues = [...new Set(data.map(item => item.Id))];

    // Create a new array for each age value
    const memberArrays = idValues.map(id => data.filter(item => item.Id === id));


    let tableData = [];
    for (let i = 0; i < memberArrays.length; i++) {
        let data = memberArrays[i];
        data.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        let StartProject = {}
        let FinishProject = {}
        StartProject = {...data[0]};
        FinishProject = {...data[0]};


        for (let i = 0; i < data.length-1; i++) {
            if (new Date(StartProject.FinishDate) > new Date(data[i+1].StartDate)){
                if (new Date(StartProject.FinishDate) > new Date(data[i+1].FinishDate)){
                    FinishProject = {...data[i]};
                }else{
                    FinishProject = {...data[i+1]};
                }
            }
            else{
                if (new Date(FinishProject.FinishDate) < new Date(data[i+1].FinishDate) ){
                    if (new Date(FinishProject.FinishDate) >  new Date(data[i+1].StartDate)){
                        FinishProject = {...data[i+1]}
                    }
                }
                StartProject.PaperType = 'Başlangıç Formu';
                FinishProject.PaperType = 'Bitiş Formu';
                tableData.push(StartProject);
                tableData.push(FinishProject);
                StartProject = {...data[i+1]};
                FinishProject = {...data[i+1]};
            }
        }
        StartProject.PaperType = 'Başlangıç Formu';
        FinishProject.PaperType = 'Bitiş Formu';
        tableData.push(StartProject);
        tableData.push(FinishProject);
    }


    return tableData;
}


exports.updateStatus = (updatedStatus) => {
    const db = betterSqlite3('./src/database/sampledata.db');
    console.log(updatedStatus);
    db.prepare('UPDATE ProjectEmployeeBridge SET Status = ? WHERE Id = ?').run(updatedStatus.Status,updatedStatus.Id);
    db.close();
}