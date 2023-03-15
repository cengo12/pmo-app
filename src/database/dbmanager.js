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
    let projectPk = db.prepare('SELECT ProjectId FROM Projects WHERE ProjectId = last_insert_rowid();').all(); //projectPk for bridge table

    // Insert to employees table
    for (const member of newProject.projectMembers) {
        db.prepare('INSERT OR IGNORE INTO Employees (RegistrationNumber, FullName) VALUES (?,?);')
            .run(
                member.memberId,
                member.memberName,
            )

        let memberPk = db.prepare('SELECT EmployeeId FROM Employees WHERE RegistrationNumber = (?);').all(member.memberId);

        // Insert to ProjectEmployeeBridge
        db.prepare('INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);')
            .run(
                projectPk[0].ProjectId,
                memberPk[0].EmployeeId,
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
        'SELECT ProjectEmployeeBridge.BridgeId, Employees.EmployeeId, ' +
        'Employees.RegistrationNumber, Employees.FullName, ' +
        'Projects.ProjectName,ProjectEmployeeBridge.ProjectRole,' +
        'ProjectEmployeeBridge.PaperType, ProjectEmployeeBridge.Status,' +
        'Projects.StartDate, Projects.FinishDate ' +
        'FROM ProjectEmployeeBridge ' +
        'JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.EmployeeId ' +
        'JOIN Projects ON ProjectEmployeeBridge.ProjectFk = Projects.ProjectId;'
    ).all();

    console.log(data)

    /*
    // Get a list of unique age values
    const idValues = [...new Set(data.map(item => item.EmployeeId))];

    // Create a new array for each age value
    const memberArrays = idValues.map(id => data.filter(item => item.EmployeeId === id));


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


    return tableData;*/


    // Get a list of unique EmployeeId values
    const uniqueIds = [...new Set(data.map(item => item.EmployeeId))];
    // Initialize an empty array to hold the resulting table data
    const tableData = [];

    // Loop through each unique EmployeeId
    uniqueIds.forEach(id => {
        // Filter the data array to get all projects for the current EmployeeId
        const memberData = data.filter(item => item.EmployeeId === id);
        // Sort the projects by their start date
        memberData.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));

        // Initialize the start and finish projects to the first project in the array
        let startProject = memberData[0];
        let finishProject = memberData[0];

        // Loop through the remaining projects for the current EmployeeId
        memberData.slice(1).forEach(item => {
            // If the finish date of the start project is later than the start date of the current project, update the finish project
            if (new Date(startProject.FinishDate) > new Date(item.StartDate)) {
                finishProject = item;
            }
            // If the finish date of the finish project is earlier than the finish date of the current project and the finish date of the finish project is later than the start date of the current project, update the finish project
            else if (new Date(finishProject.FinishDate) < new Date(item.FinishDate) && new Date(finishProject.FinishDate) > new Date(item.StartDate)) {
                finishProject = item;
            }
            // Otherwise, add the start and finish projects to the table data array, update the start and finish projects to the current project, and continue to the next project
            else {
                tableData.push({...startProject, PaperType: 'Başlangıç Formu'}, {...finishProject, PaperType: 'Bitiş Formu'});
                startProject = item;
                finishProject = item;
            }
        });

        // Add the start and finish projects for the last project in the array to the table data array
        tableData.push({...startProject, PaperType: 'Başlangıç Formu'}, {...finishProject, PaperType: 'Bitiş Formu'});
    });

// Return the resulting table data
    return tableData;


}


exports.updateStatus = (updatedStatus) => {
    const db = betterSqlite3('./src/database/sampledata.db');
    console.log(updatedStatus);
    db.prepare('UPDATE ProjectEmployeeBridge SET Status = ? WHERE BridgeId = ?').run(updatedStatus.Status,updatedStatus.Id);
    db.close();
}

exports.getProjectNames= () =>{

}