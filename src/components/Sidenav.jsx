import React from "react";
import { navData } from "../lib/navData.js";
import 'primeicons/primeicons.css';


export default function Sidenav() {

    const NavItems = () => {
        return(
            navData.map(item =>{
                return(
                    <div key={item.id}  >
                        {item.icon}
                        <span >{item.text}</span>
                    </div>
                )
            })
        )
    }

    return (
        <div>
            <button>
                <i className="pi pi-angle-double-left" />
            </button>
            <NavItems />
        </div>
    )
}