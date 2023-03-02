import React, {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {Checkbox} from "primereact/checkbox";
import {Button} from "primereact/button";

export default function MembersTable(){
    const [members, setMembers] = useState([{
        Id: "",
        FullName: "",
        PaperType: "",
        ProjectName: "",
        ProjectRole: "",
        RegistrationNumber: "",
        Status: "",
        selected: false,
    }]);

    useEffect(()=> {
        window.dbapi.openFile().then(result => setMembers(result));
    },[]);

    const statusBodyTemplate = (member) => {
        return <Tag value={member.Status} severity={getStatus(member)}></Tag>;
    };

    const getStatus = (member) => {
        switch (member.Status) {
            case 'Onaylandı':
                return 'success';

            case 'Tamamlandı':
                return 'warning';

            case 'Eksik':
                return 'danger';

            default:
                return null;
        }
    };

    const handleCheckboxClick = (index) => {
        const _members = [...members];
        _members[index].selected = !_members[index].selected;
        _members[index].Status = _members[index].selected ? "Tamamlandı" : "Eksik";
        setMembers(_members);
    };

    const handleConfButtonClick = (index) => {
        const _members = [...members];
        if (_members[index].selected){
            _members[index].Status = "Onaylandı";
        }
        setMembers(_members);
    };

    const confirmationBodyTemplate = (member,options) =>{
        return(
            <div>
                <Checkbox checked={member.selected} onChange={() => handleCheckboxClick(options.rowIndex)} ></Checkbox>
                <Button size="sm" onClick={()=> handleConfButtonClick(options.rowIndex)} >Onayla</Button>
            </div>
        )
    }

    return(
        <div>
            <div className="data">
                <DataTable value={members} stripedRows responsiveLayout="scroll">
                    <Column field="RegistrationNumber" header="Sicil No."></Column>
                    <Column field="FullName" header="Çalışan"></Column>
                    <Column field="ProjectName" header="Proje"></Column>
                    <Column field="ProjectRole" header="Statü"></Column>
                    <Column field="PaperType" header="Belge Tipi"></Column>
                    <Column field="Status" header="Durum" body={statusBodyTemplate} ></Column>
                    <Column field="confirmation" body={confirmationBodyTemplate} ></Column>
                </DataTable>
            </div>
        </div>
    )
}