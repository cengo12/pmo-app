import React from "react";
import {Button} from "primereact/button";

export default function Settings(){
    const getFile = () => {
        window.dbapi.getDatabaseFile().then(result=>console.log(result))
    }

    return(
        <div>
            <Button onClick={()=>getFile() }>dosya</Button>
        </div>
    )

}