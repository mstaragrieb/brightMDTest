import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Title from './Title'
import { useQuery, gql } from '@apollo/client'

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  navLink: {
    textDecoration: 'none',
  },
})
// Replace with Variable stuff
const GET_RECENT_REVIEWS_QUERY = gql`
{
  Hospital(name:"Bright.MD", orderBy: name_desc) {
    has_special{
      name
      date
      hours
    }
    in_zone{
      name
      standardHours
      standardOperator
      deviation
      has_deviation{
        name
        fromNormalHours
        fromNormalOperator
        startDate
        endDate
      }
    }
    name
    hours_mon
    hours_tues
    hours_wed
    hours_thurs
    hours_fri
    hours_sat
    hours_sun
  }
}
`
/*
* // TODO: Figure out Moracco
While most countries that change clocks for daylight saving time observe standard time in winter and DST in summer, Morocco observes (since 2019) daylight saving time every month but Ramadan. During the holy month (the date of which is determined by the lunar calendar and thus moves annually with regard to the Gregorian calendar), the country's civil clocks observe Western European Time (UTC+00:00, which geographically overlaps most of the nation). At the close of this month, its clocks are turned forward to Western European Summer Time (UTC+01:00), where they remain until the return of the holy month the following year.[46][47][48]
*/
export default function HoursOne() {
  const classes = useStyles()

  const { loading, error, data } = useQuery(GET_RECENT_REVIEWS_QUERY)
  //console.log(data);

  const processHours = (times: string, zone: object) => {
    // TODO CHECK SPECIAL HOURS AND RETURN IF TRUE

    const timesArr = times.split(", ")
    if (timesArr.length === 1){
      return "24 Hours"
    }
    //console.log(timesArr);
    const startTimeUTC = timesArr[0]
    const endTimeUTC = timesArr[1]

    let timeZoneHours = zone.standardHours
    let timeZoneOperator = zone.standardOperator

    // Format Date for Display
    const formatDate = (date: Date) => {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime
    }

    // TODO Move to function?
    let isDevation = false;
    if (zone.deviation !== ""){
      //console.log(zone.has_deviation);
      const dateTodayObj = new Date();
      const c = [dateTodayObj.getDate(), dateTodayObj.getMonth()+1, dateTodayObj.getFullYear()]
      const d1 = zone.has_deviation[0].startDate.split("/");
      d1.push(dateTodayObj.getFullYear())
      const d2 = zone.has_deviation[0].endDate.split("/");
      d2.push(dateTodayObj.getFullYear())

      var from = new Date(d1[2], parseInt(d1[0])-1, d1[1]);  // -1 because months are from 0 to 11
      var to   = new Date(d2[2], parseInt(d2[0])-1, d2[1]);
      var check = new Date(c[2], parseInt(c[1])-1, c[0]);

      isDevation = check > from && check < to
    }
    if (isDevation){
      //possibly forEach this if ever add multiple deviations.
      //timeZoneHours = zone.has_deviation[0]
      if (timeZoneOperator === "-"){
        if (zone.has_deviation[0].fromNormalOperator === "-"){
          timeZoneHours = timeZoneHours + zone.has_deviation[0].fromNormalHours
        }else{
          timeZoneHours = timeZoneHours - zone.has_deviation[0].fromNormalHours
        }
      }else{
        if (zone.has_deviation[0].fromNormalOperator === "-"){
          timeZoneHours = timeZoneHours - zone.has_deviation[0].fromNormalHours
        }else{
          timeZoneHours = timeZoneHours + zone.has_deviation[0].fromNormalHours
        }
      }
    }

    const convertedStartTime = convertTime(startTimeUTC, timeZoneOperator, timeZoneHours)
    const convertedEndTime = convertTime(endTimeUTC, timeZoneOperator, timeZoneHours)
    return formatDate(convertedStartTime) + " - " + formatDate(convertedEndTime);
  }



  // Convert UTC Hours to Hospital Timze Zone
  const convertTime = (time: string, operator: string, zone: number) => {
    let timeArray = time.split(":")
    //const dateObj = new Date(dates)
    // console.log(timeArray)
    // console.log(operator)
    // console.log(zone)

    const dateObj = new Date()
    if (operator === "-"){
      dateObj.setHours(parseInt(timeArray[0]) - zone)
      dateObj.setMinutes(parseInt(timeArray[1]))
      dateObj.setSeconds(parseInt(timeArray[2]))
    }else{
      dateObj.setHours(timeArray[0] + zone)
      dateObj.setMinutes(timeArray[1])
      dateObj.setSeconds(timeArray[2])
    }
    return dateObj
  }

if (error) return <p>Error</p>
if (loading) return <p>Loading</p>
  return (
    <React.Fragment>
      <Title>Total Users</Title>
      <Typography component="p" variant="h4">
        {data.Hospital[0].name}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        Hours of Operation
      </Typography>
      <Typography>
        All times {data.Hospital[0].in_zone[0].name}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        Monday: {processHours(data.Hospital[0].hours_mon,data.Hospital[0].in_zone[0])}  <br />
        Tuesday: {processHours(data.Hospital[0].hours_tues,data.Hospital[0].in_zone[0])}  <br />
        Wednesday: {processHours(data.Hospital[0].hours_wed,data.Hospital[0].in_zone[0])}  <br />
        Thursday: {processHours(data.Hospital[0].hours_thurs,data.Hospital[0].in_zone[0])}  <br />
        Friday: {processHours(data.Hospital[0].hours_fri,data.Hospital[0].in_zone[0])}  <br />
        Saturday: {processHours(data.Hospital[0].hours_sat,data.Hospital[0].in_zone[0])}  <br />
        Sunday: {processHours(data.Hospital[0].hours_sun,data.Hospital[0].in_zone[0])}
      </Typography>
      <div>
        <Link to="/hours_admin" className={classes.navLink}>
          Change Hours of Operation
        </Link>
      </div>
    </React.Fragment>
  )
}
