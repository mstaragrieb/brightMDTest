import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import { Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import HoursOne from './HoursOne'
import HoursTwo from './HoursTwo'
import HoursAdmin from './HoursAdmin'


export default function Dashboard() {
  const theme = useTheme()

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 240,
    },
  }))
  const classes = useStyles(theme)
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)

  return (
    <React.Fragment>
      <Grid container spacing={4}>
        {/* HoursOne  */}
        <Grid item xs={12} md={8} lg={7}>
          <Paper className={fixedHeightPaper}>
            <HoursOne />
          </Paper>
        </Grid>
        {/* HoursTwo */}
        <Grid item xs={12} md={4} lg={5}>
          <Paper className={fixedHeightPaper}>
            <HoursTwo />
          </Paper>
        </Grid>
        {/* HoursAdmin */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <HoursAdmin />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}
