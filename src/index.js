import React from 'react'
import { render } from 'react-dom'
import Timeslot from './components/Timeslot'

import 'sanitize.css'
import './styles/Dev.scss'
import './styles/Timeslot.scss'

const rootElement = document.getElementById('root')

const availableSlots = [{
  start: '2014-06-12T05:00:00.000Z',
  end: '2014-06-12T13:00:00.000Z'
}, {
  start: '2014-06-14T12:00:00.000Z',
  end: '2014-06-14T19:00:00.000Z'
}]

const onChange = () => {
  console.log('changed...')
}

render((
  <Timeslot
    availableSlots={availableSlots}
    onChange={onChange} />
),
rootElement
)
