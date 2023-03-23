const betterSqlite3 = require('better-sqlite3');
const { dialog } = require('electron')
const fs = require("fs");
const path = require("path");

// Function to initialize database connection and return db object
const getDB = (filePath) => {
    return betterSqlite3(filePath);
};

// Function to get the database file path
exports.getDatabaseFile = () => {
    return new Promise((resolve, reject) => {
        dialog.showOpenDialog({ properties: ['openFile'] }).then(result => {
            const filePaths = result.filePaths;
            console.log('Selected file path:', filePaths[0]);

            // Read the existing config file, if it exists
            const configPath = path.join(__dirname, 'config.json');
            let config = {};
            if (fs.existsSync(configPath)) {
                const data = fs.readFileSync(configPath);
                config = JSON.parse(data);
            }

            // Update the file path in the config object
            config.filePath = filePaths[0];

            // Write the updated config object to the config file
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            // Resolve the promise with the selected file path
            resolve(filePaths[0]);
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    });
};

const getDb = async () => {
    // Get database file path
    const filePath = await exports.getDatabaseFile();
    // Get db object using file path
    const db = getDB(filePath);
    return db
}


exports.newProject = (newProject) => {
    const db = getDb();

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
            );

        db.prepare('INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);')
            .run(
                projectPk[0].ProjectId,
                memberPk[0].EmployeeId,
                member.memberTitle,
                'Bitiş Formu',
                'Eksik',
            );
    }

    db.close();
}

exports.updateProject = (newProject) => {
    const existingProjectId = newProject.projectId;
    const db = getDb()

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
        db.prepare(
            `INSERT INTO Employees (RegistrationNumber, FullName) VALUES (?, ?) ON CONFLICT (RegistrationNumber) DO UPDATE SET FullName = excluded.FullName;`)
            .run(
            member.memberId,
            member.memberName
        );

        // Get the EmployeeId for the member from the Employees table
        const employeeId = db.prepare(`
      SELECT EmployeeId FROM Employees WHERE RegistrationNumber = ?;
    `).get(member.memberId).EmployeeId;

        // Insert new ProjectEmployeeBridge record
        db.prepare('INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);').run(
            existingProjectId,
            employeeId,
            member.memberTitle,
            'Başlangıç Formu',
            'Eksik',
        );
        db.prepare('INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);').run(
            existingProjectId,
            employeeId,
            member.memberTitle,
            'Bitiş Formu',
            'Eksik',
        );

    }

    db.close();
};

exports.deleteProject = (existingProjectId) => {
    const db = getDb()
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
    const db = getDb()
    const data = db.prepare(
        'SELECT ProjectEmployeeBridge.BridgeId, Employees.EmployeeId, ' +
        'Employees.RegistrationNumber, Employees.FullName, ' +
        'Projects.ProjectManager, Projects.ProjectName, ProjectEmployeeBridge.ProjectRole, ' +
        'ProjectEmployeeBridge.PaperType, ProjectEmployeeBridge.Status, ' +
        'Projects.StartDate, Projects.FinishDate ' +
        'FROM ProjectEmployeeBridge ' +
        'JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.EmployeeId ' +
        'JOIN Projects ON ProjectEmployeeBridge.ProjectFk = Projects.ProjectId;'
    ).all();

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
    const db = getDb()
    db.prepare('UPDATE ProjectEmployeeBridge SET Status = ? WHERE BridgeId = ?').run(updatedStatus.Status,updatedStatus.BridgeId);
    db.close();
}

exports.getProjectNames= (projectId) =>{
    const db = getDb()
    return db.prepare('SELECT ProjectName, ProjectId FROM Projects').all();
}

exports.getProjectEdit = (arg) => {
    const projectId = arg.id;
    const db = betterSqlite3('./src/database/sampledata.db');

    const query = `
    SELECT Projects.ProjectName, Projects.ProjectManager, Projects.StartDate, Projects.FinishDate, 
       GROUP_CONCAT(Employees.FullName, ',') AS memberName, 
       GROUP_CONCAT(Employees.RegistrationNumber, ',') AS memberId, 
       GROUP_CONCAT(ProjectEmployeeBridge.ProjectRole, ',') AS memberTitle
    FROM Projects
    INNER JOIN (
        SELECT DISTINCT ProjectFk, EmployeeFk, ProjectRole
        FROM ProjectEmployeeBridge
    ) AS ProjectEmployeeBridge ON Projects.ProjectId = ProjectEmployeeBridge.ProjectFk
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


