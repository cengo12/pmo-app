import React from "react";
import NewProjectForm from "../components/NewProjectForm.jsx";
import styles from "./addproject.module.css"

export default function Addproject(){
    return(
        <div className={styles.projectform}>
            <NewProjectForm />
        </div>
    )
}