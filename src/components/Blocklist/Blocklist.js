import React, { useState, useEffect } from "react";
import Moment from "react-moment";
import moment from 'moment';
import {  Configuration, BlocksApi } from "@stacks/blockchain-api-client";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import LocalOffer from "@material-ui/icons/LocalOffer";
import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank"
import WatchOutlined from "@material-ui/icons/WatchOutlined"
import WifiTetheringOutlined from "@material-ui/icons/WifiTetheringOutlined"
import LoopOutlined from "@material-ui/icons/LoopOutlined"
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';


// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardIcon from "components/Card/CardIcon.js";
import CardFooter from "components/Card/CardFooter.js";

import styles from "assets/dashboardStyle.js";


function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', paddingLeft: '5%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body1" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

const whenis = function (blockheight, currentBlock, now) {
  var deltaBlocks = blockheight - currentBlock.height;
  var deltaTime = deltaBlocks * 60 * 10 * 1000;
  var localUnixTime = currentBlock.burn_block_time * 1000;
  var date = new Date(localUnixTime + deltaTime)
  return moment(date).fromNow() + " at " + date.toLocaleString()
}

const isPast = function (blockheight, currentBlock) {
  return blockheight > currentBlock.height
}

const useStyles = makeStyles(styles);

export default function BlockList({showModal, setShowModal}) {

  const [ futureBlocks , setFutureBlocks ] = useState(null);
  const [ pastBlocks, setPastBlocks ] = useState(null);
  const [ currentBlockheight, setCurrentBlockheight ] = useState('');

  const [ nycCycle, setNycCycle ] = useState(0)
  const [ nycCycleStart, setNycCycleStart ] = useState(0)
  const [ nycCycleEnd, setNycCycleEnd ] = useState(0)
  const [ nycCyclePercentComplete, setNycCyclePercentComplete] = useState(0)

  const [ miaCycle, setMiaCycle ] = useState(0)
  const [ miaCycleStart, setMiaCycleStart ] = useState(0)
  const [ miaCycleEnd, setMiaCycleEnd ] = useState(0)
  const [ miaCyclePercentComplete, setMiaCyclePercentComplete] = useState(0)

  const [ now ] = useState(new Date())

  const classes = useStyles();

  useEffect(() => {

    var apiConfig = new Configuration({
      fetchApi: fetch,
      basePath: process.env.REACT_APP_STX_API_ENDPOINT,
    });

    var blocksApi = new BlocksApi(apiConfig);

    // Load blocks
    fetch('https://raw.githubusercontent.com/foragerr/wenblok/main/blocks.json')
      .then(response => response.json())
      .then(responseJson => {

        responseJson.sort(function(a, b) {
          return a.blockheight - b.blockheight
        });
      
        blocksApi
        .getBlockList({ offset: 0, limit: 1 })
        .then(blockList => 
          {

            var currentBlock = blockList.results[0];
            setCurrentBlockheight(currentBlock.height);

            
            var cycleSize = 2100

            var nycStartingBlock = 37449
            var nycCurrentCycle = Math.floor((parseInt(currentBlock.height) - nycStartingBlock) / cycleSize)
            var nycCycleStartingBlock = nycStartingBlock + nycCurrentCycle * cycleSize
            var nycCycleEndBlock = nycStartingBlock - 1 + (nycCurrentCycle + 1) * cycleSize

            var miaStartingBlock = 24497
            var miaCurrentCycle = Math.floor((parseInt(currentBlock.height) - miaStartingBlock) / cycleSize)
            var miaCycleStartingBlock = miaStartingBlock + miaCurrentCycle * cycleSize
            var miaCycleEndBlock = miaStartingBlock - 1 + (miaCurrentCycle + 1) * cycleSize

            setNycCycle(nycCurrentCycle)
            setNycCycleStart(nycCycleStartingBlock)
            setNycCycleEnd(nycCycleEndBlock)
            setNycCyclePercentComplete(((currentBlock.height - nycCycleStartingBlock) * 100) / (nycCycleEndBlock - nycCycleStartingBlock))

            setMiaCycle(miaCurrentCycle)
            setMiaCycleStart(miaCycleStartingBlock)
            setMiaCycleEnd(miaCycleEndBlock)
            setMiaCyclePercentComplete(((currentBlock.height - miaCycleStartingBlock) * 100) / (miaCycleEndBlock - miaCycleStartingBlock))

            setFutureBlocks(
              responseJson.flatMap ( 
                x => (
                  isPast(x.blockheight, currentBlock) ? { ...x, when: whenis(x.blockheight, currentBlock, now), past: isPast(x.blockheight, currentBlock) }
                  : []
                )
              ) 
            );

            setPastBlocks(
              responseJson.flatMap ( 
                x => (
                  !isPast(x.blockheight, currentBlock) ? { ...x, when: whenis(x.blockheight, currentBlock, now), past: isPast(x.blockheight, currentBlock) }
                  : []
                )
              ) 
            );

          }
        );
        

      })
      .catch(function(err) {
        console.log('Fetch Error:', err);
      });

  }, [now]);

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={3} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <CheckBoxOutlineBlank />
              </CardIcon>
              <p className={classes.cardCategory}>Current STX Block</p>
              <div className={classes.cardTitle}>
                <h3>{currentBlockheight}</h3>
              </div>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <WifiTetheringOutlined />
                Refreshed from&nbsp; <a href="https://explorer.stacks.co/blocks?chain=mainnet">Stacks mainnet</a> &nbsp;
                <Moment fromNow>{now.toISOString()}</Moment>
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={3} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <LoopOutlined />
              </CardIcon>
              <p className={classes.cardCategory}>Current NYC Cycle</p>
              <div className={classes.cardTitle}>
                <h3>{nycCycle}</h3>
              </div>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}> {nycCycleStart} </div>
              <Box sx={{ width: '100%' }}>
                <LinearProgressWithLabel value={nycCyclePercentComplete} />
              </Box>
              <div className={classes.stats}> {nycCycleEnd} </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={3} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <LoopOutlined />
              </CardIcon>
              <p className={classes.cardCategory}>Current MIA Cycle</p>
              <div className={classes.cardTitle}>
                <h3>{miaCycle}</h3>
              </div>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}> {miaCycleStart} </div>
              <Box sx={{ width: '100%' }}>
                <LinearProgressWithLabel value={miaCyclePercentComplete} />
              </Box>
              <div className={classes.stats}> {miaCycleEnd} </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={3} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <WatchOutlined />
              </CardIcon>
              <p className={classes.cardCategory}>Your Timezone</p>
              <div className={classes.cardTitle}>
                <h3>{Intl.DateTimeFormat().resolvedOptions().timeZone}</h3>
              </div>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                TODO: Make timezone selectable via drop down
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="rose">
              <div width="100px" className={classes.floatleft} >
                <h2 className={classes.cardTitleWhite}>Upcoming Events</h2>
                <p className={classes.cardCategoryWhite}>
                  Disclaimer: Best effort estimates
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="rose"
                tableHead={["Block#", "Event", "WEN BLOK !?"]}
                tableData={
                  futureBlocks == null ? [['Loading...', 'Loading...', 'Loading...']] :
                    futureBlocks.map( 
                      x => [x.blockheight.toString(), x.event, x.when] 
                    )
                }
              />
            </CardBody>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="success">
              <h2 className={classes.cardTitleWhite}>Past Events</h2>
              <p className={classes.cardCategoryWhite}>
                This too shall pass
              </p>
            </CardHeader>
            <CardBody>
            <Table
                tableHeaderColor="success"
                tableHead={["Block#", "Event", "WEN BLOK !?"]}
                tableData={
                  pastBlocks == null ? [['Loading...', 'Loading...', 'Loading...']] :
                    pastBlocks.map( 
                      x => [x.blockheight.toString(), x.event, x.when] 
                    ).reverse()
                }
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
