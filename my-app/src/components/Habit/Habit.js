import React, { Component } from 'react'
import ActivityCalendar from 'react-activity-calendar'


const SCREEN_WIDTH = 850

class Habit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataPoints: [],
      isMounted: false,
    }
  }

  getDaysOfYear = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const yyyy = tomorrow.getFullYear()
    const day = today.getDay()
    const numDaysToFetch =
      Math.min(window.screen.width, window.innerWidth) > SCREEN_WIDTH
        ? 365 + day
        : 120 + day
    var daysOfYear = []
    for (
      var d = new Date(yyyy - 2, mm, dd);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      daysOfYear.push({
        count: 0,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(d.getDate()).padStart(2, '0')}`,
        level: 0,
      })
    }
    // return daysOfYear.slice(-numDaysToFetch,-1)
    return daysOfYear
  }

  getNewEntries = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const day = today.getDay()
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const yyyy = tomorrow.getFullYear()
    const yyyymmdd = `${yyyy}-${mm}-${dd}`
    const numDaysToFetch =
      Math.min(window.screen.width, window.innerWidth) > SCREEN_WIDTH
        ? 365 + day
        : 120 + day
    var james = 'james'
    var url =
      process.env.REACT_APP_GET_HABIT_DATA_URL +
      `?user=${james}&PK1=${this.props.habitName}&limit=${numDaysToFetch}&startkey=${yyyymmdd}`
    var daysOfYear = this.getDaysOfYear()
    fetch(url, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        const dataItems = data.Items.map((item) => {
          return {
            count: parseInt(item.DATE_COUNT.S),
            date: item.SK1.S.slice(5),
            level: Math.min(parseInt(item.DATE_LEVEL.S), 4),
          }
        })
        //dataItems.reverse()
        dataItems.map((item) => {
          daysOfYear.forEach((dayOfYear) => {
            if (item.date === dayOfYear.date) {
              dayOfYear.count = item.count
              dayOfYear.level = item.level
            }
          })
        })
        const newState = { dataPoints: [...daysOfYear], isMounted: true }
        //const newState = { dataPoints: [...dataItems], isMounted: true }
        this.setState(newState)
      })
  }

  resize = () => this.forceUpdate()

  componentDidMount() {
    window.addEventListener('resize', this.resize)
    this.getNewEntries()
  }

  getTitle = (habitName) =>
    habitName.charAt(0).toUpperCase() + habitName.replaceAll('-', ' ').slice(1)
  
  render() {
    const day = new Date().getDay()
    const numDaysToFetch =
      Math.min(window.screen.width, window.innerWidth) > SCREEN_WIDTH
        ? 365 + day
        : 120 + day

    console.log(this.props.habitName.toLowerCase().includes('github'))
    const mytheme = this.props.habitName.toLowerCase().includes('github')
      ? {
          level0: '#EBEDF0',
          level1: '#9BE9A8',
          level2: '#40C463',
          level3: '#30A14E',
          level4: '#216E39',
        }
      : null


    return (
      <div className="habit">
        <h3>{this.getTitle(this.props.habitName)}</h3>
        <div className="commit-graph">
          {this.state.isMounted && (
            <ActivityCalendar
              color={this.props.habitColor}
              //data = {this.getDaysOfYear()}
              data={this.state.dataPoints.slice(-numDaysToFetch, -1)}
              hideColorLegend={false}
              hideTotalCount={true}
              showWeekdayLabels={true}
              labels={{
                legend: {
                  less: 'Less',
                  more: 'More',
                },
                months: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                totalCount: '{{count}} days of 8+ hours sleep in {{year}}',
                weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              }}
              theme={mytheme}
            ></ActivityCalendar>
          )}
        </div>
      </div>
    )
  }
}

export default Habit