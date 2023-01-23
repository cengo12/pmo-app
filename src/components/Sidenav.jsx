import React, {useState} from "react";

import {NavLink} from "react-router-dom";
import { navData } from "../lib/navData.js";

import 'primeicons/primeicons.css';
import styles from './sidenav.module.css'



export default function Sidenav() {
    const [open, setopen] = useState(true)

    const toggleOpen = () => {
        setopen(!open)
    }

    const NavItems = () => {
        return(
            navData.map(item =>{
                return(
                    <NavLink key={item.id} className={styles.sideitem} to={item.link} >
                        {item.icon}
                        <span className={open?styles.linkText:styles.linkTextClosed} >{item.text}</span>
                    </NavLink>
                )
            })
        )
    }

    return (
        <div className={open?styles.sidenav:styles.sidenavClosed}>
            <button className={styles.menuBtn}  onClick={toggleOpen}>
                { open? <i className="pi pi-angle-double-left"/>: <i className="pi pi-angle-double-right"/>}
            </button>
            <NavItems />
        </div>
    )
}