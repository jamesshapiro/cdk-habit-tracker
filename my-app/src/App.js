//aws cloudfront create-invalidation --distribution-id E70XD704NPJDM --paths "/*"
//aws s3 cp --recursive build/ s3://cdkhabits-habitsweakerpotionscombucketdff06391-116yh481gtpp6
import './App.css';
import React from 'react'
import Habit from './components/Habit/Habit'

import { Amplify, Auth } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

import awsExports from './aws-exports'
Amplify.configure(awsExports)

async function signOut() {
  try {
    await Auth.signOut()
    window.location.reload(false)
  } catch (error) {
    console.log('error signing out: ', error)
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      habits: [],
      isMounted: false,
      isLoginPage: false,
      isInEditHabitsMode: false,
      newHabit: '',
    }
  }

  handleChange(i, event) {
    let habits = [...this.state.habits]
    habits[i] = event.target.value
    this.setState({ newHabit: event.target.value })
  }

  get_pk1_habit_name(habitName) {
    return habitName.toLowerCase().split(/\s+/).join('-')
  }

  addClick = () => {
    let habits = [...this.state.habits]
    let newHabit = this.state.newHabit
    habits.push({
      habitName: this.get_pk1_habit_name(newHabit),
      habitDisplayName: newHabit,
      habitColor: '#b92514',
      habitPriority: 0,
    })
    if (newHabit.length > 2) {
      this.setState({ newHabit: '', habits })
    }
  }

  removeClick(i) {
    let values = [...this.state.habits]
    values[i].deletePlanned = true
    // values.splice(i, 1)
    this.setState({ habits: values })
  }

  unremoveClick(i) {
    let values = [...this.state.habits]
    values[i].deletePlanned = false
    this.setState({ habits: values })
  }

  handleSubmit = (event) => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        const token = user.signInUserSession.idToken.jwtToken
        const headers = {
          'Content-Type': 'application/json',
          Authorization: token,
        }
        event.preventDefault()
        const url = process.env.REACT_APP_GET_HABITS_AUTH_URL
        const data = this.state.habits
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data),
        }).then((response) => {
          this.setState({
            entries: [],
            exclusiveStartKey: '',
            showEntries: true,
            values: [''],
          })
          this.getNewEntries()
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  createUI = () => {
    return (
      <table>
        <tbody>
          {this.state.habits.map((el, i) => (
            <tr key={i}>
              <td className="td-existing-habit">
                <div>
                  {el.deletePlanned ? (
                    <span className="to-delete">{el.habitDisplayName}</span>
                  ) : (
                    el.habitDisplayName
                  )}
                </div>
              </td>
              <td className="td-button">
                {el.deletePlanned ? (
                  <div
                    type="button"
                    className="bullet-button"
                    onClick={this.unremoveClick.bind(this, i)}
                  >
                    ➕
                  </div>
                ) : (
                  <div
                    type="button"
                    className="bullet-button"
                    onClick={this.removeClick.bind(this, i)}
                  >
                    ❌
                  </div>
                )}
              </td>
            </tr>
          ))}
          <tr key={this.state.habits.length}>
            <td className="td-textarea">
              <input
                placeholder={'Ex. "Get 8+ hours of sleep"'}
                className="bullet-textarea"
                onChange={this.handleChange.bind(
                  this,
                  this.state.habits.length
                )}
              />
            </td>
            <td className="td-button">
              <div
                type="button"
                className="bullet-button"
                onClick={this.addClick.bind(this)}
              >
                ➕
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  enterEditHabitsMode = () => {
    this.setState({ isInEditHabitsMode: true })
  }

  exitEditHabitsMode = () => {
    this.setState({ isInEditHabitsMode: false })
  }

  getNewEntries = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        const token = user.signInUserSession.idToken.jwtToken
        const headers = {
          'Content-Type': 'application/json',
          Authorization: token,
        }
        const url = process.env.REACT_APP_GET_HABITS_AUTH_URL
        fetch(url, {
          method: 'GET',
          headers: headers,
        })
          .then((response) => response.json())
          .then((data) => {
            const habitItems = data.map((item) => {
              return {
                habitDisplayName: item.DISPLAY_NAME.S,
                habitName: item.SK1.S.slice(6),
                habitColor: item.COLOR.S,
                habitPriority: parseInt(item.PRIORITY.S),
              }
            })
            const newState = {
              habits: [...habitItems],
              isMounted: true,
              isLoginPage: false,
            }
            this.setState(newState)
          })
      })
      .catch((err) => {
        const habits = [
          {
            habitName: 'clean-for-10m',
            habitDisplayName: 'Clean for 10m',
            habitColor: '#b92514',
            habitPriority: 100,
          },
          {
            habitName: 'get-8h-of-sleep',
            habitDisplayName: 'Get 8h of sleep',
            habitColor: '#2270A1',
            habitPriority: 99,
          },
          {
            habitName: 'stay-hydrated',
            habitDisplayName: 'Stay Hydrated',
            habitColor: '#1e4500',
            habitPriority: 98,
          },
          {
            habitName: 'read-for-30m',
            habitDisplayName: 'Read for 30m',
            habitColor: '#b92514',
            habitPriority: 97,
          },
          {
            habitName: 'exercise',
            habitDisplayName: 'Exercise',
            habitColor: '#2270A1',
            habitPriority: 96,
          },
        ]
        var newState = {
          habits: habits,
          isMounted: true,
          isLoginPage: false,
        }
        this.setState(newState)
        return
      })
  }

  getHabitGraphs = () => {
    return (
      <div className="habit-graphs">
        {this.state.habits.map((habit) => {
          return <Habit habit={habit} />
        })}
      </div>
    )
  }

  getEditHabitsUI = () => {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.createUI()}
        <input type="submit" value="Submit" />
      </form>
    )
  }

  componentDidMount() {
    this.getNewEntries()
  }

  goToLogin = () => {
    let newState = {
      isLoginPage: true,
    }
    this.setState(newState)
  }

  getIsLoggedIn = () => {
    let userIsLoggedIn = false
    Object.keys(localStorage).map((key) => {
      if (
        key.startsWith('CognitoIdentityServiceProvider') &&
        key.endsWith('LastAuthUser')
      ) {
        userIsLoggedIn = true
      }
    })
    return userIsLoggedIn
  }

  getGraphsForUser = () => {
    return (
      <div>
        <div className="App">
          <div className="habit-h1">
            {!this.state.isInEditHabitsMode && 'Habit Tracker'}
            {!this.getIsLoggedIn() && (
              <button onClick={this.goToLogin}>Login/Signup</button>
            )}
            {this.getIsLoggedIn() && (
              <button onClick={() => signOut()}>Signout</button>
            )}
            {this.getIsLoggedIn() && !this.state.isInEditHabitsMode && (
              <button onClick={() => this.enterEditHabitsMode()}>
                Edit Habits
              </button>
            )}
            {this.getIsLoggedIn() && this.state.isInEditHabitsMode && (
              <button onClick={() => this.exitEditHabitsMode()}>
                Back to Grid!
              </button>
            )}
          </div>
          <h1 className="habit-h1">{}</h1>
          {this.state.isMounted &&
            !this.state.isInEditHabitsMode &&
            this.getHabitGraphs()}
          {this.state.isMounted &&
            this.state.isInEditHabitsMode &&
            this.getEditHabitsUI()}
        </div>
      </div>
    )
  }

  getFrontPage = () => {
    if (this.state.isLoginPage) {
      return (
        <Authenticator>
          {() => {
            this.setState({ isLoginPage: false })
            window.location.reload(false)
            return this.getGraphsForUser()
          }}
        </Authenticator>
      )
    } else {
      return this.getGraphsForUser()
    }
  }

  render() {
    return this.getFrontPage()
  }
}

export default App;
