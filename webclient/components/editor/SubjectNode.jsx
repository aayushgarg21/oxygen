import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import DropDownMenu from 'material-ui/DropDownMenu';
import Dialog from 'material-ui/Dialog';
import MenuItem from 'material-ui/MenuItem';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ImageEdit from 'material-ui/svg-icons/image/edit';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import NodeRelationEditor from './NodeRelationEditor.jsx';
import Request from 'superagent';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {Step, Stepper, StepLabel} from 'material-ui/Stepper';
import ArrowForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import {cyan500} from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import Paper from 'material-ui/Paper';
import Add from './Add.jsx';
import AddPredicate from './AddPredicate.jsx';
import DeletePredicate from './deletePredicate.jsx';
import AddObjects from './AddObjects.jsx';
import Delete from './delete.jsx';
import Edit from './edit.jsx';
import { FormsyCheckbox, FormsyDate, FormsyRadio, FormsyRadioGroup,
    FormsySelect, FormsyText, FormsyTime, FormsyToggle, FormsyAutoComplete } from 'formsy-material-ui/lib';
import HorizontalLinearStepper from './HorizontalLinearStepper.jsx';
import TreeGraph from './TreeGraph.jsx';
import {Tabs, Tab} from 'material-ui/Tabs';
import DomainTable from './DomainTable.jsx';

const style = {
  margin: 30,
  fontFamily: 'sans-serif',
  textAlign: 'center'
}

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400
    },

    div: {
        marginLeft: 10
    },

    underlineStyle: {
        borderColor: cyan500
    }
};

const dataSourceConfig = {
    text: 'nodeKey',
    value: 'nodeValue'
};


export default class SubjectNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            canSubmit: false,
            searchSubjectText: '',
            searchObjectText: '',
            searchRelText: '',
            nodeRelations: [],
            value: 1,
            floatingLabelTextSubject: "Subjects",
            floatingLabelTextObject: "Objects",
            floatingLabelTextRel: "Predicate",
            errmsg: null,
            loading: null,
            selectedDomain: this.props.params.domainName,
            domainList: [],
            subjectList: [],
            objectList: [],
            predicateList:[],
            addLabel: 'Add Domain',
            relObjects: {},
            editmodalopen: false,
            stepNumber:0,
            objectPredicates: []
        };
        console.log(this.state.selectedDomain);
        this.getSubjects(this.state.selectedDomain);
    }

    getSubjects(domainName) {
        let url = `domain/${domainName}/subjects`;
        Request.get(url).end((err, res) => {
            if (err) {
                // res.send(err);
                this.setState({errmsg: res.body, loading: 'hide'});
            } else {
                // console.log('Response on show: ', JSON.parse(res.text));
                // let domainList1=this.state.domainList;
                let response = res.body;
                if (response['subjects'].length == 0) {
                    this.setState({floatingLabelTextObject: "No Results"})
                } else {
                    var listSubjects = [];

                    for(let each in response['subjects']){
                      let nodekey = response['subjects'][each].label ;
                      listSubjects.push({
                         nodeKey: nodekey.charAt(0) +': '+ response['subjects'][each]['name'],
                         nodeValue: nodekey.charAt(0) +': '+ response['subjects'][each]['name']
                       });
                    }
                    this.setState({subjectList: listSubjects, searchObjectText: '', loading: 'hide'});
                }
            }
        });
    }

    getObjects(nodeType, searchText) {
        let url = '';
        switch (nodeType) {
            case 'C':
                url = `/domain/${this.state.selectedDomain}/subject/concept/${searchText}/objects`;
                break;
            case 'I':
                url = `/domain/${this.state.selectedDomain}/subject/intent/${searchText}/objects`;
                break;
        }

        Request.get(url).end((err, res) => {
            if (err) {
                // res.send(err);
                this.setState({errmsg: res.body, loading: 'hide'});
            } else {
                // console.log('Response on show: ', JSON.parse(res.text));
                // let domainList1=this.state.domainList;
                let response = JSON.parse(res.text);
                console.log(response);
                if (response['objects'].length == 0) {
                    this.setState({floatingLabelTextObject: "No Results"});
                }
                else {
                    var listObjects = [];
                    var listPredicates = [];
                    for(let each in response['objects']){
                      let label;
                      if(nodeType == "C"){
                        label = "C";
                      }
                      else {
                        label = "T";
                      }
              let nodekey = response['objects'][each]['name'] ;

                       listObjects.push(label +': '+ response['objects'][each]['name']);

                       console.log(nodekey);
                       listPredicates[response['objects'][each]['name']] = response['objects'][each]['predicates'];
                    }
                    this.setState(
                      {
                        predicateList:listPredicates,
                        objectList: listObjects,
                        searchRelText: '',
                        loading: 'hide'
                      });
                }
            }
        });
    }

    enableButton() {
      this.setState({
        canSubmit: true,
      });
    };

    getEditor() {
        let url = `/domain/edit/` + this.props.domainName;
        Request.get(url).end((err, res) => {
            if (!err) {
                let editor = JSON.parse(res.text);
                let chart = this.drawChart(editor)
                this.setState({domainName: editor.Domain, data: editor, chart: chart})
            }
        });
    }

    componentDidMount() {
        this.getEditor();
    }

    getDomains() {
        let url = `/domain/`;
        Request.get(url).end((err, res) => {
            if (err) {
                this.setState({errmsg: res.body, loading: 'hide'});
            } else {
                let response = JSON.parse(res.text);
                if (response.length === 0) {
                    this.setState({subjectList: [], loading: 'hide'});
                } else {
                    var listDomain = [];
                    for (let each in response) {
                        listDomain.push(response[each]['name']);
                    }
                    this.setState({domainList: listDomain, loading: 'hide'});
                }
            }
        });
    }

    handleUpdateDomainInput = (searchText) => {
        this.getSubjects(searchText);
        this.setState({addLabel: 'Add Intent',
          floatingLabelTextSubject: 'Subjects loaded'});
    };

    handleUpdateSubjectInput = (searchText) => {
        console.log(searchText);
        this.getObjects(searchText.charAt(0),
        searchText.substr(3, searchText.length));
        this.setState({
           addLabel: 'Add Intent',
           floatingLabelTextObject: 'Objects',
           stepNumber:1
         });
    };

    handleUpdateObjectInput = (searchText) => {
       let predicates = this.state.predicateList[searchText.substr(3, searchText.length)];
       console.log(predicates);
        this.setState({
          nodeRelations: predicates,
          stepNumber:2
        });
    };

    handleChange = (event, index, value) => this.setState({value});

    handleNewRequest = () => {
        this.setState({searchSubjectText: '', searchObjectText: '', searchRelText: ''});
    };

    handleModalAddOpen = () => {
        this.setState({addmodalopen: true, canSubmit: false});
    }
handleModalObjAddOpen = () =>{
  this.setState({addmodalobjopen: true, canSubmit: false});
}
handleModalPredAddOpen =()=>{
  this.setState({addmodalpredopen: true, canSubmit: false});
}
    handleModalDeleteOpen = () => {
        this.setState({deletemodalopen: true});
    }

    handleModalEditOpen = () => {
        this.setState({editmodalopen: true});
    };

    handleModalClose = () => {
      this.setState({addmodalobjopen:false});
      this.setState({addmodalpredopen:false});
        this.setState({addmodalopen: false});
        this.setState({editmodalopen: false});
        this.setState({deletemodalopen: false});
    };

    handleNext() {
        const {stepIndex} = this.state;

        if (stepIndex < 2) {
            this.setState({
                stepIndex: stepIndex + 1
            });
        }
    }

    enableButton() {
      this.setState({
        canSubmit: true,
      });
    }

    disableButton() {
      this.setState({
        canSubmit: false,
      });
    }


    notifyFormError(data) {
      console.error('Form error:', data);
    }

    handleClose = () => {
      this.setState({openDialog : true});
    };

    handlePrev() {
        const {stepIndex} = this.state;

        if (stepIndex > 0) {
            this.setState({
                stepIndex: stepIndex - 1
            });
        }
    }

    render() {
      let {paperStyle, switchStyle, submitStyle } = styles;
        const {stepIndex} = this.state;
        const actions = [< div > <FlatButton label="Cancel" primary={true} onTouchTap={this.handleModalClose}/> < FlatButton label = "Submit" primary = {
                true
            }
            onTouchTap = {
                this.handleModalClose
            } /> </div>];
        const addactions = [< div > <FlatButton label="Cancel"
         primary={true}
         onTouchTap={this.handleModalClose}/>


       <FlatButton label = "Add"
         primary = {true}
         disabled = {
                !this.state.canSubmit
            }
            onTouchTap = {
                this.handleModalClose
            } /> </div>];

            const addobjactions = [< div > <FlatButton label="Cancel"
             primary={true}
             onTouchTap={this.handleModalClose}/>


            <FlatButton label = "Add"
             primary = {true}
             disabled = {
                    !this.state.canSubmit
                }
                onTouchTap = {
                    this.handleModalClose
                } /> </div>];

            const addpredactions = [< div > <FlatButton label="Cancel"
             primary={true}
             onTouchTap={this.handleModalClose}/>


           <FlatButton label = "Add"
             primary = {true}
             disabled = {
                    !this.state.canSubmit
                }
                onTouchTap = {
                    this.handleModalClose
                } /> </div>];

        let relObjects = [];
        let relTerm = [];
        let that = this;
        Object.keys(this.state.relObjects).map(function(key) {
            relObjects.push(<NodeRelationEditor relation={that.state.relObjects[key]} name={key}/>);
        });

        return (
            <div styles={styles.div}>
                <div style={{
                    textAlign: "center"
                }}>
                <h1 styles= {style}>{this.state.selectedDomain}</h1>
                </div>
                <HorizontalLinearStepper stepNumber={this.state.stepNumber}/>
                <Paper style={style}>

                    <div>
                        <AutoComplete
                          floatingLabelText={this.state.floatingLabelTextSubject}
                          searchText={this.state.searchSubjectText}
                          onUpdateInput={this.handleUpdateSubjectInput}
                          onNewRequest={this.handleNewRequest}
                          dataSource={this.state.subjectList}
                          dataSourceConfig={dataSourceConfig}
                          filter={AutoComplete.caseInsensitiveFilter}
                          openOnFocus={true}
                          maxSearchResults={5}
                          style={styles.div}/>
                        <ContentAdd onTouchTap={this.handleModalAddOpen} style={{cursor:'pointer', color:'#09F415'}}/>
                        <ActionDelete onTouchTap={this.handleModalDeleteOpen} style={{cursor:'pointer', color:'red'}}/>
                        <ImageEdit onTouchTap={this.handleModalEditOpen} style={{cursor:'pointer', color:'blue'}}/>
                    </div>

                    <div>
                        <AutoComplete floatingLabelText={this.state.floatingLabelTextObject}
                          searchText={this.state.searchObjectText}
                          onUpdateInput={this.handleUpdateObjectInput}
                          onNewRequest={this.handleNewRequest}
                          dataSource={this.state.objectList}
                          filter={AutoComplete.caseInsensitiveFilter}
                          openOnFocus={true}
                          maxSearchResults={5}
                          style={styles.div}/>
                        <ContentAdd onTouchTap={this.handleModalObjAddOpen} style={{cursor:'pointer',color:'#09F415'}}/>
                        <ActionDelete onTouchTap={this.handleModalDeleteOpen} style={{cursor:'pointer',color:'red'}}/>
                        <ImageEdit onTouchTap={this.handleModalEditOpen} style={{cursor:'pointer', color:'blue'}}/>
                    </div>

                    <div>
                        <AutoComplete
                          floatingLabelText={this.state.floatingLabelTextRel}
                          searchText={this.state.searchRelText}
                          onUpdateInput={this.handleUpdateRelInput}
                          onNewRequest={this.handleNewRequest}
                          dataSource={this.state.nodeRelations}
                          filter={AutoComplete.caseInsensitiveFilter}
                          openOnFocus={true}
                          maxSearchResults={5}
                          style={styles.div}
                          />
                        <ContentAdd onTouchTap={this.handleModalPredAddOpen} style={{cursor:'pointer', color:'#09F415'}}/>
                        <ActionDelete onTouchTap={this.handleModalDeleteOpen} style={{cursor:'pointer', color:'red'}}/>
                        <ImageEdit onTouchTap={this.handleModalEditOpen} style={{cursor:'pointer', color:'blue'}}/>
                    </div>

                </Paper>

                <Dialog
                  title="Add"
                  titleStyle={{
                    color: "#858586",
                    fontSize: 30,
                    backgroundColor: "#c7c7c7"
                }}
                  actions={addactions}
                  modal={true}
                  open={this.state.addmodalopen}>
                    {relObjects}
                    <Add selectedDomain = {this.state.selectedDomain}/>
                </Dialog>

                <Dialog
                  title="Add Predicate"
                  titleStyle={{
                    color: "#858586",
                    fontSize: 30,
                    backgroundColor: "#c7c7c7"
                }}
                  actions={addpredactions}
                  modal={true}
                  open={this.state.addmodalpredopen}>
                    {relObjects}
                    <AddPredicate />
                </Dialog>

                <Dialog
                  title="Add Objects"
                  titleStyle={{
                    color: "#858586",
                    fontSize: 30,
                    backgroundColor: "#c7c7c7"
                }}
                  actions={addobjactions}
                  modal={true}
                  open={this.state.addmodalobjopen}>
                    {relObjects}
                    <AddObjects />
                </Dialog>

                <Dialog
                  title="Delete"
                  titleStyle={{
                    color: "#858586",
                    fontSize: 30,
                    backgroundColor: "#c7c7c7"
                }}
                  actions={actions}
                  modal={true}
                  open={this.state.deletemodalopen}>
                    {relObjects}
                    <Delete />
                </Dialog>

                <Dialog title="Edit"
                  titleStyle={{
                    color: "#858586",
                    fontSize: 30,
                    backgroundColor: "#c7c7c7"
                }}
                  actions={actions}
                  modal={true}
                  open={this.state.editmodalopen}>
                    {relObjects}
                    <Edit />
                </Dialog>

                <Tabs value={this.state.tabValue} onChange={this.handleTabChange}>
                    <Tab label="List View" value="l">
                        <div>
                            <DomainTable/>
                        </div>
                    </Tab>
                    <Tab label="Graph View" value="g">
                        <div>
                            <div className="treeGraph">
                                <TreeGraph domainName={this.state.selectedDomain}/>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}
