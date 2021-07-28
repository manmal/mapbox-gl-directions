import utils from '../utils';
import template from 'lodash.template';
import isEqual from 'lodash.isequal';

const instructionsString = `
<div class='directions-control directions-control-directions'>
  <div class='mapbox-directions-component mapbox-directions-route-summary<% if (routes > 1) { %> mapbox-directions-multiple<% } %>'>
    <% if (routes > 1) { %>
    <div class='mapbox-directions-routes mapbox-directions-clearfix'>
      <% for (var i = 0; i < routes; i++) { %>
        <input type='radio' name='routes' id='<%= i %>' <% if (i === routeIndex) { %>checked<% } %>>
        <label for='<%= i %>' class='mapbox-directions-route'><%= i + 1 %></label>
      <% } %>
    </div>
    <% } %>
    <h1><%- duration %></h1>
    <span><%- distance %></span>
  </div>

  <div class='mapbox-directions-instructions'>
    <div class='mapbox-directions-instructions-wrapper'>
      <ol class='mapbox-directions-steps'>
        <% steps.forEach(function(step) { %>
          <%
            var distance = step.distance ? format(step.distance) : false;
            var icon = step.maneuver.modifier ? step.maneuver.modifier.replace(/\s+/g, '-').toLowerCase() : step.maneuver.type.replace(/\s+/g, '-').toLowerCase();

            if (step.maneuver.type === 'arrive' || step.maneuver.type === 'depart') {
              icon = step.maneuver.type;
            }

            if (step.maneuver.type === 'roundabout' || step.maneuver.type === 'rotary') {
              icon= 'roundabout';
            }

            var lng = step.maneuver.location[0];
            var lat = step.maneuver.location[1];
          %>
          <li
            data-lat='<%= lat %>'
            data-lng='<%= lng %>'
            class='mapbox-directions-step'>
            <span class='directions-icon directions-icon-<%= icon %>'></span>
            <div class='mapbox-directions-step-maneuver'>
              <%= step.maneuver.instruction %>
            </div>
            <% if (distance) { %>
              <div class='mapbox-directions-step-distance'>
                <%= distance %>
              </div>
            <% } %>
          </li>
        <% }); %>
      </ol>
    </div>
  </div>
</div>
`;

const errorString = `
<div class='directions-control directions-control-directions'>
  <div class='mapbox-directions-error'>
    <%= error %>
  </div>
</div>
`

let instructionsTemplate = template(instructionsString);
let errorTemplate = template(errorString);

/**
 * Summary/Instructions controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @param {Object} map The mapboxgl instance
 * @private
 */
export default class Instructions {
  constructor(el, store, actions, map) {
    this.container = el;
    this.actions = actions;
    this.store = store;
    this._map = map;
    this.directions = {};
    this.render();
  }

  render() {
    this.store.subscribe(() => {
      const { hoverMarker, setRouteIndex } = this.actions;
      const { routeIndex, unit, directions, error, compile } = this.store.getState();
      const shouldRender = !isEqual(directions[routeIndex], this.directions);

      if (error) {
        this.container.innerHTML = errorTemplate({ error });
        return;
      }

      if (directions.length && shouldRender) {
        const direction = this.directions = directions[routeIndex];

        if (compile) {
          direction.legs.forEach(function (leg) {
            leg.steps.forEach(function (step) {
              step.maneuver.instruction = compile('en', step);
            });
          });
        }

        this.container.innerHTML = instructionsTemplate({
          routeIndex,
          routes: directions.length,
          steps: direction.legs[0].steps, // Todo: Respect all legs,
          format: utils.format[unit],
          duration: utils.format[unit](direction.distance),
          distance: utils.format.duration(direction.duration)
        });

        const steps = this.container.querySelectorAll('.mapbox-directions-step');

        Array.prototype.forEach.call(steps, (el) => {
          const lng = el.getAttribute('data-lng');
          const lat = el.getAttribute('data-lat');

          el.addEventListener('mouseover', () => {
            hoverMarker([lng, lat]);
          });

          el.addEventListener('mouseout', () => {
            hoverMarker(null);
          });

          el.addEventListener('click', () => {
            this._map.flyTo({
              center: [lng, lat],
              zoom: 16
            });
          });
        });

        const routes = this.container.querySelectorAll('input[type="radio"]');
        Array.prototype.forEach.call(routes, (el) => {
          el.addEventListener('change', (e) => { setRouteIndex(parseInt(e.target.id, 10)); });
        });
      } else if (this.container.innerHTML && shouldRender) {
        this.container.innerHTML = '';
      }
    });
  }
}
