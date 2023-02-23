import React, {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";

export default function MembersTable(){
    const [members, setMembers] = useState([]);

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

    const confirmationBodyTemplate = () =>{

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
                    <Column field="Status" header="Durum" body={statusBodyTemplate}></Column>
                    <Column field="confirmation" ></Column>
                </DataTable>
            </div>
        </div>
    )
}