import React, { Component, PropTypes } from 'react';
import Input from './shared/input';

export default class Inputs extends Component {

  constructor() {
    super();
  }

  shouldRefresh(refresh) {
    // Using setTimeout to wait on existing state dispatch.
    if (refresh) window.setTimeout(() => { this.props.clearRefresh(); }, 0);
    return refresh;
  }

  changeMode(e) {
    var mode = e.target.id.split('-').pop();
    this.props.directionsMode(mode);
  }

  render() {
    const { data } = this.props;

    return (
      <div className='mapbox-directions-component mapbox-directions-inputs'>

        <div className='mapbox-directions-origin'>
          <label className='mapbox-form-label'>
            <span className='directions-icon directions-icon-depart'></span>
          </label>
          <Input
            onChange={this.props.queryOrigin}
            onClear={this.props.clearOrigin}
            onFeature={this.props.addOrigin}
            refreshValue={this.shouldRefresh(data.refresh)}
            value={data.originQuery}
            results={data.originResults}
            placeholder='Choose a starting place'
          />
        </div>

        <button
          className='directions-icon directions-icon-reverse directions-reverse'
          title='Reverse origin &amp; destination'
          onClick={this.props.reverseInputs}>
        </button>

        <div className='mapbox-directions-destination'>
          <label className='mapbox-form-label'>
            <span className='directions-icon directions-icon-arrive'></span>
          </label>
          <Input
            onChange={this.props.queryDestination}
            onClear={this.props.clearDestination}
            onFeature={this.props.addDestination}
            refreshValue={this.shouldRefresh(data.refresh)}
            value={data.destinationQuery}
            results={data.destinationResults}
            placeholder='Choose destination'
          />
        </div>

        <div className='mapbox-directions-profile'>
          <input
            type='radio'
            name='profile'
            checked={data.mode === 'driving'}
            onChange={this.changeMode.bind(this)}
            id='mapbox-directions-profile-driving'
          />
          <label htmlFor='mapbox-directions-profile-driving'>Driving</label>
          <input
            type='radio'
            name='profile'
            checked={data.mode === 'walking'}
            onChange={this.changeMode.bind(this)}
            id='mapbox-directions-profile-walking'
          />
          <label htmlFor='mapbox-directions-profile-walking'>Walking</label>
          <input
            type='radio'
            name='profile'
            checked={data.mode === 'cycling'}
            onChange={this.changeMode.bind(this)}
            id='mapbox-directions-profile-cycling'
          />
          <label htmlFor='mapbox-directions-profile-cycling'>Cycling</label>
        </div>
      </div>
    );
  }
}

Inputs.propTypes = {
  addOrigin: PropTypes.func.isRequired,
  addDestination: PropTypes.func.isRequired,
  clearDestination: PropTypes.func.isRequired,
  clearOrigin: PropTypes.func.isRequired,
  clearRefresh: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  directionsMode: PropTypes.func.isRequired,
  queryDestination: PropTypes.func.isRequired,
  queryOrigin: PropTypes.func.isRequired,
  reverseInputs: PropTypes.func.isRequired
};
