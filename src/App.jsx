import React, { Component } from "react";

import { Routes, Route, } from "react-router-dom";
import Sidenav from "./components/Sidenav.jsx";
import Projects from "./Pages/Projects.jsx"
import Members from "./Pages/Members.jsx"
import Addproject from "./Pages/Addproject.jsx";

import "./app.css"

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.css";                  //core css
import "primeicons/primeicons.css";                                //icons
import "primeflex/primeflex.css"

class App extends Component{



    render(){
        return(
            <div className="App">
                <Sidenav />
                <main>
                    <Routes>
                        <Route path="/" element={ <Projects/> } />
                        <Route path="/main_window" element={ <Projects/> } />
                        <Route path="/members" element={ <Members/> } />
                        <Route path="/addproject" element={ <Addproject/> } />
                    </Routes>
                </main>
            </div>
        )
    }
}

export default App;