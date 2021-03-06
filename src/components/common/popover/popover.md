@page components/common/popover popovers and tooltips
@parent components.generic 5

@link ../src/components/common/popover/popover.html Full Page Demo

This component uses Bootrap [tooltip.js](http://getbootstrap.com/javascript/#tooltips) and [popover.js](http://getbootstrap.com/javascript/#popovers).

Use the following attributes on a control:
  <ul>
    <li><code>data-toggle</code> to set the display as a <code>tooltip</code> or a <code>popover</code>.</li>
    <li><code>title</code> to pass the message inside of your tooltip. or a title in a popover.</li>
    <li><code>data-placement</code> to set the tooltip display to <code>top | bottom | left | right | auto</code>.</li>
    <li><code>data-content</code> to pass the message on a popover.
  </ul>

  <strong>Requires</strong> to import <code>utils/stache-helpers/</code> and <code>bootstrap/dist/js/bootstrap</code>.

## Example

@demo src/components/common/popover/popover.html
