import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const getPeriodIcon = period => {
  if (period === 'morning') {
    return 'coffee'
  } else if (period === 'afternoon') {
    return 'sun-o'
  }

  return 'moon-o'
}

export default class DayPeriod extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    slots: PropTypes.node.isRequired,
    period: PropTypes.oneOf([
      'morning',
      'afternoon',
      'evening'
    ])
  }

  state = {
    isOpen: this.props.isOpen
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render () {
    const { slots, period } = this.props
    const { isOpen } = this.state

    return (
      <div
        className={cx(`react-timeslot__period`, {
          'react-timeslot__period--is-open': isOpen
        })}>
        <div
          onClick={this.toggle}
          className='react-timeslot__period-header'>
          <div className='react-timeslot__period-header-icon'>
            <i className={`fa fa-${getPeriodIcon(period)}`} />
          </div>
          {slots.length} slot{slots.length === 1 ? '' : 's'}&nbsp;in the {period}
          <div className='react-timeslot__period-header-arrow'>
            <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`} />
          </div>
        </div>
        <div className='react-timeslot__period-slots'>
          {slots}
        </div>
      </div>
    )
  }
}
