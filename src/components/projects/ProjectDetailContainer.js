import React, { Component } from 'react';
import LoaderCircular from './../common/LoaderCircular';
import Icon from './../common/Icon';
import DCMTWebApi from '../../api';
import { withRouter } from 'react-router';
import SkillRow from './../skills/SkillRow';
import Modal from 'react-responsive-modal';
import SkillsSelect from './../skills/SkillsSelect';
import DetailCascade from './../employees/DetailCascade';
import ProjectOwner from './ProjectOwner';
import { setActionConfirmation, setActionConfirmationProgress, setActionConfirmationResult } from './../../actions/asyncActions';
import { connect } from 'react-redux';
import { translate } from 'react-translate';
import EditProjectDetails from './modals/EditProjectDetails';
import { bindActionCreators } from 'redux';
import * as projectsActions from "../../actions/projectsActions";
import TeamMember from './TeamMember';
import AddProjectOwner from './modals/AddProjectOwner';
import { SET_ACTION_CONFIRMATION_RESULT, ACTION_CONFIRMED } from '../../constants';
import AddEmployeeToProject from '../employees/modals/AddEmployeeToProject';
import AssignmentModal from './../assign/AssignmentModal';

class ProjectDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      confirmed: false,
      invalidated: false,
      projectLoadedSuccessfully: false,
      projectActive: false,
      edit: false,
      skills: [],
      showModal: false,
      capacityLevel: 1,
      seniorityLevel: 1,
      project: {},
      showEditProjectModal: false,
      showAddEmployee: false,
      addEmployeeStageTwo: false,
      addEmployeeSelectionId: {},
      pps_rb: {},
      showAddOwner: false,
      projectActions: bindActionCreators(projectsActions, this.props.dispatch),
      rowUnfurls: {}
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    let acceptableKeys = [
      'deleteProjectOwner',
      'closeProject',
      'reactivateProject',
      'deleteProject'
    ];
    if (this.validatePropsForAction(nextProps, "deleteProjectMember")) {
      this.props.dispatch(setActionConfirmationProgress(true));
      const { assignmentId } = this.props.toConfirm;
      DCMTWebApi.deleteAssignment(assignmentId)
        .then(response => {
          this.props.dispatch(setActionConfirmationResult({
            response
          }));
          this.refresh();
        })
        .catch(error => {
          this.props.dispatch(setActionConfirmationResult(error));
        });
    }
    if(nextProps.type === SET_ACTION_CONFIRMATION_RESULT){
      if(acceptableKeys.indexOf(this.props.toConfirm.key) >= 0){
        setTimeout(() => {
          this.refresh();
        }, 400);
      }
    }
  }

  refresh = () => {
    this.getProject(this.props.match.params.id);
  }

  validatePropsForAction(nextProps, action) {
    return (
      nextProps.confirmed &&
      !nextProps.isWorking &&
      nextProps.type === ACTION_CONFIRMED &&
      nextProps.toConfirm.key === action
    );
  }

  getProject = (id) => {
    DCMTWebApi.getProject(id)
      .then((response) => {
        console.log('PROJECT', response.data.dtoObject);
        this.setState({
          project: response.data.dtoObject,
          loading: false,
          projectLoadedSuccessfully: true,
          projectActive: response.data.dtoObject.isActive,
          skills: response.data.dtoObject.skills,
          team: (response.data.dtoObject.team !== undefined ?
            response.data.dtoObject.team : [])
        });
      })
      .catch((error) => {

      });
  }

  deleteProjectOwner = (owner, project) => {
    return (e) => {
      const { t, dispatch } = this.props;
      dispatch(
        setActionConfirmation(true, {
          key: "deleteProjectOwner",
          string: t("DeleteOwnerFuture", { ownerFullName: owner.fullName, projectName: project.name }),
          ownerId: owner.id,
          projectId: project.id,
          successMessage: t("OwnerHasBeenDeleted")
        })
      );
    };
  }

  saveSettings = () => {
    this.setState({
      loading: true
    });
    DCMTWebApi.putProjectSkills(this.props.match.params.id, this.state.skills)
      .then((response) => {
        this.setState({
          loading: false,
          pps_rb: {
            response
          },
          edit: false
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          pps_rb: error
        });
      });
  }

  handleSkillSelection = (newSkill) => {
    let duplicate = false;
    this.state.skills.map((skill, index) => {
      if(skill.skillId === newSkill.skillId) duplicate = true;
    });

    if(duplicate) return false;

    let copy = this.state.skills;
    copy.push(newSkill);
    this.setState({
      skills: copy,
      changesMade: true
    });

    return true;
  }

  handleSkillEdit = (updatedSkillObject, deletion = false) => {
    let { skills } = this.state;
    this.state.skills.forEach((skill, index) => {
      if(skill.skillName === undefined){
        skill = {
          skillName: skill.name,
          skillId: skill.id
        };
      }
      if(skill.skillId === updatedSkillObject.skillId){
        if(deletion) {
          skills.splice(index, 1);
        }
        else {
          skills[index] = updatedSkillObject;
        }

        this.setState({
          skills,
          changesMade: true
        });
      }
    });
  }

  handleRangeChange = (skillObject) => {
    return (event) => {
      let { skills } = this.state;
      skills.forEach((skill, index) => {
        // backend fixes!
        if(skill.skillName === undefined){
          skill = {
            skillName: skill.name,
            skillId: skill.id
          };
        }
        if(skillObject.skillName === undefined){
          skillObject = {
            skillName: skillObject.name,
            skillId: skillObject.id
          };
        }
        if(skill.skillId === skillObject.skillId){
          skills[index].yearsOfExperience = event.target.value - 0;
          this.setState({
            skills,
            changesMade: true
          });
        }
      });
    };
  }

  getYearsOfExperience = (index) => {
    if(this.state.skills[index].yearsOfExperience !== undefined)
      return this.state.skills[index].yearsOfExperience;
    else return 0;
  }

  handleCloseModal = () => {
    this.setState({ showModal: false });
  }

  handleEditProjectCloseModal = (success = false) => {
    this.setState({ showEditProjectModal: false }, () => {
      if(success) this.refresh();
    });
  }

  add = () => {
    this.setState({ showModal: true });
  }

  save = () => {
    this.saveSettings();
  }

  confirm = () => {
    this.saveSettings();
  }

  changeSettings = () => {
    this.setState({
      showEditProjectModal: true
    });
  }

  cancel = () => {
    this.setState({
      edit: false
    });
  }

  edit = () => {
    this.setState({
      confirmed: false,
      edit: true
    });
  }

  handleOpenAddOwner = () => {
    this.setState({ showAddOwner: true });
  }

  handleCloseAddOwner = (success = false) => {
    this.setState({ showAddOwner: false }, () => {
      this.refresh();
    });
  }

  handleOpenAddEmployee = () => {
    this.setState({ showAddEmployee: true, addEmployeeStageTwo: false, addEmployeeSelectionId: "" });
  }

  handleCloseAddEmployee = (success = false) => {
    this.setState({ showAddEmployee: false, addEmployeeStageTwo: false });
  }

  mapSkills = (skills, editable = false) => {
    return skills.map((skillObject, index) => {
      return (
        <SkillRow
          key={index}
          skill={skillObject}
          handleSkillEdit={this.handleSkillEdit}
          editable={this.state.edit}
          showYoe={false}
        />
      );
    });
  }

  handleRowClick = (object, index) => {
    return (e) => {
      const { rowUnfurls } = this.state;

      if(rowUnfurls[index] === undefined){
        rowUnfurls[index] = true;
      } else {
        rowUnfurls[index] = !rowUnfurls[index];
      }

      this.setState({
        rowUnfurls
      });
    };
  }

  deleteMember = (assignment) => (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    this.props.dispatch(
      setActionConfirmation(true, {
        key: "deleteProjectMember",
        string: `Chcesz wypisać ${assignment.firstName} ${assignment.lastName} z projektu ${this.state.project.name}`,
        assignmentId: assignment.assignmentId,
        successMessage: "Wypisano pracownika"
      })
    );
  }

  mapTeam = (team) => {
    return team.map((teamAssignment, index) => {
      let unfurled = this.state.rowUnfurls[index];
      return (
        [
          <TeamMember
            onClick={this.handleRowClick(teamAssignment, index)}
            compact
            key={index}
            assignment={teamAssignment}
            delete={this.deleteMember}
          />,
          unfurled ? <TeamMember
            onClick={this.handleRowClick(teamAssignment, index)}
            key={50000 - index}
            assignment={teamAssignment}
          /> : null
        ]
      );
    });
  }

  mapOwners = (owners, project) => {
    return [
      ... owners.map((owner, index) => {
        return <ProjectOwner clickAction={this.deleteProjectOwner(owner, project)} key={index} owner={owner}/>;
      }),
      <div key={-1} className="project-owner">
        <span onClick={this.handleOpenAddOwner} className="project-owner-add">
          <span/>
        </span>
      </div>
    ];
  }

  handleOwnerSelectionFinale = (success) => {
    this.handleCloseAddOwner(success);
  }

  reactivateProject = () => {
    const { t, dispatch } = this.props;
    dispatch(
      setActionConfirmation(true, {
        key: "reactivateProject",
        string: `${t("ReactivateProjectInfinitive")} ${this.state.project.name}`,
        id: this.state.project.id,
        successMessage: t("ProjectReactivated")
      })
    );
  }

  deleteProject = () => {
    const { t, dispatch } = this.props;
    dispatch(
      setActionConfirmation(true, {
        key: "deleteProject",
        string: `${t("DeleteProjectInfinitive")} ${this.state.project.name}`,
        id: this.state.project.id,
        successMessage: t("ProjectDeleted")
      })
    );
  }

  closeProject = () => {
    const { t, dispatch } = this.props;
    dispatch(
      setActionConfirmation(true, {
        key: "closeProject",
        string: `${t("CloseProjectInfinitive")} ${this.state.project.name}`,
        id: this.state.project.id,
        successMessage: t("ProjectClosed")
      })
    );
  }

  addEmployeeStageTwo = (employee) => {
    console.log(employee);
    this.setState({
      addEmployeeStageTwo: true,
      addEmployeeSelection: employee
    });
  }

  pullProjectEditModalDOM = () => {
    return <Modal
      open={this.state.showEditProjectModal}
      classNames={{ modal: "Modal Modal-projects" }}
      contentLabel="Edit projects details"
      onClose={this.handleEditProjectCloseModal}
    >
      <EditProjectDetails
        closeModal={this.handleEditProjectCloseModal}
        project={this.state.project}
        responseBlock={this.state.responseBlock}
        loading={this.state.loading}
        projectActions={this.props.projectActions}
        limit={this.state.limit}
        currentPage={this.state.currentPage}
        updateProjectsOnSuccess={false}
      />
    </Modal>;
  }

  pullAddOwnerModalDOM = () => {
    return <Modal
      open={this.state.showAddOwner}
      classNames={{ modal: "Modal Modal-add-owner" }}
      contentLabel="Add owner modal"
      onClose={this.handleCloseAddOwner}
    >
      <AddProjectOwner project={this.state.project} completed={this.handleOwnerSelectionFinale}/>
    </Modal>;
  }

  pullAddEmployeeModalDOM = () => {
    return <Modal
      open={this.state.showAddEmployee}
      classNames={{ modal: "Modal Modal-add-employee Modal-assignment" }}
      contentLabel="Add employee modal"
      onClose={this.handleCloseAddEmployee}
    >
      {
        this.state.addEmployeeStageTwo ?
        <AssignmentModal
          employee={this.state.addEmployeeSelection}
          project={this.state.project}
          refresh={this.refresh}
        />
        :
        <AddEmployeeToProject
          aetpStageTwo={this.addEmployeeStageTwo}
          project={this.state.project}
          completed={this.handleOwnerSelectionFinale}
        />
      }

    </Modal>;
  }

  pullModalDOM = () => {
    return <Modal
        open={this.state.showModal}
        classNames={{ modal: "Modal Modal-skills" }}
        contentLabel="Skills modal"
        onClose={this.handleCloseModal}
      >
      <SkillsSelect alreadySelected={this.state.skills} skillSelected={this.handleSkillSelection} />
    </Modal>;
  }

  pullEmployeeIdBlockDOM = () => {
    const { t } = this.props;
    const { project } = this.state;
    return <div className="col-xl-4 col-sm-12 project-id-block button-group">
      <Icon icon="briefcase" iconSize="2x"/>
      <h1>{project.name}</h1>
      {
        this.state.projectActive ?
          <h3 className="project-active">{t("Active")}</h3>
        : <h3 className="project-inactive">{t("Inactive")}</h3>
      }
      <hr className="sharp"/>
      <button onClick={this.changeSettings} className="project-headway dcmt-button button-success">{t("EditProject")}</button>
      {
        this.state.project.isActive ?
        <button onClick={this.closeProject} title={t("Close")} className="project-headway dcmt-button button-lowkey">{t("Close")}</button>
        : <button onClick={this.reactivateProject} title={t("Reactivate")} className="project-headway dcmt-button button-success">{t("Reactivate")}</button>
      }
      {
        this.state.project.isDeleted ?
        null
        : <button onClick={this.deleteProject} title={t("Delete")} className="project-headway dcmt-button button-lowkey">{t("Delete")}</button>
      }
      <hr/>
      <div className="project-headway">
        <div className="project-headway project-bold">{t("Overview")}</div>
        <DetailCascade lKey={t("Client")} rVal={project.client} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("Deleted")} rVal={project.isDeleted ? t("Yes") : t("No")} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("Active")} rVal={project.isActive ? t("Yes") : t("No")} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("StartDate")} rVal={project.startDate} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("EstimatedEndDate")} rVal={project.estimatedEndDate} lColSize={4} rColSize={8} />
      </div>
      <hr/>
      <div className="project-headway project-text-justified">
        <div className="project-headway project-bold">{t("ResponsiblePerson")}</div>
        <DetailCascade lKey={t("Name")} rVal={project.responsiblePerson.firstName} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("Surname")} rVal={project.responsiblePerson.lastName} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("PhoneNumber")} rVal={project.responsiblePerson.phoneNumber} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("Email")} rVal={project.responsiblePerson.email} lColSize={4} rColSize={8} />
        <DetailCascade lKey={t("Client")} rVal={project.responsiblePerson.client} lColSize={4} rColSize={8} />
      </div>
      <hr/>
      <div className="project-headway">
        <div className="project-headway project-bold">{t("Owners")}</div>
        {this.mapOwners(this.state.project.owners, this.state.project)}
      </div>
      <div className="project-headway project-text-justified">
        <div className="project-headway project-bold">{t("Description")}</div>
        <div>
          {project.description}
        </div>
      </div>
    </div>;
  }

  pullEditToolbarDOM = () => {
    const { t } = this.props;
    return <div>
      {
        this.state.employeeActive ?
        <button onClick={this.cancel} className="dcmt-button">
          {t("Cancel")}
        </button>
        : null
      }
      <button onClick={this.add} className="dcmt-button button-success">
        {t("Add")}
      </button>
      <button onClick={this.save} className="dcmt-button button-success">
        {t("Save")}
      </button>
    </div>;
  }

  pullDOM = () => {
    const { project } = this.state;
    const { t } = this.props;
    return <div className="row">
      { this.state.projectLoadedSuccessfully ? this.pullEmployeeIdBlockDOM() : null }
      <div className="col-xl-8 col-sm-12 project-headway">
        <div className="row">
          <div className="col-sm-12">
            <div className="project-headway project-bold">{'Zespół'}</div>
            <table className="team-member-compact-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Capacity</th>
                  <th>Role</th>
                  <th>Seniority</th>
                  <th>Position</th>
                  <th>Ends</th>
                  <th>!</th>
                </tr>
              </thead>
              <tbody>
                {this.mapTeam(this.state.team)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-10"/>
          <div className="col-lg-2 full-width-button">
            <button onClick={this.handleOpenAddEmployee} className="dcmt-button button-success project-headway">
              {'Dodaj'}
            </button>
          </div>
        </div>
        <hr/>
        <div className="project-headway project-bold">{'Umiejętności powiązane'}</div>
        <div className="row">
          <div className="col-xl-10 col-sm-12">
            {this.mapSkills(this.state.skills)}
          </div>
          <div className="col-xl-2 col-sm-12 full-width-button">
          {
            this.state.edit === false ?
            <button onClick={this.edit} className="dcmt-button">
              {t("Edit")}
            </button>
            :
            this.pullEditToolbarDOM()
          }
          </div>
        </div>
      </div>
    </div>;
  };

  render() {
    return (
      <div className="content-container project-detail-container">
        { this.pullModalDOM() }
        { this.pullProjectEditModalDOM() }
        { this.pullAddOwnerModalDOM() }
        { this.pullAddEmployeeModalDOM() }
        { this.state.loading ? <LoaderCircular/> : this.pullDOM() }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: state.asyncReducer.loading,
    confirmed: state.asyncReducer.confirmed,
    toConfirm: state.asyncReducer.toConfirm,
    isWorking: state.asyncReducer.isWorking,
    resultBlock: state.asyncReducer.resultBlock,
    type: state.asyncReducer.type
  };
}

export default connect(mapStateToProps)(withRouter(translate("ProjectDetailContainer")(ProjectDetailContainer)));
