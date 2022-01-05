import { confirmAlert } from 'react-confirm-alert';

export const submitHandler = (action, message) => {
  confirmAlert({
    title: "Confirmation",
    message,
    buttons: [
      {
        label: "Yes",
        onClick: action,
      },
      {
        label: "No",
      },
    ],
  });
};
