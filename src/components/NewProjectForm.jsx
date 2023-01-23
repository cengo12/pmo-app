import React from "react";

import {InputText} from "primereact/inputtext";
import {Calendar} from "primereact/calendar";

import "./newprojectform.css"
import {Button} from "primereact/button";

class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memberFields: [{memberId: '', memberName: '',memberTitle: '',}],
            projectName: '',
            projectManager: '',
            dates: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addMemberFields = this.addMemberFields.bind(this);
        this.removeMemberFields = this.removeMemberFields.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    handleMembersChange(index, event){
        event.preventDefault();
        let data = [...this.state.memberFields];
        data[index][event.target.name] = event.target.value;
        this.setState({memberFields:data});
    }

    addMemberFields(){
        const values = [...this.state.memberFields];
        values.push({
            memberId: "",
            memberName: "",
            memberTitle: "",
        });
        this.setState({memberFields:values});
    }

    removeMemberFields(index){
        let data = [...this.state.memberFields];
        data.splice(index, 1);
        this.setState({memberFields:data});
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="formgrid grid form">

                <div className="field col-12">
                    <label htmlFor="projectname" className="block">Proje Adı</label>
                    <InputText
                        id="projectname"
                        className="block"
                        onChange={(e) => this.setState({projectName: e.target.value})}
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="projectmanager" className="block">Proje Yöneticisi</label>
                    <InputText
                        id="projectmanager"
                        className="block"
                        onChange={(e) => this.setState({projectManager: e.target.value})}
                    />
                </div>


                <div className="field col-6" >
                    <label htmlFor="projectdate">Proje Tarihleri</label>
                    <div id="projectdate" >
                        <Calendar
                            value={this.state.dates}
                            onChange={(e) => this.setState({ dates: e.value })}
                            selectionMode="range"
                            readOnlyInput
                        />
                    </div>
                </div>

                <div className="field col-12">
                    {this.state.memberFields.map((input, index) => {
                        return(
                            <div key={index}  >
                                <div className="formgrid grid form">
                                    <div className="field col-12 md:col-2">
                                        <label htmlFor="memberId" className="block">Sicil Numarası</label>
                                        <InputText
                                            id="memberId"
                                            className="block"
                                            name='memberId'
                                            value={input.memberId}
                                            onChange={event => this.handleMembersChange(index,event)}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-7">
                                        <label htmlFor="memberName" className="block">Takım Üyesi Adı Soyadı</label>
                                        <InputText
                                            id="memberName"
                                            className="block"
                                            name='memberName'
                                            value={input.memberName}
                                            onChange={event => this.handleMembersChange(index,event)}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-2">
                                        <label htmlFor="memberTitle" className="block">Ünvan</label>
                                        <InputText
                                            id="memberTitle"
                                            className="block"
                                            name='memberTitle'
                                            value={input.memberTitle}
                                            onChange={event => this.handleMembersChange(index,event)}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-1 plus-button">
                                        <Button
                                            type="button"
                                            icon="pi pi-minus"
                                            onClick={() => this.removeMemberFields(index)}
                                        />
                                    </div>

                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="field col-1 col-offset-11 plus-button">
                    <Button
                        type="button"
                        icon="pi pi-plus"
                        onClick={this.addMemberFields}
                    />
                </div>
                <div className="field col-4 col-offset-8 plus-button">
                    <Button
                        type="submit"
                        label="Projeyi Kaydet"
                        icon="pi pi-plus"
                    />
                </div>

            </form>
        );
    }
}

export default NewProjectForm;