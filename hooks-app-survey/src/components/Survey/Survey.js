//############## PROD ################
//PROD: aws s3 cp --recursive build/ s3://cdkhabits-surveygithabitcombucket4f6ffd5a-1mwnd3a635op9
//PROD: aws cloudfront create-invalidation --distribution-id E8P5WYSXZ0IWD --paths "/*"
// npm run build && aws s3 cp --recursive build/ s3://cdkhabits-surveygithabitcombucket4f6ffd5a-1mwnd3a635op9 && aws cloudfront create-invalidation --distribution-id E8P5WYSXZ0IWD --paths "/*"
//############## DEV ################
//DEV: aws s3 cp --recursive build/ s3://cdkhabits-habitssurveyweakerpotionscombucket15fc8-19lebhcy753i2
//DEV: aws cloudfront create-invalidation --distribution-id E2I2LGCAG9S89X --paths "/*"

import React from 'react';
import useSWR from 'swr';
import RatingBox from '../RatingBox';
import * as style from './Survey.module.css';

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
})
const token = params.token
const ENDPOINT = process.env.REACT_APP_SURVEY_URL + `?token=${token}`
const POST_ENDPOINT = process.env.REACT_APP_SURVEY_URL
let date_string = params.date_string
const dd = date_string.slice(-2)
const mm = date_string.slice(5, 7)
const yyyy = date_string.slice(0, 4)
const dateString = `${mm}-${dd}-${yyyy}`

function formatDate(dateString) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parts = dateString.split("-");
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  return `${months[month]} ${day}, ${year}`;
}

const formattedDateString = formatDate(dateString)

async function fetcher(endpoint) {
  const response = await fetch(endpoint);
  const json = await response.json();
  return json;
}

function Survey() {
  const { data, isLoading } = useSWR(ENDPOINT, fetcher);
  const [ratings, setRatings] = React.useState({});
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);

  const handleRatingChange = (id, newRating) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [id]: newRating,
    }));
  };

  const handleSubmit = () => {
    // Shorter because skipping githabit
    const allRated = Object.keys(ratings).length >= data.slice(1).length;
    result = {}
    result['token'] = token
    if (!allRated) {
      setAttemptedSubmit(true);
    } else {
      const dataPoints = {}
      data.forEach((item, idx) => {
        if (item.SK1.S === "HABIT#commit-to-github") {
          return
        }
        dataPoints[item.SK1.S.replace("HABIT#", "")] = parseInt(ratings[idx-1])
      })
      result['data_points'] = dataPoints
      fetch(POST_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(result),
      })
      setTimeout(() => {
        window.location.href = 'https://githabit.com'
      }, 1200)
    }
  };

  if (data) {
    return <div className={style.surveyContainer}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
      <div
        className={style.header}
      >{formattedDateString} Habits</div>
      {data.slice(1).map((habit, index) => 
        <RatingBox 
          key={index}
          id={index}
          category={habit.DISPLAY_NAME.S}
          onRatingChange={handleRatingChange}
          attemptedSubmit={attemptedSubmit} 
        >
            {habit}
        </RatingBox>)}
      <button 
      className={style.submitButton}
      onClick={handleSubmit}>Submit</button>
      </form>
    </div>;
  }

  return <div>Loading...</div>;
}

export default Survey;



