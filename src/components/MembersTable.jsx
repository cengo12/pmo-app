import React, {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

export default function MembersTable(){
    const [members, setMembers] = useState([]);

    let data = window.dbapi.openFile()
        .then((result)=>{
            setMembers(result);
        });


    return(
        <div>
            <div className="data">
                <DataTable value={members} stripedRows responsiveLayout="scroll">
                    <Column field="RegistrationNumber" header="Sicil No."></Column>
                    <Column field="FullName" header="Çalışan"></Column>
                    <Column field="ProjectName" header="Proje"></Column>
                    <Column field="ProjectRole" header="Statü"></Column>
                    <Column field="PaperType" header="Belge Tipi"></Column>
                    <Column field="Status" header="Durum"></Column>
                    <Column field="confirmation" ></Column>
                </DataTable>
            </div>
        </div>
    )
}