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

exports.updateProject = (newProject) => {
    const existingProjectId = newProject.projectId;
    const db = betterSqlite3('./src/database/sampledata.db');

    // Update Projects table
    db.prepare(`
    UPDATE Projects 
    SET ProjectName = ?, ProjectManager = ?, StartDate = ?, FinishDate = ? 
    WHERE ProjectId = ?;
  `).run(
        newProject.projectName,
        newProject.projectManager,
        newProject.projectStartDate.toISOString(),
        newProject.projectEndDate.toISOString(),
        existingProjectId
    );

    // Delete old ProjectEmployeeBridge records for the existing project
    db.prepare(`
    DELETE FROM ProjectEmployeeBridge 
    WHERE ProjectFk = ?;
  `).run(existingProjectId);

    // Insert new ProjectEmployeeBridge records for the existing project
    for (const member of newProject.projectMembers) {
        // Insert or update Employees table
        db.prepare(`
      INSERT INTO Employees (RegistrationNumber, FullName)
      VALUES (?, ?)
      ON CONFLICT (RegistrationNumber) DO UPDATE SET FullName = excluded.FullName;
    `).run(
            member.memberId,
            member.memberName
        );

        // Get the EmployeeId for the member from the Employees table
        const employeeId = db.prepare(`
      SELECT EmployeeId FROM Employees WHERE RegistrationNumber = ?;
    `).get(member.memberId).EmployeeId;

        // Insert new ProjectEmployeeBridge record
        db.prepare(`
      INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status)
      VALUES (?, ?, ?, 'Başlangıç Formu', 'Eksik');
    `).run(
            existingProjectId,
            employeeId,
            member.memberTitle
        );
    }

    db.close();
};

exports.deleteProject = (existingProjectId) => {
    const db = betterSqlite3('./src/database/sampledata.db');
    console.log(existingProjectId);
    // Delete ProjectEmployeeBridge records for the existing project
    db.prepare(`
    DELETE FROM ProjectEmployeeBridge 
    WHERE ProjectFk = ?;
  `).run(existingProjectId);

    // Delete Employees records that are no longer referenced by any ProjectEmployeeBridge records
    db.prepare(`
    DELETE FROM Employees 
    WHERE NOT EXISTS (
      SELECT * FROM ProjectEmployeeBridge WHERE EmployeeFk = Employees.EmployeeId
    );
  `).run();

    // Delete Projects record
    db.prepare(`
    DELETE FROM Projects 
    WHERE ProjectId = ?;
  `).run(existingProjectId);

    db.close();
};


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
    db.prepare('UPDATE ProjectEmployeeBridge SET Status = ? WHERE BridgeId = ?').run(updatedStatus.Status,updatedStatus.Id);
    db.close();
}

exports.getProjectNames= (projectId) =>{
    const db = betterSqlite3('./src/database/sampledata.db');
    return db.prepare('SELECT ProjectName, ProjectId FROM Projects').all();
}

exports.getProjectEdit = (arg) => {
    const projectId = arg.id;
    const db = betterSqlite3('./src/database/sampledata.db');
    const query = `
    SELECT Projects.ProjectName, Projects.ProjectManager, Projects.StartDate, Projects.FinishDate, 
           GROUP_CONCAT(Employees.FullName, ',') AS memberName, 
           GROUP_CONCAT(Employees.EmployeeId, ',') AS memberId, 
           GROUP_CONCAT(ProjectEmployeeBridge.ProjectRole, ',') AS memberTitle
    FROM Projects
    INNER JOIN ProjectEmployeeBridge ON Projects.ProjectId = ProjectEmployeeBridge.ProjectFk
    INNER JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.EmployeeId
    WHERE Projects.ProjectId = ?
    GROUP BY Projects.ProjectId;
    `;

    const result = db.prepare(query).get(projectId);
    return {
        projectName: result.ProjectName,
        projectManager: result.ProjectManager,
        startDate: new Date(result.StartDate),
        endDate: new Date(result.FinishDate),
        memberFields: result.memberName.split(',').map((name, index) => ({
            memberId: result.memberId.split(',')[index],
            memberName: name,
            memberTitle: result.memberTitle.split(',')[index],
        })),
    };
}


