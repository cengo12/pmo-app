import React, {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {Checkbox} from "primereact/checkbox";
import {Button} from "primereact/button";

export default function MembersTable(){
    const [members, setMembers] = useState([{
        BridgeId: "",
        FullName: "",
        PaperType: "",
        ProjectName: "",
        ProjectRole: "",
        RegistrationNumber: "",
        Status: "",
        Checked: false,
    }]);

    useEffect(()=> {
        window.dbapi.getMembers().then(result => setMembers(result));
    },[]);

    const statusBodyTemplate = (member) => {
        return <Tag value={member.Status} severity={getStatus(member)}></Tag>;
    };

    const getStatus = (member) => {
        switch (member.Status) {
            case 'Onaylandı':
                member.Checked = true;
                return 'success';

            case 'Tamamlandı':
                member.Checked = true;
                return 'warning';

            case 'Eksik':
                return 'danger';

            default:
                return null;
        }
    };

    const handleCheckboxClick = (index) => {
        const _members = [...members];
        _members[index].Checked = !_members[index].Checked;
        _members[index].Status = _members[index].Checked ? "Tamamlandı" : "Eksik";
        setMembers(_members);

        const updatedStatus = {
            Id: _members[index].BridgeId,
            Status: _members[index].Status
        };

        window.dbapi.sendToMain('updateStatus',updatedStatus);
        window.dbapi.getProjectEdit(this.state.projectId).then(result=> console.log(result))
    };

    const handleConfButtonClick = (index) => {
        const _members = [...members];
        if (_members[index].Checked){
            _members[index].Status = "Onaylandı";
        }
        setMembers(_members);
        const updatedStatus = {
            Id: _members[index].BridgeId,
            Status: _members[index].Status
        };

        window.dbapi.sendToMain('updateStatus',updatedStatus);
    };

    const confirmationBodyTemplate = (member,options) =>{
        return(
            <div>
                <Checkbox checked={member.Checked} onChange={() => handleCheckboxClick(options.rowIndex)} ></Checkbox>
                <Button size="sm" onClick={()=> handleConfButtonClick(options.rowIndex)} >Onayla</Button>
            </div>
        )
    }

    return(
        <div>
            <div className="data">
                <DataTable value={members} stripedRows scrollable="true" sortField="Status" sortOrder={1} removableSort>
                    <Column field="RegistrationNumber" header="Sicil No." sortable></Column>
                    <Column field="FullName" header="Çalışan" sortable></Column>
                    <Column field="ProjectName" header="Proje" sortable></Column>
                    <Column field="ProjectRole" header="Statü" sortable></Column>
                    <Column field="PaperType" header="Belge Tipi" sortable></Column>
                    <Column field="Status" header="Durum" body={statusBodyTemplate} sortable style={{ width: '10%' }}></Column>
                    <Column field="confirmation" body={confirmationBodyTemplate} ></Column>
                </DataTable>
            </div>
        </div>
    )
}