import React, {useState} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

export default function MembersTable(){
    const [members, setMembers] = useState([]);

    return(
        <div>
            <div className="card">
                <DataTable value={members} stripedRows responsiveLayout="scroll">
                    <Column field="no" header="Sicil No."></Column>
                    <Column field="name" header="Çalışan"></Column>
                    <Column field="projectname" header="Proje"></Column>
                    <Column field="role" header="Statü"></Column>
                    <Column field="papertype" header="Belge Tipi"></Column>
                    <Column field="status" header="Durum"></Column>
                    <Column field="confirmation" ></Column>
                </DataTable>
            </div>
        </div>
    )
}