import React from "react";

import {InputText} from "primereact/inputtext";
import {Calendar} from "primereact/calendar";

import "./newprojectform.css"
import {Button} from "primereact/button";
import {ScrollPanel} from "primereact/scrollpanel";

class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memberFields: [{memberId: '', memberName: '',memberTitle: '',}],
            projectName: '',
            projectManager: '',
            startDate: '',
            endDate: '',
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
        event.preventDefault();

        let newProject = {
            projectName: this.state.projectName,
            projectManager: this.state.projectManager,
            projectStartDate: this.state.startDate.getDate(),
            projectEndDate: this.state.endDate.getDate(),
            projectMembers: this.state.memberFields,
        }
        window.dbapi.sendToMain('newProject',newProject);
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
            <div>
                <form onSubmit={this.handleSubmit} className="formgrid grid form card">
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
                    <div className="field col-3" >
                        <label htmlFor="projectdate">Başlangıç Tarihi</label>
                        <div id="projectdate" >
                            <Calendar
                                value={this.state.startDate}
                                onChange={(e) => this.setState({ startDate: e.value })}
                                dateFormat="dd-mm-yy"
                                readOnlyInput
                            />
                        </div>
                    </div>
                    <div className="field col-3" >
                        <label htmlFor="projectdate">Bitiş Tarihi</label>
                        <div id="projectdate" >
                            <Calendar
                                value={this.state.endDate}
                                onChange={(e) => this.setState({ endDate: e.value })}
                                dateFormat="dd-mm-yy"
                                readOnlyInput
                            />
                        </div>
                    </div>

                    <ScrollPanel className="field col-12 team-members" style={{ width: '99%', height: '450px' }}>
                        <div >
                            {this.state.memberFields.map((input, index) => {
                                return(
                                    <div key={index}  >
                                        <div className="formgrid grid form">
                                            <div className="field col-2">
                                                <label htmlFor="memberId" className="block">Sicil No</label>
                                                <InputText
                                                    id="memberId"
                                                    className="block"
                                                    name='memberId'
                                                    value={input.memberId}
                                                    onChange={event => this.handleMembersChange(index,event)}
                                                />
                                            </div>
                                            <div className="field col-7">
                                                <label htmlFor="memberName" className="block">Takım Üyesi Adı Soyadı</label>
                                                <InputText
                                                    id="memberName"
                                                    className="block"
                                                    name='memberName'
                                                    value={input.memberName}
                                                    onChange={event => this.handleMembersChange(index,event)}
                                                />
                                            </div>
                                            <div className="field col-2">
                                                <label htmlFor="memberTitle" className="block">Statü</label>
                                                <InputText
                                                    id="memberTitle"
                                                    className="block"
                                                    name='memberTitle'
                                                    value={input.memberTitle}
                                                    onChange={event => this.handleMembersChange(index,event)}
                                                />
                                            </div>
                                            <div className="field col-1 plus-button">
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

                            <div className="field col-1 col-offset-11 plus-button ">
                                <Button
                                    type="button"
                                    icon="pi pi-plus"
                                    onClick={this.addMemberFields}
                                />
                            </div>
                        </div>
                    </ScrollPanel>

                    <div className="field col-4 col-offset-8 plus-button">
                        <Button
                            type="submit"
                            label="Projeyi Kaydet"
                            icon="pi pi-plus"
                        />
                    </div>

                </form>

            </div>
        );
    }
}

export default NewProjectForm;