const betterSqlite3 = require('better-sqlite3');
const { dialog } = require('electron');
const {join} = require("path");
const {existsSync, readFileSync, writeFileSync} = require("fs");


let db = null;


// Get database from path inside config, if path does not exist open file dialog
const getDb = async ()  =>  {
    try {
        const configFileExists = existsSync('config.json');
        if (configFileExists) {
            const config = JSON.parse(readFileSync('config.json').toString());
            return config.databaseFilePath;
        } else {
            return await exports.openDbDialog();
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}


// Open file dialog for choosing database file
exports.openDbDialog = async () => {
    try {
        const result = await dialog.showOpenDialog({ properties: ['openFile'] });
        const filePath = result.filePaths[0];
        writeFileSync('config.json', JSON.stringify({ databaseFilePath: filePath }));
        return filePath;
    } catch (err) {
        console.error(err);
        throw err;
    }
};


// Called when new project added
exports.newProject = async (newProject) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    // Insert project to projects table
    const query = `INSERT INTO Projects (ProjectName, ProjectManager, StartDate, FinishDate) VALUES (?,?,?,?);`
    db.prepare(query)
        .run(
            newProject.projectName,
            newProject.projectManager,
            newProject.projectStartDate.toISOString(),
            newProject.projectEndDate.toISOString()
        );

    // Insert all project employees to employees table
    let projectPk = db.prepare('SELECT ProjectId FROM Projects WHERE ProjectId = last_insert_rowid();').all(); //projectPk for bridge table
    for (const member of newProject.projectMembers) {
        db.prepare('INSERT OR IGNORE INTO Employees (RegistrationNumber, FullName) VALUES (?,?);')
            .run(
                member.memberId,
                member.memberName,
            )

        // Insert all project employees to ProjectEmployeeBridge as Start Form
        let memberPk = db.prepare('SELECT EmployeeId FROM Employees WHERE RegistrationNumber = (?);').all(member.memberId);
        db.prepare('INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);')
            .run(
                projectPk[0].ProjectId,
                memberPk[0].EmployeeId,
                member.memberTitle,
                'Başlangıç Formu',
                'Eksik',
            );

        // Insert all project employees to ProjectEmployeeBridge as Finish Form
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


// Called when a project gets edited
exports.updateProject = async (newProject) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    // Update Projects table
    const existingProjectId = newProject.projectId;
    db.prepare(
        `UPDATE Projects SET ProjectName = ?, ProjectManager = ?, StartDate = ?, FinishDate = ? 
        WHERE ProjectId = ?;`)
        .run(
        newProject.projectName,
        newProject.projectManager,
        newProject.projectStartDate.toISOString(),
        newProject.projectEndDate.toISOString(),
        existingProjectId
    );

    // Delete old ProjectEmployeeBridge records for the existing project
    db.prepare(`DELETE FROM ProjectEmployeeBridge WHERE ProjectFk = ?;`).run(existingProjectId);

    // Insert new ProjectEmployeeBridge records for the existing project
    for (const member of newProject.projectMembers) {
        // Insert or update Employees table
        db.prepare(
            `INSERT INTO Employees (RegistrationNumber, FullName) VALUES (?, ?) 
            ON CONFLICT (RegistrationNumber) 
            DO UPDATE SET FullName = excluded.FullName; `)
            .run(
            member.memberId,
            member.memberName
        );

        // Get the EmployeeId for the member from the Employees table
        const employeeId = db.prepare(
            `SELECT EmployeeId FROM Employees WHERE RegistrationNumber = ?;`)
            .get(member.memberId).EmployeeId;

        // Insert new ProjectEmployeeBridge record
        db.prepare(`INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);`)
            .run(
            existingProjectId,
            employeeId,
            member.memberTitle,
            'Başlangıç Formu',
            'Eksik',
        );
        db.prepare(`INSERT INTO ProjectEmployeeBridge (ProjectFk, EmployeeFk, ProjectRole, PaperType, Status) VALUES (?,?,?,?,?);`)
            .run(
            existingProjectId,
            employeeId,
            member.memberTitle,
            'Bitiş Formu',
            'Eksik',
        );
    }
    db.close();
};


// Called when a project gets deleted
exports.deleteProject = async (existingProjectId) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    // Delete ProjectEmployeeBridge records for the existing project
    db.prepare(`DELETE FROM ProjectEmployeeBridge WHERE ProjectFk = ?;`).run(existingProjectId);

    // Delete Employees records that are no longer referenced by any ProjectEmployeeBridge records
    db.prepare(
        `DELETE FROM Employees WHERE NOT EXISTS 
        (SELECT * FROM ProjectEmployeeBridge WHERE EmployeeFk = Employees.EmployeeId);`)
        .run();

    // Delete Projects record
    db.prepare(
        `DELETE FROM Projects 
        WHERE ProjectId = ?;`)
        .run(existingProjectId);

    db.close();
};


// Get all necessary data for membersTable component
exports.getMembers = async () => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    const data = db.prepare(
        `SELECT ProjectEmployeeBridge.BridgeId, Employees.EmployeeId, 
        Employees.RegistrationNumber, Employees.FullName, 
        Projects.ProjectManager, Projects.ProjectName, ProjectEmployeeBridge.ProjectRole, 
        ProjectEmployeeBridge.PaperType, ProjectEmployeeBridge.Status, 
        Projects.StartDate, Projects.FinishDate 
        FROM ProjectEmployeeBridge 
        JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.EmployeeId 
        JOIN Projects ON ProjectEmployeeBridge.ProjectFk = Projects.ProjectId;`)
        .all();

    const idValues = [...new Set(data.map(item => item.EmployeeId))];

    const memberArrays = idValues.map(id => data.filter(item => item.EmployeeId === id));

    let tableData = [];
    for (let i = 0; i < memberArrays.length; i++) {
        let data = memberArrays[i];
        data.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        data = data.filter((element, index) => index % 2 === 0);

        let groupData = [];
        let startProject = data[0];
        let finishProject = data[0];
        for (let i = 1; i < data.length; i++) {


            let start = new Date(startProject.StartDate);
            let finish = new Date(finishProject.FinishDate);

            let nextProject = data[i];

            let nextStart = new Date(nextProject.StartDate);
            let nextFinish = new Date(nextProject.FinishDate);


            // sonraki projeyi içine alıyorsa
            if (nextFinish > start && nextFinish < finish) {
                startProject = data[0];
                finishProject = startProject;

            } //sonraki proje öncekini içine alıyorsa
            else if (nextFinish < start && nextFinish > finish) {
                startProject = data[0];
                finishProject = nextProject;
            }
            // sonuna ekleniyorsa
            else if (nextStart < finish && nextFinish > finish) {
                startProject = data[0];
                finishProject = nextProject;
            }
            // farklı grup ise
            else {
                groupData.push([startProject, finishProject])
                data.splice(0, i)
                startProject = data[0];
                finishProject = data[0];
            }
        }
        groupData.push([startProject, finishProject]);
        groupData.forEach((group) => {
            let start = {...group[0]}
            let finish = {...group[1]}
            start.PaperType = 'Başlangıç Formu';
            finish.PaperType = 'Bitiş Formu';
            tableData.push(start)
            tableData.push(finish)
        })
    }

    return tableData;
}

//TODO: add listener to db , projectemplooyeebridge table status column
exports.setupDatabaseListener= async (databasePath, interval, callback) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });
    // Retrieve the data to be monitored
    const getData = db.prepare('SELECT Status FROM ProjectEmployeeBridge').all.bind(db);

    let previousData = getData();

    setInterval(() => {
        const currentData = getData();
        if (JSON.stringify(currentData) !== JSON.stringify(previousData)) {
            previousData = currentData;
            //TODO add callback
            callback(currentData);
        }
    }, 100);
}



// Called when user changes status in membersTable component
exports.updateStatus = async (updatedStatus) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    // Update status in BridgeTable
    db.prepare('UPDATE ProjectEmployeeBridge SET Status = ? WHERE BridgeId = ?')
        .run(
            updatedStatus.Status,
            updatedStatus.BridgeId
        );
    db.close();
}


// Get all project names
exports.getProjectNames= async (projectId) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    const projectNames = db.prepare('SELECT ProjectName, ProjectId FROM Projects').all();

    db.close();

    return projectNames
}


// Get all required data for edit project option
exports.getProjectEdit = async (arg) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    const projectId = arg.id;


    const result = db.prepare(
        `SELECT Projects.ProjectName, Projects.ProjectManager, Projects.StartDate, Projects.FinishDate, 
        GROUP_CONCAT(Employees.FullName, ',') AS memberName, 
        GROUP_CONCAT(Employees.RegistrationNumber, ',') AS memberId, 
        GROUP_CONCAT(ProjectEmployeeBridge.ProjectRole, ',') AS memberTitle
        FROM Projects INNER JOIN ( SELECT DISTINCT ProjectFk, EmployeeFk, ProjectRole FROM ProjectEmployeeBridge ) 
        AS ProjectEmployeeBridge ON Projects.ProjectId = ProjectEmployeeBridge.ProjectFk
        INNER JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.EmployeeId
        WHERE Projects.ProjectId = ?
        GROUP BY Projects.ProjectId;`)
        .get(projectId);

    // Return data in the required format
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


// Get required data for GanttChart component
exports.getDates = async (arg) => {
    // Database connection
    await getDb().then((dbPath) => {
        db = betterSqlite3(dbPath);
    });

    const result = db.prepare(`SELECT ProjectName, StartDate, FinishDate, ProjectManager FROM Projects`).all()

    // Format data to required format
    return result.map(
        ({ProjectName, StartDate, FinishDate, ProjectManager}) => ({
        x: [new Date(StartDate).toISOString().substring(0, 10), new Date(FinishDate).toISOString().substring(0, 10)],
        y: ProjectName,
        name: ProjectManager,
    }));
}

