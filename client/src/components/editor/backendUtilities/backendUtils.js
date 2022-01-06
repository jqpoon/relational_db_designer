import axios from "axios";
import { actions } from "../types";

export const duplicateERD = async ({ user, erid, exportERD, importERD }) => {
  try {
    const erd = exportERD();
    erd.name = "Copy of " + erd.name;
    const response = await axios.post(
      `/api/collab/create-duplicate?Uid=${user}&ERid=${erid}`,
      erd
    );
    const duplicateERid = await response.data;
    erd.erid = duplicateERid;
    importERD(erd);
    alert("ERD has been succesfully duplicated and loaded");
  } catch (error) {
    alert(error.response.data);
  }
};

export const deleteERDInBackEnd = async ({ user, erid, resetERD }) => {
  try {
    const response = await axios.delete(`/api/erd?Uid=${user}&ERid=${erid}`);
    resetERD();
    alert(response.data);
  } catch (error) {
    alert(error.response.data);
  }
};

export const saveERDToBackEnd = async ({
  user,
  erid,
  exportERD,
  setErid,
}) => {
  try {
    const req = `/api/erd?Uid=${user}` + erid ? `&ERid=${erid}` : ``;
    const res = await axios.put(req, exportERD());
    const data = await res.data;
    if (!erid) {
      setErid(data);
      alert(`ERD succesfully created: ${data}`);
    } else {
      alert(`ERD succesfully saved: ${data}`);
    }
  } catch (error) {
    alert(error.response.data);
  }
};

const createERD = async ({ user, exportERD, setErid }) => {
  try {
    const res = await axios.post(`/api/erd?Uid=${user}`, exportERD());
    const erid = await res.data;
    setErid(erid);
    alert("ERD successfully created");
  } catch (error) {
    alert(error.response.data);
  }
};

const updateERD = async ({ user, erid, exportERD }) => {
  try {
    const res = await axios.put(
      `/api/erd?Uid=${user}&ERid=${erid}`,
      exportERD()
    );
    const data = await res.data;
    alert(data);
  } catch (error) {
    alert(error.response.data);
  }
};

export const translateERtoRelational = ({exportERD, setContext}) => {
  axios
    .post("/translation/translate", exportERD())
    .then(function (response) {
      setContext({
        action: actions.TRANSLATE,
        tables: response.data.translatedtables.tables,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};
