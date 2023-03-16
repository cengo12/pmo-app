import React from "react";

import {InputText} from "primereact/inputtext";
import {Calendar} from "primereact/calendar";

import "./newprojectform.css"
import {Button} from "primereact/button";
import {ScrollPanel} from "primereact/scrollpanel";
import {Dropdown} from "primereact/dropdown";
import { addLocale } from 'primereact/api';

class NewProjectForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            memberFields: [{memberId: '', memberName: '',memberTitle: '',}],
            projectName: '',
            projectManager: '',
            startDate: '',
            endDate: '',
            projects: [],
            editMode: false,
            projectId: "",
        };

        addLocale("tr",{
            "startsWith":"Başlangıç",
            "contains":"Barındırır",
            "notContains":"İçinde Barındırmaz",
            "endsWith":"Bitiş",
            "equals":"Eşittir",
            "notEquals":"Eşit Değildir",
            "noFilter":"Filtresiz",
            "lt":"Daha az",
            "lte":"Daha az veya Eşit",
            "gt":"Daha Fazla",
            "gte":"Daha fazla veya Eşit",
            "dateIs":"Tarih",
            "dateIsNot":"Tarih değildir",
            "dateBefore":"Tarihten önce",
            "dateAfter":"Tarihten sonra",
            "custom":"Özel",
            "clear":"Temiz",
            "apply":"Uygula",
            "matchAll":"Tümüyle eşleşir",
            "matchAny":"Herhangi birine eşleşir",
            "addRule":"Kural Ekle",
            "removeRule":"Kuralı Sil",
            "accept":"Tamam",
            "reject":"İptal",
            "choose":"Seç",
            "upload":"Yükle",
            "cancel":"Vazgeç",
            "dayNames":["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],
            "dayNamesShort":["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],
            "dayNamesMin":["Pz","Pt","Sa","Ça","Pe","Cu","Ct"],
            "monthNames":["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
            "monthNamesShort":["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],
            "today":"Bugün",
            "weekHeader":"Hf",
            "firstDayOfWeek":0,
            "dateFormat":"dd/mm/yy",
            "weak":"Zayıf",
            "medium":"Orta",
            "strong":"Güçlü",
            "passwordPrompt":"Şifre Giriniz",
            "emptyFilterMessage":"Kullanılabilir seçenek yok",
            "emptyMessage":"Sonuç bulunamadı",
            "aria": {
                "trueLabel": "Doğru",
                "falseLabel": "Yanlış",
                "nullLabel": "Seçilmedi",
                "pageLabel": "Sayfa",
                "firstPageLabel": "İlk Sayfa",
                "lastPageLabel": "Son Sayfa",
                "nextPageLabel": "Sonraki Sayfa",
                "previousPageLabel": "Önceki Sayfa"
            }
        });

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addMemberFields = this.addMemberFields.bind(this);
        this.removeMemberFields = this.removeMemberFields.bind(this);
    }

    componentDidMount() {
        window.dbapi.getProjectNames().then(result =>this.setState({projects:result}));
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        if (this.state.editMode){
            let newProject = {
                projectName: this.state.projectName,
                projectManager: this.state.projectManager,
                projectStartDate: this.state.startDate,
                projectEndDate: this.state.endDate,
                projectMembers: this.state.memberFields,
                projectId: this.state.projectId,
            }
            window.dbapi.sendToMain('updateProject',newProject);
        } else {
            let newProject = {
                projectName: this.state.projectName,
                projectManager: this.state.projectManager,
                projectStartDate: this.state.startDate,
                projectEndDate: this.state.endDate,
                projectMembers: this.state.memberFields,
            }
            window.dbapi.sendToMain('newProject',newProject);
        }
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

    setProjectId(event){
        this.setState({projectName: event.target.value}, () => {
            const lastFoundId = this.state.projectId;
            const projects = this.state.projects;
            const projectName = event.target.value;
            const selectedProject = projects.find(project => project.ProjectName === projectName);
            const newProjectId = selectedProject ? selectedProject.ProjectId : lastFoundId;
            this.setState({projectId: newProjectId}, () => {
                window.dbapi.getProjectEdit({id:this.state.projectId}).then(result=>this.setState(result))
            });
        });
    }

    deleteProject(){
        window.dbapi.sendToMain('deleteProject', this.state.projectId);
        window.location.reload(true);
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit} className="formgrid grid form card">
                    <div className="field col-12">
                        {this.state.editMode ? (
                            <div>
                                <label htmlFor="projectname" className="block">Proje Adı</label>
                                <Dropdown
                                    id="projectname"
                                    editable
                                    className="w-full"
                                    options={this.state.projects.map(project => project.ProjectName)}
                                    value={this.state.projectName}
                                    onChange={(e) => this.setProjectId(e) }
                                />
                            </div>
                            ) : (
                            <div>
                                <label htmlFor="projectname" className="block">Proje Adı</label>
                                <InputText
                                    id="projectname"
                                    className="w-full"
                                    options={this.state.projectNames}
                                    value={this.state.projectName}
                                    onChange={(e) => this.setState({projectName: e.value})}
                                />
                            </div>
                        )}
                    </div>
                    <div className="field col-6">
                        <label htmlFor="projectmanager" className="block">Proje Yöneticisi</label>
                        <InputText
                            id="projectmanager"
                            className="block"
                            value ={this.state.projectManager}
                            onChange={(e) => this.setState({projectManager: e.target.value})}
                        />
                    </div>
                    <div className="field col-3" >
                        <label htmlFor="projectdate">Başlangıç Tarihi</label>
                        <div id="projectdate" >
                            <Calendar
                                value={this.state.startDate}
                                onChange={(e) => {
                                    this.setState({ startDate: e.value });
                                    console.log(typeof e.value);
                                    console.log(e.value);
                                }
                            }
                                dateFormat="dd-mm-yy"
                                locale={"tr"}
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
                                locale={"tr"}
                                readOnlyInput
                            />
                        </div>
                    </div>
                    <ScrollPanel className="field col-12 team-members" style={{ width: '99%', height:"450px" }}>
                        <div >
                            {this.state.memberFields.map((input, index) => {
                                return(
                                    <div key={index}  >
                                        <div className="formgrid grid form">
                                            <div className="field col-2">
                                                <label htmlFor="memberId" className="block" >Sicil No</label>
                                                <InputText
                                                    placeholder="130xxxx"
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
                            <div className="">
                                <div className=" plus-button ">
                                    <Button
                                        type="button"
                                        icon="pi pi-plus"
                                        onClick={this.addMemberFields}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollPanel>
                    <div className="field col-4 col-offset-8 plus-button">
                        <Button
                            type="button"
                            label={this.state.editMode ? "Yeni Kayıt Moduna Geç" : "Düzenleme Moduna Geç"}
                            icon="pi pi-pencil"
                            onClick={()=>{
                                //this.setState({editMode: !this.state.editMode});
                                this.setState({
                                    memberFields: [{memberId: '', memberName: '',memberTitle: '',}],
                                    projectName: '',
                                    projectManager: '',
                                    startDate: '',
                                    endDate: '',
                                    editMode: !this.state.editMode,
                                })
                            }}
                        />

                        {this.state.editMode?(
                            <div>
                                <Button
                                    type="button"
                                    label="Projeyi Sil"
                                    icon="pi pi-times"
                                    onClick={()=>this.deleteProject()}
                                />
                            </div>
                        ) : (
                            <div></div>
                        )}
                        <Button
                            type="submit"
                            label={this.state.editMode ? "Projeyi Güncelle" : "Projeyi Kaydet"}
                            icon="pi pi-save"
                        />
                    </div>
                </form>
            </div>
        );
    }
}

export default NewProjectForm;