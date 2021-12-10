import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";

import styles from "assets/adminStyle.js";
import Blocklist from "components/Blocklist/Blocklist";


const useStyles = makeStyles(styles);

export default function MainPanel() {

  const [ showModal , setShowModal ] = useState(false);
  const classes = useStyles();

  return (
    <div className={classes.content}>

      <Blocklist 
        showModal={showModal}
        setShowModal={setShowModal}/>

    </div>
  );
}