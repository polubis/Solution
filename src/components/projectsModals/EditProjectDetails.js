import React, { Component } from "react";
import LoaderHorizontal from "./../common/LoaderHorizontal";
import ResultBlock from "./../common/ResultBlock";
import ProjectDetailsBlock from "./ProjectDetailsBlock";
import DCMTWebApi from "../../api";

class EditProjectDetails extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  editProject = project => {
    DCMTWebApi.editProject(project)
      .then(response => {
        this.props.projectActions.loadProjects(
          this.props.currentPage,
          this.props.limit
        );
        this.setState({
          errorBlock: { response },
          isLoading: false
        });
        setTimeout(() => {
          this.props.closeModal();
        }, 500);
      })
      .catch(errorBlock => {
        this.setState({
          errorBlock,
          isLoading: false
        });
      });
  };

  render() {
    return (
      <div>
        <ProjectDetailsBlock
          project={this.props.project}
          editable={true}
          projectActions={this.props.projectActions}
          limit={this.state.limit}
          currentPage={this.state.currentPage}
          editProject={this.editProject}
        />

        <ResultBlock
          errorOnly={false}
          successMessage="Projekt edytowano pomyślnie"
          errorBlock={this.props.responseBlock}
        />
        <br />
        <div>{this.props.loading && <LoaderHorizontal />}</div>
      </div>
    );
  }
}

export default EditProjectDetails;
