import React, { useEffect, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import { getSharedList, ping } from "../../utilities/backendUtils";

export default function Share({ user, erid, backToNormal }) {
  const [users, setUsers] = useState(null);

  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("READ");

  useEffect(() => {
    getSharedList(erid, setUsers);
  }, []);

  const getMessageFromPermission = (email, permission) => {
    if (permission === "REMOVE") {
      return `Permission for ${email} will be removed`;
    }
    return `${email} will be given ${permission} permission`;
  };

  const givePermission = (email, permission) => {
    confirmAlert({
      title: "Confirmation",
      message: getMessageFromPermission(email, permission),
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            ping(user, erid, email.trim(), permission, () =>
              getSharedList(erid, setUsers)
            ),
        },
        {
          label: "No",
        },
      ],
    });
  };

  const handleSubmit = (e, email, permission) => {
    e.preventDefault();
    if (email === "") return;
    givePermission(email, permission);
    setEmail("");
  };

  const userBlock = ({ email, permission }) => {
    return (
      <div className="permission-block">
        <div className="user-block">
          <p>{email}</p>
          <p>{permission}</p>
        </div>
        {permission !== "OWNER" ? (
          <button
            className="remove-permission-btn"
            onClick={() => givePermission(email, "REMOVE")}
          >
            Remove
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="toolbar-right">
      <h3 className="toolbar-header">Share ERD</h3>
      <form
        className="share-form-wrapper"
        onSubmit={(e) => handleSubmit(e, email, permission)}
      >
        <div className="share-form">
          <input
            className="share-email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="share-permission"
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="READ">Read</option>
            <option value="READ-WRITE">Read-write</option>
          </select>
        </div>
        <div className="share-btn-wrapper">
          <button>Update</button>
        </div>
      </form>
      {users === null ? (
        <p className="load-text">Loading...</p>
      ) : (
        users.map((x) => userBlock(x))
      )}
    </div>
  );
}
