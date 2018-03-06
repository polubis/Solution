import React, { Component } from "react";
import "../../scss/components/users/FoundUsersTable.scss";

class FoundUsersTable extends Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(userObject) {
    this.props.setSelectedUser(userObject);
  }

  render() {
    const tableData = this.props.foundUsers.map((item, index) => (
      <tr key={item.id} onClick={event => this.handleOnClick(item, event)}>
        <td id={item.id}>{item.firstName}</td>
        <td id={item.id}>{item.lastName}</td>
      </tr>
    ));

    return (
      <div className="found-users-wrapper">
        <div>
          <span>Imię</span>
          <span>Nazwisko</span>
        </div>
        <div className="found-users-container">
          <table>
            <tbody>{tableData}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default FoundUsersTable;
