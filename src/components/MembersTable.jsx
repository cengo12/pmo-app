import React, {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {Checkbox} from "primereact/checkbox";
import {Button} from "primereact/button";

export default function MembersTable(){
    const [members, setMembers] = useState([{
        BridgeId: "",
        EmployeeId: "",
        FinishDate: "",
        FullName: "",
        PaperType: "",
        ProjectName: "",
        ProjectRole: "",
        RegistrationNumber: "",
        StartDate: "",
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

    const handleCheckboxClick = (member) => {
        const _members = [...members];
        const foundMember = _members.find(_member => _member.BridgeId === member.BridgeId && _member.PaperType === member.PaperType);
        let updatedStatus = {};

        if (foundMember) {
            foundMember.Checked = !foundMember.Checked;
            foundMember.Status = foundMember.Checked ? "Tamamlandı" : "Eksik";

            updatedStatus = {
                BridgeId: foundMember.BridgeId,
                Status: foundMember.Status,
            };
        }

        setMembers(_members);

        window.dbapi.sendToMain('updateStatus',updatedStatus);
    };

    const handleConfButtonClick = (member) => {
        const _members = [...members];
        const foundMember = _members.find(_member => _member.BridgeId === member.BridgeId && _member.PaperType === member.PaperType);

        if (foundMember && foundMember.Checked) {
            foundMember.Status = "Onaylandı";
        }
        console.log(_members);
        setMembers(_members);

        const updatedStatus = {
            BridgeId: foundMember.BridgeId,
            Status: foundMember.Status,
        };

        window.dbapi.sendToMain('updateStatus',updatedStatus);
    };

    const confirmationBodyTemplate = (member) =>{
        return(
            <div>
                <Checkbox checked={member.Checked} onChange={() => handleCheckboxClick(member)} ></Checkbox>
                <Button size="sm" onClick={()=> handleConfButtonClick(member)} >Onayla</Button>
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