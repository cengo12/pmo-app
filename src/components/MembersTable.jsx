import React, {useState, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {Checkbox} from "primereact/checkbox";
import {Button} from "primereact/button";

import styles from "./memberstable.module.css"

import moment from 'moment';
import 'moment/locale/tr';


export default function MembersTable(){
    const [members, setMembers] = useState([{
        BridgeId: "",
        EmployeeId: "",
        FinishDate: "",
        FullName: "",
        PaperType: "",
        ProjectManager: "",
        ProjectName: "",
        ProjectRole: "",
        RegistrationNumber: "",
        StartDate: "",
        Status: "",
        Checked: false,
    }]);
    const [expandedRows, setExpandedRows] = useState(null);

    useEffect(()=> {
        window.dbapi.getMembers().then(result => setMembers(result));
    },[]);



    const rowExpansionTemplate = (data) => {
        const _data = { ...data }; // Create a copy of data

        const startDate = new Date(data.StartDate);
        const formattedStartDate = moment(startDate).format("DD/MM/YYYY");
        _data.StartDate = formattedStartDate;

        const finishDate = new Date(data.FinishDate);
        const formattedFinishDate = moment(finishDate).format("DD/MM/YYYY");
        _data.FinishDate = formattedFinishDate;
        return (
            <div>
                <h4>{_data.ProjectName} Detayları</h4>
                <DataTable value={[_data]}>
                    <Column field="ProjectManager" header="Proje Yöneticisi"></Column>
                    <Column field="StartDate" header="Proje Başlangıç Tarihi"></Column>
                    <Column field="FinishDate" header="Proje Bitiş Tarihi"></Column>
                </DataTable>
            </div>
        );
    }

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

        setMembers(_members);

        const updatedStatus = {
            BridgeId: foundMember.BridgeId,
            Status: foundMember.Status,
        };

        window.dbapi.sendToMain('updateStatus',updatedStatus);
    };

    const confirmationBodyTemplate = (member) =>{
        return(
            <div className={styles.confirmation}>
                <Checkbox checked={member.Checked} onChange={() => handleCheckboxClick(member)}></Checkbox>
                <Button size="sm" onClick={()=> handleConfButtonClick(member)} >Onayla</Button>
            </div>
        )
    }

    return(
        <div>
            <div className="data">
                <DataTable expandedRows={expandedRows}
                           onRowReorder={event => {
                               console.log(event.value)}}
                           onRowToggle={(e) => setExpandedRows(e.data)}
                           rowExpansionTemplate={rowExpansionTemplate}
                           value={members} stripedRows scrollable="true" sortField="Status" sortOrder={1} removableSort rowHover={true}>
                    <Column expander={true} style={{ width: '5rem' }} />
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