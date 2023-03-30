import React from "react";
import {Button} from "primereact/button";


export default function Settings(){

    const openDialog = () => {
        window.dbapi.openDbDialog().then((result) => {
            console.log(result);
        });
    }

    return(
        <div>
            <Button onClick={()=>openDialog()}>Veritabani </Button>
        </div>
    )
}