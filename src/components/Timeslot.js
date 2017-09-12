import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import cx from 'classnames'
import 'twix'
import 'font-awesome/css/font-awesome.css'
import { DayPickerSingleDateController } from 'react-dates'
import _ from 'lodash'

const getPeriodIcon = period => {
  if (period === 'morning') {
    return 'coffee'
  } else if (period === 'afternoon') {
    return 'sun-o'
  }

  return 'moon-o'
}

export const createTimeSlots = (start, end) => {
  let slots = []
  const iterator = start.twix(end).iterate(1, 'hour')

  do {
    slots.push(iterator.next())
  } while (iterator.hasNext())

  // Remove the last timeslot (that is not bookable)
  return slots.slice(0, -1)
}

const getHumanTimePeriod = mDate => {
  let result = null

  if (!mDate || !mDate.isValid()) {
    return
  }

  const splitAfternoon = 12
  const splitEvening = 17
  const hour = parseFloat(mDate.format('HH'))

  if (hour >= splitAfternoon && hour <= splitEvening) {
    result = 'afternoon'
  } else if (hour >= splitEvening) {
    result = 'evening'
  } else {
    result = 'morning'
  }

  return result
}

function getDayPeriodSlots (slots) {
  if (!slots) {
    return
  }

  const result = {}

  slots.forEach(slot => {
    const period = getHumanTimePeriod(slot)

    if (!result[period]) {
      result[period] = [slot]
    } else {
      result[period].push(slot)
    }
  })

  return result
}

function getDaySlots (slots) {
  const result = {}

  slots.forEach(({ start, end }) => {
    const mStart = moment(start).utc()
    const mEnd = moment(end).utc()

    const timeSlots = createTimeSlots(mStart, mEnd)

    timeSlots.forEach(timeslot => {
      const day = timeslot.format('ddd')

      if (!result[day]) {
        result[day] = [timeslot]
      } else {
        result[day].push(timeslot)
      }
    })
  })

  return result
}

const today = moment()

const getFirstAvailableStartDate = availableSlots => {
  const firstSlot = _.min(availableSlots.map(({ start }) => moment(start).utc()))
  return moment().utc().isoWeekday(firstSlot.isoWeekday())
}

const uppercaseFirst = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default class Timeslot extends Component {
  static propTypes = {
    availableSlots: PropTypes.arrayOf(PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired
    })).isRequired,
    timezone: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    days: PropTypes.number.isRequired
  }

  static defaultProps = {
    timezone: 'Europe/London',
    days: 2
  }

  constructor (props) {
    super(props)

    this.firstAvailableDate = getFirstAvailableStartDate(props.availableSlots)

    const start = this.firstAvailableDate.clone()
    const end = start.clone().add(props.days, 'days')

    this.state = {
      start,
      end,
      selectedSlot: null,
      openedPeriods: [],
      clickedPeriods: [],
      showDatePicker: false
    }
  }

  handleClickSlot = selectedSlot => () => {
    this.setState({
      selectedSlot
    })

    this.props.onChange(selectedSlot)
  }

  handleClickPrev = () => {
    const { start, end } = this.state

    this.setState({
      start: start.clone().subtract(1, 'day'),
      end: end.clone().subtract(1, 'day')
    })
  }

  handleClickCalendar = () => {
    if (this.state.showDatePicker) {
      return false
    }

    this.setState({
      showDatePicker: true
    })
  }

  handleClickNext = () => {
    const { start, end } = this.state

    this.setState({
      start: start.clone().add(1, 'day'),
      end: end.clone().add(1, 'day')
    })
  }

  handleDatePickerChange = (date) => {
    const { days } = this.props

    const start = date.utc()
    const end = start.clone().add(days, 'days')

    this.setState({
      start,
      end,
      showDatePicker: false
    })
  }

  handleCalendarDayBlocked = date => {
    if (date.isSame(this.firstAvailableDate, 'day')) {
      return false
    }

    return date.isBefore(this.firstAvailableDate)
  }

  handleCalendarOutsideClick = () => {
    this.setState({
      showDatePicker: false
    })
  }

  get header () {
    const { start, selectedSlot, showDatePicker } = this.state

    const isPrevEnabled = !start.isSame(this.firstAvailableDate, 'day')

    return (
      <div className='react-timeslot__header'>
        <div className='react-timeslot__header-label'>
          {selectedSlot ? selectedSlot.toString() : 'Select a timeslot'}
        </div>
        <div className='react-timeslot__header-controls'>
          <button
            onClick={isPrevEnabled && this.handleClickPrev}
            className={cx('react-timeslot__header-control', {
              'react-timeslot__header-control--disabled': !isPrevEnabled
            })}>
            <i className='fa fa-chevron-left' />
          </button>
          <button
            onClick={this.handleClickCalendar}
            className='react-timeslot__header-control'>
            <i className='fa fa-calendar-o' />
            {showDatePicker && (
              <div className='react-timeslot__header-calendar'>
                <DayPickerSingleDateController
                  date={start}
                  onOutsideClick={this.handleCalendarOutsideClick}
                  isDayBlocked={this.handleCalendarDayBlocked}
                  hideKeyboardShortcutsPanel
                  onDateChange={this.handleDatePickerChange} />
              </div>
            )}
          </button>
          <button
            onClick={this.handleClickNext}
            className='react-timeslot__header-control'>
            <i className='fa fa-chevron-right' />
          </button>
        </div>
      </div>
    )
  }

  renderSlot (slot, index, day) {
    const { selectedSlot } = this.state

    const convertedSlotDate = day
      .clone()
      .set({
        minutes: slot.minutes(),
        hours: slot.hours(),
        seconds: 0
      })

    const isSelected = selectedSlot && convertedSlotDate.isSame(selectedSlot)

    return (
      <div
        key={index}
        onClick={this.handleClickSlot(convertedSlotDate)}
        className={cx('react-timeslot__day-slot', {
          'react-timeslot__day-slot--selected': isSelected
        })}>
        <input
          type='radio'
          className='react-timeslot__day-slot-radio'
          checked={isSelected} />
        {slot.format('HH:mm')} - {slot.clone().add(1, 'hour').format('HH:mm')}
      </div>
    )
  }

  togglePeriodHeader = (periodKey, isFirstPeriod) => () => {
    let { openedPeriods, clickedPeriods } = this.state

    if (isFirstPeriod && !clickedPeriods.includes(periodKey)) {
      return this.setState({
        clickedPeriods: [
          ...clickedPeriods,
          periodKey
        ]
      })
    }

    if (openedPeriods.includes(periodKey)) {
      openedPeriods = openedPeriods.filter(k => k !== periodKey)
    } else {
      openedPeriods.push(periodKey)
    }

    this.setState({
      openedPeriods
    })
  }

  renderPeriodicSlots (period, slots, day, firstPeriod) {
    const { openedPeriods, clickedPeriods } = this.state
    const periodKey = `${day.toString()}-${period}`

    if (!slots) {
      return null
    }

    const { selectedSlot } = this.state

    let hasSelectedSlot = false

    if (selectedSlot) {
      slots.forEach(slot => {
        if (selectedSlot.format('HH:mm') === slot.format('HH:mm')) {
          hasSelectedSlot = true
        }
      })
    }

    const isFirstPeriod = period === firstPeriod
    const isOpen = (!clickedPeriods.includes(periodKey) && isFirstPeriod) || openedPeriods.includes(periodKey)

    return (
      <div
        className={cx(`react-timeslot__period`, {
          'react-timeslot__period--is-open': isOpen
        })}>
        <div
          onClick={this.togglePeriodHeader(periodKey, isFirstPeriod)}
          className='react-timeslot__period-header'>
          <div className='react-timeslot__period-header-icon'>
            <i className={`fa fa-${getPeriodIcon(period)}`} />
          </div>
          {uppercaseFirst(period)}&nbsp;-&nbsp;{slots.length} slot{slots.length === 1 ? '' : 's'}
          <div className='react-timeslot__period-header-arrow'>
            <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`} />
          </div>
        </div>
        <div className='react-timeslot__period-slots'>
          {slots.map((slot, index) => this.renderSlot(slot, index, day))}
        </div>
      </div>
    )
  }

  renderSlots (day, slots) {
    if (!slots) {
      return (
        <div className='react-timeslot__day-empty'>
          No available slots
        </div>
      )
    }

    const { morning, afternoon, evening } = getDayPeriodSlots(slots)

    const firstPeriod = morning ? 'morning' : afternoon ? 'afternoon' : 'evening'

    return (
      <div className='react-timelot__dayslots'>
        {this.renderPeriodicSlots('morning', morning, day, firstPeriod)}
        {this.renderPeriodicSlots('afternoon', afternoon, day, firstPeriod)}
        {this.renderPeriodicSlots('evening', evening, day, firstPeriod)}
      </div>
    )
  }

  get days () {
    let { availableSlots } = this.props
    const { start, end } = this.state

    const days = []
    let day = start.clone()

    while (day <= end) {
      days.push(day)
      day = day.clone().add(1, 'd')
    }

    const slots = getDaySlots(availableSlots)

    return (
      <div className='react-timeslot__days'>
        {days.map((day, index) => {
          return (
            <div
              key={index}
              className='react-timeslot__day'>
              <div className='react-timeslot__day-header'>
                <div className='react-timeslot__day-header-name'>
                  {day.format('dddd')}
                </div>
                <div className='react-timeslot__day-header-date'>
                  {day.format('MMMM Do, YYYY')}
                  {day.isSame(today, 'day') && (
                    <span className='react-timeslot__day-today'>
                      &nbsp;(Today)
                    </span>
                  )}
                </div>
              </div>
              <div className='react-timeslot__day-slots'>
                {this.renderSlots(day, slots[day.format('ddd')])}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  render () {
    return (
      <div className='react-timeslot'>
        {this.header}
        {this.days}
      </div>
    )
  }
}
