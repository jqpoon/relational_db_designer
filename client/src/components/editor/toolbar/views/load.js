import { useEffect, useState } from "react";
import { submitHandler } from "../../utilities/alert";
import { getErids, loadERD } from "../../utilities/backendUtils";
import "../toolbar.css";

export function Load({ user, importERD, backToNormal }) {
  // List of ERDs owned by user, retrieved from backend on mount
  const [erids, setErids] = useState(null);
  useEffect(() => {
    getErids(user, setErids);
  }, [user]);

  const eridBlock = ({ name, erid }) => {
    const submitToLoad = () =>
      submitHandler(
        () => loadERD({ user, erid, importERD, backToNormal }),
        `ERD (name: ${name}) will be loaded`
      );
    return (
      <div className="action" onClick={submitToLoad}>
        {name}
      </div>
    );
  };

  return (
    <div className="toolbar-right">
      <h3 className="toolbar-header">Load ERD</h3>
      <div style={{ margin: "0px 5px" }}>
        {erids === null ? (
          <p className="load-text">Loading...</p>
        ) : erids.length === 0 ? (
          <p className="load-text">No ERDs to load</p>
        ) : (
          erids.map((e) => eridBlock(e))
        )}
      </div>
    </div>
  );
}