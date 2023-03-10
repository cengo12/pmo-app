SELECT 
ProjectEmployeeBridge.Id,
Employees.RegistrationNumber, Employees.FullName,
Projects.ProjectName,ProjectEmployeeBridge.ProjectRole,
ProjectEmployeeBridge.PaperType, ProjectEmployeeBridge.Status
FROM ProjectEmployeeBridge 
JOIN Employees ON ProjectEmployeeBridge.EmployeeFk = Employees.Id 
JOIN Projects ON ProjectEmployeeBridge.ProjectFk = Projects.Id;