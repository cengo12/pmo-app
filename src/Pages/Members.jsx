import React from "react";
import MembersTable from "../components/MembersTable.jsx";
import styles from "./members.module.css"
export default function Members(){
    return(
        <div className={styles.membersPage}>
            <MembersTable />
        </div>
    )
}