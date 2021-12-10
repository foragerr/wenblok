import React from "react";

import Button from "@material-ui/core/Button";


export default function Modal({showModal, setShowModal}) {

  console.log(showModal, setShowModal)

  if (showModal === false) return null 

  return (
    <div>
      <div>Hello Modal {showModal.toString()}</div>

      <div>
        <Button
          variant = "contained"
          onClick={e => {
            setShowModal(false)
          }}
        > Close
        </Button>
      </div>

    </div>
  );
}
